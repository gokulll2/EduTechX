const mongoose = require("mongoose");

const profileSchema = mongoose.Schema({
    gender:{
        type:String,
        required:true,
    },
    dateOfBirth:{
        type:String,
        required:true,
    },
    about:{
        type:String,
        trim:true,
    },
    contactNumbers:{
        type:String,
        required:true,
        trim:true,
    },
})
module.exports = mongoose.model("Profile",profileSchema);