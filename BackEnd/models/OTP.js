const mongoose = require("mongoose");


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
module.exports = mongoose.model("OTP",OTPschema);