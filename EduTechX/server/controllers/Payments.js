const { default: mongoose } = require("mongoose");
const {instance} = require("../config/razorpay")
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender")
require("dotenv").config();
const crypto = require("crypto")
const courseEnrollmentEmail = require("../mail/templates/courseEnrollmentEmail")

//capture the payment and inititate the razorpay order
exports.capturePayment = async (req,res)=>{
    const {courses} = req.body;
    const userId = req.user.id;
    if(courses.length===0)
    {
        return res.json({
            success:false,
            message:"Please provide Course Id",
        })
    }
    let totalAmount=0;

    for(const course_id of courses)
    {
        let course;
        try{
            course = await Course.findById(course_id)
            if(!course)
            {
                return res.status(200).json({
                    success:false,
                    message:"Could not find the course"
                })
            }
            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid))
            {
                return res.status(200).json({
                    status:false,
                    message:"Student is alreadt enrolled",
                })
            }
            totalAmount+=course.price; 
        }
        catch(err)
        {
            console.log(err);
            return res.status(404).json({
                success:false,
                message:err.message,
            })
        }
    }
    const options = {
        amount:totalAmount*100,
        currency:"INR",
        receipt:Math.random(Date.now()).toString(),
    }
    try{
        const paymentResponse = await instance.orders.create(options)
        res.json({
            success:true,
            message:paymentResponse,
        })
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Could not initate order",
        })
    }
}

//Verify signature of Razorpay and server
exports.verifyPayment = async(req,res)=>{
   const razorpay_order_id = req.body?.razorpay_order_id;
   const razorpay_payment_id = req.body?.razorpay_payment_id;
   const razorpay_signature = req.body?.razorpay_signature;
   const courses = req.body?.courses;
   const userId = req.user.id; 

   if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId)
   {
    return res.status(200).json({
        success:false,
        message:"Payment failed",
    })
   }
   let body = razorpay_order_id + "|" + razorpay_payment_id;
   const expectedSignature = crypto
       .createHmac("sha256",process.env.RAZORPAY_SECRET)
       .update(body.toString())
       .digest("hex");
    
    if(expectedSignature === razorpay_signature)
    {
        //enrolling student into the course
        await enrollStudents(courses,userId,res);

        return res.status(200).json({
            success:true,
            message:"Payment verified"
        })
    }
    return res.status(200).json({
        success:false,
        message:"Payment Failed",
    })
};

const enrollStudents = async(courses,userId,res) =>{
try{
    if(!courses || !userId || !res){
        return res.status(400).json({
            success:false,
            message:"Please provide data for Courses or UserId",
        })
    }
    for(const courseId of courses)
    {
        const enrolledCourses = await Course.findByIdAndUpdate(
            {_id:courseId},
            {$push:{studentsEnrolled:userId}},
            {new:true}
        )
        if(!enrolledCourses)
        {
            return res.status(500).json({
                success:false,
                message:"Error finding the course"
            })
        }
        //find the student and add this course into their courses list
        const enrolledStudent = await User.findByIdAndUpdate(
            userId,
            {$push:{courses:courseId}},
            {new:true},
        )
        //send confirmation mail to the student too
        const emailResponse =await mailSender(
            enrollStudents.email,
            `Successfully enrolled into ${enrolledCourses.courseName}`,
            courseEnrollmentEmail(enrolledCourses.courseName , `${enrolledStudent.firstName}`)
        )
    }
} catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:error.message,
    })
}
}
exports.sendPaymentSuccessEmail = async(req, res) => {
    const {orderId, paymentId, amount} = req.body;

    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({success:false, message:"Please provide all the fields"});
    }

    try{
        //student ko dhundo
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Recieved`,
             paymentSuccessEmail(`${enrolledStudent.firstName}`,
             amount/100,orderId, paymentId)
        )
    }
    catch(error) {
        console.log("error in sending mail", error)
        return res.status(500).json({success:false, message:"Could not send email"})
    }
}
