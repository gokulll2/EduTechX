const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator =require("otp-generator");
const Profile = require("../models/Profile")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
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
        const otpPayload = {email,otp};
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);
        res.status(200).json({
            success:true,
            message:"OTP sent successfully",otp
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
//sign up
exports.signUp = async(req,res)=>{
    try{
        //data fetch from req ki body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;
        //validate krlo
        if(!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !contactNumber
           || !otp)
           {
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            })
           }
        //2 passwords match krlo
        if(password!==confirmPassword)
        {
            return res.status(400).json({
                success:false,
                message:"Password and ConfirmPassword does not match , Please try again",
            })
        }
        //check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser)
        {
            return res.status(400).json({
                success:false,
                message:"User is already registered",
            })
        }
        //find most recent OTP stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1); 
        console.log(recentOtp);
        //validate otp
        if(recentOtp.length==0)
        {
            //otp not found
            return  res.status(400).json({
                success:false,
                message:"OTP not found",
            })
        }
        else if(otp !== recentOtp.otp)
        {
            //Invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            })
        }
        //hash passoword
        const hashedPassword = await bcrypt.hash(password,10);
        //entry create in Db
        const ProfileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        })
        const user = User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:ProfileDetails._id,
            image:`http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })
        //Return response
        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user,
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User is not registered , Please try again"
        })
    }
}
//login
exports.Login = async(req,res)=>{
    try{
        //get data from req body
         const {email , password} = req.body;
         //validate the data
         if(!email || !password)
         {
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            })
         }
        //user check exist or not
        const user = await User.findOne({email}) //no need of populate 
        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"User is not registered",
            })
        }
        //generate token after macthing the passwords
        const payload = {
            email:user.email,
            id:user._id,
            accountType:user.accountType,
        }
        if(await bcrypt.compare(password,user.password))
        {
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;
            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            req.cookie = ("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully",
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect",
            })
        }
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login failure,Please try again"
        })
    }
}
//ChangePassword
exports.changePassword = async(req,res)=>{
    //get Data from req ki body 
    //get oldPassword, newPassword , confirmPassword
    //Validation
    //Update Password in DB
    //Send Mail - Password Updated
    //return Response
    try{
        
    } catch(error){

    }
}