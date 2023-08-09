const Course = require("../models/Course");
const Category = require("../models/Category")
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
require("dotenv").config(); 

//create CourseHandler Function
exports.createCourse = async(req,res)=>{
    try{
      //Get User ID from request object
      const userID = req.user.id;

      //Get all required fields from request body
      let {
        courseName,
        courseDescription,
        whatYouWillLearn,
        price,
        tag,
        category,
        status,
        instructions,
      } = req.body;
      //get all thumbnail image from req files
      const thumbnail = req.files.thumbnailImage;

      //check if any of the required fields are missing
      if(!courseName ||
        !courseDescription ||
        !whatYouWillLearn ||
        !price ||
        !tag ||
        !thumbnail ||
        !category)
        {
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        if(!status || status === undefined)
        {
            status = "Draft";
        }
        //Check if the user is an instructor
        const instructorDetails = await User.findById(userID , {
            accountType:"Instructor",
        });
        if(!instructorDetails)
        {
            return res.status(400).json({
                success:false,
                message:"Instructor Details Not Found",
            })
        }
        //Check if the tag given is valid
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails)
        {
            return res.status(404).json({
                success:false,
                message:"CategoryDetails are not found",
            })
        }
        //Upload the thumbnail Image to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(
            thumbnail,
            process.env.FOLDER_NAME,
        )
        console.log(thumbnailImage);
        //Create a new Course with the given details
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tag,
            category:categoryDetails._id,
            thumbnail: thumbnailImage._id,
            status:status,
            instructions:instructions,
        })
        //Add the new Course to the User Schema of the Instructor,
        await User.findByIdAndUpdate(
            {
                _id:instructorDetails._id
            },
            {
                $push:{
                    courses:newCourse._id,
                },
            },
            {
                new:true,
            }
        )
        //Add the new course to the category
        await Category.findByIdAndUpdate(
            {
                _id:category,
            },
            {
                $push:{
                    course:newCourse._id,
                }
            },
            {
                new:true,
            }
        )
        return res.status(200).json({
            success:true,
            data:newCourse,
            message:"Course Created successfully",
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
exports.getAllCourses = async (req,res)=>{
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
          //.populate("ratingAndreviews")
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
          return res.status(200).json({
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