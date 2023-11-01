const express = require("express");
const router = express.Router();

const {auth, isInstructor} = require("../middlewares/auth");
const {deleteAccount , updatedProfile , getAllUserDetails , updateDisplayPicture , getEnrolledCourses , instructorDashboard} = require("../controllers/Profile");

//****************************PROFILE ROUTES**************** */

//Delete User Account
router.delete("/deleteProfile" , auth , deleteAccount)
router.put("/updateProfile" , auth , updatedProfile);
router.get("/getUserDetails" , auth , getAllUserDetails);
//Get Enrolled Courses
router.get("/getEnrolledCourses" , auth , getEnrolledCourses);
router.put("/updateDisplayPicture" , auth , updateDisplayPicture);
router.get("/instructorDashboard" , auth , isInstructor , instructorDashboard)
module.exports = router;