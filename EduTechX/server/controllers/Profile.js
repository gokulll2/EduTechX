const User = require("../models/User");
const Profile = require("../models/Profile");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const Course = require("../models/Course");

exports.updatedProfile = async(req,res)=>{
    try{
        //get Data
        const { dateOfBirth="" , about="" , gender , contactNumber } = req.body;
        //get user ID
        const id = req.user.id;  // Got this from auth.js Decode vale se
        //Validation
        if(!contactNumber || !gender || !id)
        {
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        //find Profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        //Update Profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        //return res
        return res.status(200).json({
            success:true,
            message:"Profile data upadted Successfully",
            profileDetails
        })
    } catch(error)
    {
        return res.status(500).json({
            success:false,
            message:"error.message",
            error:error.message,
        })
    }
}

//deleteAccount
exports.deleteAccount = async(req,res)=>{
    try{
        //get user id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails)
        {
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
        //delete the profile first
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails})
        //Todo:Unenroll the students from all the enrolled Courses
        //Delete the user
       await User.findByIdAndDelete({_id:id});
        //return response
        return res.status(200).json({
            success:true,
            message:"User Deleted Successfully",
        })
    } catch(error)
    {
        return res.status(500).json({
            success:false,
            message:"User cannot be deleted successfully",
        })
    }
}
exports.getAllUserDetails = async(req,res)=>{
    try{
        //get the user id
        const id = req.user.id
        //validation and get user details
         const userDetails = User.findById(id).populate("additionalDetails").exec();
        //return response
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully",
            data:userDetails,
        })
    } catch(error)
    {
        return res.status(500).json({
            success:false,
            message:"Failed in getting the User's details"
        })
    }
}
exports.updateDisplayPicture = async (req,res)=>{
    try{
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000,
        )
        console.log(image);
        const updatedProfile = await Profile.findByIdAndUpdate(
            {_id:userId},
            {image:image.secure_url},
            {new:true},
        )
        res.send({
            success:true,
            message:`Image Updated Successfully`,
            data:updatedProfile,
        })
    } catch(error)
    {
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
exports.getEnrolledCourses = async (req,res)=>{
    try {
        const userId = req.user.id
        let userDetails = await User.findOne({
          _id: userId,
        })
          .populate({
            path: "courses",
            populate: {
              path: "courseContent",
              populate: {
                path: "subSection",
              },
            },
          })
          .exec()
  
        userDetails = userDetails.toObject()
        var SubsectionLength = 0
        for (var i = 0; i < userDetails.courses.length; i++) {
          let totalDurationInSeconds = 0
          SubsectionLength = 0
          for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
            totalDurationInSeconds += userDetails.courses[i].courseContent[
              j
            ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
            userDetails.courses[i].totalDuration = convertSecondsToDuration(
              totalDurationInSeconds
            )
            SubsectionLength +=
              userDetails.courses[i].courseContent[j].subSection.length
          }
          let courseProgressCount = await CourseProgress.findOne({
            courseID: userDetails.courses[i]._id,
            userId: userId,
          })
          courseProgressCount = courseProgressCount?.completedVideos.length
          if (SubsectionLength === 0) {
            userDetails.courses[i].progressPercentage = 100
          } else {
            // To make it up to 2 decimal point
            const multiplier = Math.pow(10, 2)
            userDetails.courses[i].progressPercentage =
              Math.round(
                (courseProgressCount / SubsectionLength) * 100 * multiplier
              ) / multiplier
          }
        }
    
        if (!userDetails) {
          return res.status(400).json({
            success: false,
            message: `Could not find user with id: ${userDetails}`,
          })
        }
        return res.status(200).json({
          success: true,
          data: userDetails.courses,
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        })
      }
}
exports.instructorDashboard = async (req,res)=>{
    try{
        const courseDetails = await Course.find({instructor:req.user.id});
        const courseData = courseDetails.map((course)=>{
            const totalStudentsenrolled = course.studentsEnrolled.length
            const totalAmountGenerated = totalStudentsenrolled*course.price

            const courseDataWithStats = {
                _id:course._id,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                totalStudentsenrolled,
                totalAmountGenerated,
            }
            return courseDataWithStats
        })
        return res.status(200).json({
            success:true,
            courses:courseData,
        })
    }catch(err){
        console.log(err);
        return res.status(404).json({
            success:false,
            message:"Internal Server Error",
        })
    }
}