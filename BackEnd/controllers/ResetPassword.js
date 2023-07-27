const User = require("../models/User");
// const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");

//resetPasswordToken
exports.resetPasswordToken = async(req,res)=>{
    try{
        //get Email from req body
        const email = req.body.email;
        //check user for the email , email validation
        const user = await User.findOnde({email:email});
        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"Your Email is not registered with us",
            })
        }
        //generate token
        const token = crypto.randomUUID();
        //Update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
                                {email:email},
                                {
                                    token:token,
                                    resetPasswordExpires: Date.now() + 5*60*1000,
                                },
                                {new:true});
        //create URL
        const url = `http://localhost:3000/upadte-password/${token}`;

        //send mail containing that url
        await mailSender(email,"Password Reset Link",
        `Password Reset Link: ${url}`);
        //Return response
        return res.status(200).json({
            success:true,
            message:"Email sent successfully, Please check email and change password",
        })
    } catch(err)
    {
        console.log(error);
        
    }
}
//resetPassword
