const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator =require("otp-generator");
//SendOTP
exports.sendOTP = async (req,res)=>{
    try{
        //fetch Email from req ki body
        const {email} = req.body;
        //Check if user already exists
        const checkUserPresent = await User.findOne({email});
        //if user already exist then return a response
        if(checkUserPresent)
        {
            return res.status(401).json({
                success:false,
                message:"User already registered",
            })
        }

        //generate OTP
        var otp = otpGenerator.generate(6,{
            specialChars:false,
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
        });
        console.log("OTP generated:",otp);

        //check unique otp or not
        const result = await OTP.findOne({otp:otp});
        while(result)
        {
            otp = otpGenerator.generate(6,{
                specialChars:false,
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
            });
            result = await OTP.findOne({otp:otp});
        }


    } catch(error){

    }
}
//sign up

//login