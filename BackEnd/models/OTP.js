const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");


const OTPschema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expiresIn:5*60,
    }
})

// a function -> to send emails
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email , "Verification Email from EduTechX" , otp);
        console.log("Email Sent Successfully: ",mailResponse)
    } catch(error){
        console.log("Error Occurred while sending mails:",error);
        throw error;
    }
}
OTPschema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})
module.exports = mongoose.model("OTP",OTPschema);