const SubSection = require("../models/SubSection");
const Section = require("../models/Section")
const {uploadImageToCloudinary} = require("../utils/imageUploader")
function isSupportedtypes(type,supportedTypes)
{
    return supportedTypes.includes(type);
}
exports.createSubSection = async(req,res)=>{
    try{
        // data fetch from req body
        const {sectionId , title , description} = req.body;
        //Extract file video
        const video = req.files.video;
        //Validation
        if(!sectionId || !title || !description || !video)
        {
            return res.status(404).json({
                success:false,
                message:"All fields are required",
            })
        }
        const supportedTypes= ['mp4','mov'];
        const fileType = video.name.split('.')[1].toUpperCase();
        if(!isSupportedtypes(supportedTypes,fileType))
        {
            return res.status(400).json({
                success:false,
                message:"File Format not Supported",
            })
        }
        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video , process.env.FOLDER_NAME)
        //Create subsection
        const subSectionDetails = await Section.create({
            title:title,
            timeDuration:`${uploadDetails.duration}`,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        //Update Section with this subsection , means Push Subsection id to that section
        const updatedSection =  await SubSection.findByIdAndUpdate(
            {_id:sectionId},
            {
                $push:{
                    subSection:subSectionDetails._id,
                }
            },
            {new:true},
        ).populate("subSection");

        //return res
        return res.status(200).json({
            success:true,
            message:"Sub Section Created Successfully",
           data:updatedSection,
        })
    } catch(error)
    {
        console.log(error);
        return res.status(400).json({
            success:false,
            message:"Internal Server Error",
            error:error.message,
        })
    }
}
//Updated Subsection
exports.updateSubSection = async(req,res)=>{
    try{
        const{sectionId , title , description} = req.body;
        const subSection = await SubSection.findById(sectionId);
        if(!subSection)
        {
            return res.status(404).json({
                success:false,
                message:"SubSection not found",
            })
        }
        if(title !== undefined)
        {
            subSection.title = title
        }
        if (description !== undefined) {
            subSection.description = description
          }
          if(req.files && req.files.video !== undefined)
          {
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`
          }
          await subSection.save();
          return res.json({
            success:true,
            message:"Section updated successfully",
          })
    } catch(error){
        console.log(error)
        return res.status(403).json({
            success:false,
            message:error.message,
        })
    }
}
//Deleted Subsection
exports.deleteSubSection = async(req,res) =>{
    try{
        const{subSectionId , sectionId} = req.body;
        await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $pull:{
                    subSection:subSectionId,
                },
            }
        )
        const subSection = await SubSection.findByIdAndDelete({_id:sectionId});
        if(!subSection)
        {
            return res.status(404).json({
                success:false,
                message:"Subsection not found",
            })
        }
        return res.status(200).json({
            success:true,
            message:"Subsection deleted successfully",
        })
    } catch(err)
    {
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"An error occurred while deleting the Subsection",
        })
    }
}
