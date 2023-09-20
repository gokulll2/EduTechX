const { default: mongoose } = require("mongoose");
const {instance} = require("../config/razorpay")
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender")


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
        }
        catch(err)
        {

        }
    }
        // //get courseID and userID
        // const {course_id} = req.body;
        // const userID = req.user.id;
        // //validation
        // if(!course_id)
        // {
        //     return res.status(400).json({
        //         success:false,
        //         message:"Please provide valid courseID",
        //     })
        // };
        // //valid CourseDetails
        //  let course;
        //  try{
        //     course = await Course.findById(course_id);
        //     if(!course)
        //     {
        //         return res.status(400).json({
        //             success:false,
        //             message:'Could not find the course',
        //         })
        //     }
        //     //user already pay for the same course
        //     const uid = new mongoose.Types.ObjectId(userID);
        //  if(course.studentsEnrolled.includes(uid)) 
        //  {
        //     return res.status(400).json({
        //         success:false,
        //         message:"Student already registered",
        //     })
        //  } 
        //  } catch(error)
        //  {
        //     console.log(error);
        //     return res.status(400).json({
        //         success:false,
        //         message:error.message,
        //     })
        //  }
        //  //order create
        //  const amount = course.price;
        //  const currency = "INR";
        //  const options = {
        //     amount:amount*100,
        //     currency,
        //     receiptNo:Math.random(Date.now().toString()),
        //     notes:{
        //         courseId:course_id,
        //         userID,
        //     }
        //  }
        //  try{
        //     //initiate the payment using razorpay
        //     const paymentResponse = await instance.orders.create(options);
        //     console.log(paymentResponse);

        //     return res.status(200).json({
        //         success:true,
        //         courseName:course.courseName,
        //         courseDescription:course.courseDescription,
        //         thumbnail:course.thumbnail,
        //         orderId:paymentResponse.id,
        //         currency:paymentResponse.currency,
        //         amount:paymentResponse.amount,
        //      })
        //  } catch(err){
        //     console.log(err);
        //     return res.status(500).json({
        //         success:false,
        //         message:"Could not initiate order",
        //     });
        //  }      
}

//Verify signature of Razorpay and server
exports.verifySignature = async(req,res)=>{
    const webhookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];

   const shahsum =  crypto.createHmac("sha256",webhookSecret);
   shahsum.update(JSON.stringify(req.body)) 
   const digest = shahsum.digest("hex") 
   if(signature === digest)
   {
    console.log("Payment is Authorized")
    const {courseId , userId} = req.body.payload.payment.entity.notes;
    try{
        //fulfil the action

        //find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
                                {_id:courseId},
                                {$push:{studentsEnrolled:userId}},
                                {new:true},
        )
        if(!enrolledCourse)
        {
            return res.status(500).json({
                success:false,
                message:"Course not found",
            })
        }
        //if found, find the student and add the course details in it
        const enrolledStudent = await User.findOneAndUpdate(
                                {_id:userId},
                                {$push:{courses:courseId}},
                                {new:true},
        )
        console.log(enrolledStudent);
        
        //mail send krni ab
        const emailResponse = await mailSender(
                      enrolledStudent.email,
                      "Congratulations from EduTechX",
                      "Congratulations, You are OnBoard with your new course"
        )
        console.log(emailResponse)
        return res.status(200).json({
            success:true,
            message:"Signature verified and Course added",
        })
    } catch(err)
    {
        return res.status(401).json({
            success:false,
            message:err.message,
        })
    }
   }
   else{
     return res.status(400).json({
        success:false,
        message:"Invalid request",
     });
   }


   
};

