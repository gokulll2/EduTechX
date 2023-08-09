const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator =require("otp-generator");
const Profile = require("../models/Profile")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();
//SendOTP
exports.sendotp = async (req,res)=>{
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
        console.log("Result is generate OTP func");
        console.log("OTP" , otp);
        console.log("Result" , result)
        while(result)
        {
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
            });
        }
        const otpPayload = {email,otp};
        const otpBody = await OTP.create(otpPayload);
        console.log("OTP BODY",otpBody);
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
exports.signup = async(req,res)=>{
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
        else if(otp !== recentOtp[0].otp)
        {
            //Invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            })
        }
        //hash passoword
        const hashedPassword = await bcrypt.hash(password,10);
        //Create The user
        let approved = "";
        approved ==="Instructor" ? (approved = false) : (approved = true);
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
            approved:approved,
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
exports.login = async(req,res)=>{
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
                expiresIn:"24h",
            });
            user.token = token;
            user.password = undefined;
            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
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
exports.changepassword = async(req,res)=>{
    try{
          //get Data from req ki body 
    const userDetails = await User.findById(req.user.id);
    //get oldPassword, newPassword , confirmPassword
    const {oldPassword , newPassword , confirmPassword} = req.body;
    //Validate oldPassword
    const isPasswordMatch = await bcrypt.compare(
         oldPassword,
         userDetails.password
    );
    //if Old Password don't match
    if(!isPasswordMatch)
    {
        return res.status(401).json({
            success:false,
            message:"The password is incorrect"
        })
    }
    //Match new password and confirm Password
    if(newPassword!==confirmPassword)
    {
        return res.status(400).json({
            success:false,
            message:"The password and Confirm password  don't match",
        })
    }
    //Update Password in DB
    const encryptedPassword = bcrypt.hash(newPassword,10);
    const updatedUserDetails = User.findByIdAndUpdate(
          req.user.id,
          {password:encryptedPassword},
          {new:true}
    )
    //Send Mail - Password Updated
    try{
        const emailResponse = await mailSender(
            updatedUserDetails.email,
            passwordUpdated(
                updatedUserDetails.email,
                `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
            )
        );
        console.log("Email sent successfully",emailResponse)
    } catch(error){
        //If there is an error sending the email ,  log the error and return a 500 (Internal Server Error) error
        console.log("Error occurred while sending email:", error);
        return res.status(404).json({
            success:false,
            message:"Error occurred while sending email",
            error:error.message,
        })
    }
    //return Response
    return res.status(200).json({
        success:true,
        message:"Password updated successfully",
    })
    } catch(error){
        //If there is an error updating the password , log the error and return a 500 (Internal Server Error)
        return res.status(500).json({
            success:false,
            message:"Error occurred while updating password",
            error:error.message,
        })
    }
};