const User = require("../models/User");
const Profile = require("../models/Profile");

exports.updatedProfile = async(req,res)=>{
    try{
        //get Data
        const { dateOfBirth="" , about="" , gender , contactNumber } = req.body;
        //get user ID
        const id = req.user.id;  // Got this from auth.js Decode vale se
        //Validation
        if(!contactNumber || !gender || !id)
        {
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        //find Profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        //Update Profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetaisl.contactNumber = contactNumber;
        await profileDetails.save();

        //return res
        return res.status(200).json({
            success:true,
            message:"Profile data upadted Successfully",
            profileDetails
        })
    } catch(error)
    {
        return res.status(500).json({
            success:false,
            message:"error.message",
            error:error.message,
        })
    }
}

//deleteAccount
exports.deleteAccount = async(req,res)=>{
    try{
        //get user id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails)
        {
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
        //delete the profile first
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails})
        //Todo:Unenroll the students from all the enrolled Courses
        //Delete the user
       await User.findByIdAndDelete({_id:id});
        //return response
        return res.status(200).json({
            success:true,
            message:"User Deleted Successfully",
        })
    } catch(error)
    {
        return res.status(500).json({
            success:false,
            message:"User cannot be deleted successfully",
        })
    }
}
exports.getAllUserDetails = async(req,res)=>{
    try{
        //get the user id
        const id = req.user.id
        //validation and get user details
         const userDetails = User.findById(id).populate("additionalDetails").exec();
        //return response
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully"
        })
    } catch(error)
    {
        return res.status(500).json({
            success:false,
            message:"Failed in getting the User's details"
        })
    }
}