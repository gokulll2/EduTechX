const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req,res) =>{
    try{
        //Data fetch from the body
        const {sectionName , courseId} = req.body;
        //Data Validation
        if(!sectionName || !courseId)
        {
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            })
        }
        //Create Section
        const newSection = await Section.create({sectionName});
        //Update the Course with section objectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                          courseId,
                                          {
                                            $push:{
                                                courseContent:newSection._id
                                            }
                                          },
                                          {new:true},
                                                            )
        //HW: use populate to replace section and sub-sections both in the updatedCourseDetails
        //Return Response
        return res.status(200).jsoN({
            success:true,
            message:"New section Added Successfully",
            updatedCourseDetails,
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:"Unable to create section, please try again",
            Error:error.message,
        })
    }
}
