const User = require("../models/User");
// const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto")

//resetPasswordToken
exports.resetPasswordToken = async(req,res)=>{
    try{
        //get Email from req body
        const email = req.body.email;
        //check user for the email , email validation
        const user = await User.findOne({email:email});
        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"Your Email is not registered with us",
            })
        }
        //generate token
        const token = crypto.randomBytes(20).toString("hex")
        //Update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
                                {email:email},
                                {
                                    token:token,
                                    resetPasswordExpires: Date.now() + 5*60*1000,
                                },
                                {new:true});
        console.log("DETAILS",updatedDetails);
        //create URL
        const url = `http://localhost:3000/upadte-password/${token}`;

        //send mail containing that url
        await mailSender(email,"Password Reset",
        `Your Link for email verification is ${url}. Please click this url to reset your password.`);
        //Return response
        return res.status(200).json({
            success:true,
            message:"Email sent successfully, Please check email and change password",
        })
    } catch(err)
    {
        console.log(err);
        return res.status(400).json({
            success:false,
            message:"Something went wrong while sending reset pwd mail",
        })
    }
}
//resetPassword
exports.resetPassword = async(req,res)=>{
    try{
        //Data fetch
        const{password , confirmPassword , token} = req.body;
        //Validation
        if(password!==confirmPassword)
        {
            return res.status(401).json({
                success:false,
                message:"Password not matching"
            })
        }
        //get Userdetails from db using token
        const userDetails = await User.findOne({ token:token });
        //if no entry - Ivalid Token
        if(!userDetails)
        {
            return res.status(401).json({
                success:false,
                message:"Token is invalid",
            })
        }
        //Token time check
        if(userDetails.resetPasswordExpires > Date.now())
        {
            return res.json({
                success:false,
                message:"Token is expired, please regenerate your token",
            })
        }
        //hash pwd
        const hashedPassword = await bcrypt.hash(password,10);
        //Password update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true}
        )
        return res.status(200).json({
            success:true,
            message:"Password reset successfully",
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong in updating the password"
        })
    }
}