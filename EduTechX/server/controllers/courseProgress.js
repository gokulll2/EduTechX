const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress")
exports.updateCourseProgress = async (req,res)=>{
    try{
        const {courseId , subSectionId} = req.body;
        const userId = req.user.id;
        
        //check if subsection is valid or not
        const subSection = await SubSection.findById(subSectionId);
        if(!subSection)
        {
            return res.status(404).json({
                success:false,
                Error:"Invalid Subsection",
            })
        }
        //check for oldEntry
        let courseProgress = await CourseProgress.findOne({
            courseID:courseId,
            userId:userId,
        });
        if(!courseProgress)
        {
            return res.status(404).json({
                success:false,
                message:"CourseProgress does not exist",
            })
        }
        else{
            //check for re-completing videos 
            if(courseProgress.completedVideos.includes(subSectionId))
            {
                return res.status(400).json({
                    error:"Subsection already completed",
                })
            }
            //push into completing videos
           courseProgress.completedVideos.push(subSectionId);
        }
        await courseProgress.save();
    } catch(err)
    {
        console.log(err);
        return res.status(400).json({error:'Internal Server Error'});
    }
}