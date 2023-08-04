const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
require("dotenv").config(); 

//create CourseHandler Function
exports.createCourse = async(req,res)=>{
    try{
        //fetch data
        const {courseName , courseDescription , whatYouWillLearn , price , tag} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //Validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail)
        {
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        //Check For Instructor 
        const userID = req.user.id
        const instructorDetails = await User.findById(userID);
        console.log("Instructor Details : " , instructorDetails);
        //TODO : verify if the userID and instructorDetails.id are same or not 
        if(!instructorDetails)
        {
            return res.status(404).json({
                success:false,
                message:"Instructor Details Not Found",
            })
        }
        //Check if given tag is valid or not
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails)
        {
            return res.status(404).json({
                success:false,
                message:"Tag details not found",
            })
        }
        //Upload image top Cloudinary
        const uploadCloudinary = await uploadImageToCloudinary(thumbnail , process.env.FOLDER_NAME);

        //Create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        });
        //add the new course to the user schema of the instructor
        await User.findByIdAndUpdate(
          {  _id:instructorDetails._id},
          {
            $push : {
                courses:newCourse._id
            }
          },
          {new:true}
        );
        //Update the tag Schema
        
        //return response 
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse,
        })
    } catch(err)
    {
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to create Course",
            error:err.message,
        })
    }
}
//getAll Courses handler function
exports.showAllCourses = async (req,res)=>{
    try{
        const allCourses = await Course.find({} , {courseName:true,
                                                   price:true,
                                                   thumbnail:true,
                                                  instructor:true,
                                                ratingAndReviews:true,
                                                studentsEnrolled:true
                                            }) .populate("instuctor")
                                            .exec();
        return res.status(200).json({
            success:true,
            message:"Data fetched succesfully",
            data:allCourses,
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch Course Data",
            error:error.message,
        })
    }
}
//get Course Details
exports.getCourseDetails = async (req,res)=>{
    try{
        //get ID
        const {courseId} = req.body;
        //Find the course Details
        const courseDetails = await Course.find(
                              {_id:courseId}
        ).populate(
            {
                path:"instructor",
                populate:{
                    path:"additionalDetails",
                }
            }
          )
          .populate("category")
          .populate("ratingAndreviews")
          .populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            }
          })
          .exec();
          //VAlidation
          if(!courseDetails)
          {
            return res.status(400).json({
                success:false,
                message:`Could not find the course with thw ${courseId}`,
            })
          }
          return res.tatus(200).json({
            success:true,
            message:"Course details fetched successfully",
            data:courseDetails,
          })
    }catch(err)
    {
        console.log(err);
        return res.status(400).json({
            success:false,
            message:err.message,
        })
    }
}