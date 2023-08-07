const express = require("express");
const router = express.Router();

//Import the required controllers and middleware functions
const{
    login,
    signup,
    sendotp,
    changepassword
} = require("../controllers/Auth");
const{
    resetPasswordToken,
    resetPassword,
} = require("../controllers/ResetPassword");
const {auth} = require("../middlewares/auth");
//Routes for Login , SignUp and Authentication

//*****************************Authentication Routes **********************/
//route for user login
router.post("/login",login);
//route for user signup
router.post("/signup",signup);
//route for sending otp to the user's email
router.post("/sendotp",sendotp);
//route for changing the password
router.post("/changepassword",changepassword);

//*********************Reset Passoword*****************
//router for generating a reset password token
router.post("/reset-password-token" , resetPasswordToken);
//router for ressetting user's password after verification
router.post("/resetpassword",resetPassword);
//Export the router for use in the main application
module.exports = router;
