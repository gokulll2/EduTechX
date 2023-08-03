const {instance} = require("../config/razorpay")
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender")


//capture the payment and inititate the razorpay order
exports.capturePayment = async (req,res)=>{
    try{
        //get courseID and userID
        const {course_id} = req.body;
        const userID = req.user.id;
        //validation
        if(!course_id)
        {
            return res.status(400).json({
                success:false,
                message:"Please provide valid courseID",
            })
        };
        //valid CourseDetails
         let course;
         try{
            course = await Course.findById(course_id);
            if(!course)
            {
                return res.status(400).json({
                    success:false,
                    message:'Could not find the course',
                })
            }
         } catch(error)
         {

         }
         //user already pay for the same course
         
    } catch(error)
    {

    }
}