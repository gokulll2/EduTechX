const SubSection = require("../models/SubSection");
const Section = require("../models/Section")
const {uploadImageToCloudinary} = require("../utils/imageUploader")
function isSupportedtypes(type,supportedTypes)
{
    return supportedTypes.includes(type);
}
exports.SubSection = async(req,res)=>{
    try{
        // data fetch from req body
        const {sectionId , title , description , timeDuration} = req.body;
        //Extract file video
        const video = req.files.videoFile;
        //Validation
        if(!sectionId || !title || !description || !timeDuration)
        {
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        const supportedTypes= ['mp4','mov'];
        const fileType = video.name.split('.')[1].toLowerCase();
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
            timeDuration:timeDuration,
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
        ) //Log updated section here after adding populate query

        //return res
        return res.status(200).json({
            success:true,
            message:"Sub Section Created Successfully",
            updatedSection,
        })
    } catch(error)
    {
        console.log(error);
        return res.status(400).json({
            success:false,
            message:"",
            error:error.message,
        })
    }
}
//Updated Subsection
exports.updateSubSection = async(req,res)=>{
    try{

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

    } catch(err)
    {
        console.log(err);
        return res.status(403).json({
            success:false,
            message:err.message,
        })
    }
}
