const Category = require("../models/Category");
const Course = require("../models/Course");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }
exports.createCategory = async(req,res)=>{
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
        const categoryDetails = await Category.create({
            name:name,
            description:description,
        });
        console.log(categoryDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"Category created successfully",
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
//get all tags

exports.showAllCategories = async (req,res) =>{
    try{
        const allCategories = await Category.find({} , {name:true , description:true}) //it means name and desc are must
        return res.status(200).json({
            success:true,
            message:"All Categories returned successfully",
            data:allCategories
        })
    } catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }
}

exports.categoryPageDetails = async (req,res)=>{
    try{
        //getCategoryID
        const {categoryId} = req.body;
        //get Courses for specified category ID
        const selectedCategory = await Category.findById({categoryId})
                                         .populate({
                                            path:"courses",
                                            match: { status: "Published" },
                                            populate: "ratingAndReviews",
                                         })
                                         .exec();
        //Validation
        if(!selectedCategory)
        {
            return res.status(404).json({
                success:false,
                message:"Data Not Found"
            })
        }
        if (selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.")
            return res.status(404).json({
              success: false,
              message: "No courses found for the selected category.",
            })
          }
        //get Courses for diff categories
        const categoriesExceptSelected = await Category.find({
                               _id:{$ne:categoryId},
                                  })
        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
            ._id
        )
        .populate({
            path:"courses",
            match: { status: "Published" },
        })
        .exec()

        const allCategorys = await Category.find()
        .populate({
            path:"courses",
            match:{ status: "Published"},
            populate:{
                path:"Instructor",
            },
        })
        .exec()
        const allCourses = allCategorys.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
        .sort((a,b) => b.sold - a.sold)
        .slice(0,10);
    
        return res.status(200).json({
            success:true,
            message:"Done",
            data:{
                selectedCategory,
                differentCategory,
                mostSellingCourses
            },
        })

    } catch(err)
    {
        console.log(err);
        return res.status(404).json({
            success:false,
            message:err.message
        })
    }
}
