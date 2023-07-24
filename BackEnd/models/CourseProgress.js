const mongoose = require("mongoose");

const courseProgress = mongoose.Schema({
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    }
})
module.exports = mongoose.model("courseProgress",courseProgress);
