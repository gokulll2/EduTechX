const Tag = require("../models/tags");

//create tag handler
exports.createTag = async(req,res)=>{
    try{
        //fetch Data
        const{name,description}=req.body;
        //Validaton
        if(!name || !description)
        {
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        } 
        //create entry in DB
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"Tag created successfully",
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
//get all tags

exports.showAllTags = async (req,res) =>{
    try{
        const alltags = await Tag.find({} , {name:true , description:true}) //it means name and desc are must
        return res.status(200).json({
            success:true,
            message:"All tags returned successfully",
            alltags
        })
    } catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }
}