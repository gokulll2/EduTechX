const { default: mongoose } = require("mongoose");
const {instance} = require("../config/razorpay")
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender")


//capture the payment and inititate the razorpay order
exports.capturePayment = async (req,res)=>{
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
            //user already pay for the same course
            const uid = new mongoose.Types.ObjectId(userID);
         if(course.studentsEnrolled.includes.uid)
         {
            return res.status(400).json({
                success:false,
                message:"Student already regeistered",
            })
         } 
         } catch(error)
         {
            console.log(error);
            return res.status(400).json({
                success:false,
                message:error.message,
            })
         }
         //order create
         const amount = course.price;
         const currency = "INR";
         const options = {
            amount:amount*100,
            currency,
            receiptNo:Math.random(Date.now().toString()),
            notes:{
                courseId:course_id,
                userID,
            }
         }
         try{
            //initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);

            return res.status(200).json({
                success:true,
                message:"",
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                thumbnail:course.thumbnail,
                orderId:paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
             })
         } catch(err){
            console.log(err);
            return res.status(500).json({
                success:false,
                message:"Could not initiate order",
            });
         }      
}