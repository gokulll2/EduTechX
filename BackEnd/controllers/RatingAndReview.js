const RatingAndReview = require("../models/RatingAndReview");
const User = require("../models/User");
const Course = require("../models/Course");

//create Rating 
exports.createRating = async(req,res)=>{
    try{ 
        //get UserID
        const userID = req.user.id;
        //fetch data from req body
        const{rating , review , courseId} = req.body;
        //check if user is enrolled or not 
        const courseDetails = await Course.findOne(
                                 {_id:courseId ,
                                 studentsEnrolled:{$elematch:{$eq : userID}}
                                  }) 
        if(!courseDetails)
        {
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled in this course",
            })
        }
        //check if user already reviewed or not
        const alreadyReviewed = RatingAndReview.findOne({
                               user:userID,
                               course:courseId,
        })
        if(alreadyReviewed)
        {
            return res.status(404).json({
                success:false,
                message:"Student already reviewed",
            })
        }
        //create rating and review
        const ratingReview = await RatingAndReview.create({
                 rating,review,
                 course:courseId,
                 user:userID,
        })
        //update course with this rating and review
        const updatedCourseDetails = await Course.findOneAndUpdate(
            {_id:courseId},
            {$push:{
                ratingAndReviews:ratingReview._id,
            }},
            {new:true}
        )
        console.log(updatedCourseDetails)
        //return response
        return res.status(200).json({
            success:true,
            message:"Rating And Review successfully created",
            ratingReview
        })

    } catch(err)
    {
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }
}
//getAverageRating
exports.getAverageRating = async (req,res)=>{
    try{
        //getCourseId
        const courseId = req.body.courseid
        //Calculate the avg rating
        //return res

    } catch(err)
    {

    }
}
//getAllRatings