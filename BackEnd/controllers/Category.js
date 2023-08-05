

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
            allCategories
        })
    } catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }
}

