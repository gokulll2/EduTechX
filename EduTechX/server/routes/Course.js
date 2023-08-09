const express = require("express");
const router = express.Router();

//Import the Controllers

//Course Controllers Import

const {createCourse , getAllCourses , getCourseDetails} = require("../controllers/Course");

//Categories Controllers Import
const {showAllCategories , createCategory , categoryPageDetails} = require("../controllers/Category");

//Sections controllers import
const{createSection , updateSection , deleteSection} = require("../controllers/Section");

//Sub-Sections Controllers Import
const {
    createSubSection,
    updateSubSection,
    deleteSubSection,
} = require("../controllers/Subsection");

//Rating Controllers Import
const {createRating , getAverageRating , getAllRating} = require("../controllers/RatingAndReview");

//Importing MiddleWares 
const {auth , isInstructor , isStudent , isAdmin} = require("../middlewares/auth");
 
//***************Course Routes ***********/
router.post("/createCourse" , auth , isInstructor , createCourse);
router.post("/addSection" ,auth , isInstructor , createSection);
router.post("/updateSection" , auth , isInstructor , updateSection);
router.post("/deleteSection" , auth , isInstructor , deleteSection);
router.post("/addSubSection" ,auth , isInstructor , createSubSection);
router.post("/updateSubSection" , auth , isInstructor , updateSubSection);
router.post("/deleteSubSection" , auth , isInstructor , deleteSubSection);
router.get("/getAllCourses",getAllCourses);
router.post("/getCourseDetails", getCourseDetails)
// ***************************Category Routes ******************
//Category can only be handled by Admin

router.post("/createCategory",auth , isAdmin , createCategory);
router.get("/showAllCategories" ,auth , isAdmin , showAllCategories);
router.get("/getCategoryDetails" , auth ,isAdmin , categoryPageDetails)

//****************************Rating And Reviews******************* */
//Handled By Student
router.post("/createRating" , auth , isStudent , createRating);
router.get("/getAverageRating" , getAverageRating);
router.get("/getReviews" , getAllRating);

module.exports = router;