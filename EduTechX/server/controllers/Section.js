const Section = require("../models/Section");
const Course = require("../models/Course");
const Subsection = require("../models/SubSection")
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
                                ).populate({
                                    path:"courseContent",
                                    populate:{
                                        path: "subSection",
                                    },
                                })
                                .exec();
        //Return Response
        return res.status(200).json({
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
exports.updateSection = async (req,res)=>{
    try{
        //data inout
        const {sectionName , sectionId , courseId} = req.body;
        //data validation
        if(!sectionId || !sectionName)
        {
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            })
        }
        //update the data
        const updateSection = await Section.findByIdAndUpdate(sectionName , {sectionName} , {new:true});
        const course = await Course.findById(courseId)
        .populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            },
        }).exec();

        //return response
        return res.status(200).json({
            success:true,
            message:"Section Updated Successfully",
            updateSection,
            data:course,
        })
    } catch(error)
    {
        return res.status(500).json({
            success:false,
            message:"Unable to update section, please try again",
            Error:error.message,
        })
    }
}
exports.deleteSection = async (req,res)=>{
    try{
        //get ID - assuming that we are sending ID in params
        const {sectionId,courseId} = req.body
        //Use find id and delete
        await Course.findByIdAndUpdate(courseId,{
            $pull:{
                courseContent:sectionId,
            }
        })
       const section =  await Section.findById(sectionId);
        //TODO : do we need to delete the entry from course schema too?
        console.log(sectionId,courseId);
        if(!section)
        {
            return res.status(404).json({
                success:false,
                message:"Section not found"
            })
        }
        await Subsection.deleteMany({_id: {$in: section.subSection}});
        await Section.findByIdAndDelete(sectionId);
        //find the updated course and return
        const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
        //return res
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully",
            data:course,
        })
         
    } catch(error)
    {
        console.log("Error deleting section",error);
        return res.status(500).json({
            success:false,
            message:"Unable to delete section, please try again",
            Error:error.message,
        })
    }
}