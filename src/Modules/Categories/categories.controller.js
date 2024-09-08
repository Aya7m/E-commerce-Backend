import slugify from "slugify"
import { AppError } from "../../utilites/classError.js"
import { cloudinaryConfig } from "../../utilites/cloudinary.js"
import { nanoid } from "nanoid"

import { Category } from "../../../database/Models/category.model.js"
import { SubCategory } from "../../../database/Models/sub-category.model.js"
import { Brand } from '../../../database/Models/brand.model.js'
import { ApiFeatures } from "../../utilites/apiFeatures.js"


export const createCatagory = async (req, res, next) => {
    const { name } = req.body

    // find by name
    // const document = await Category.findOne({ name })
    // if (document) {
    //     return next(new AppError("this catagory name is exist", 404))
    // } 

    const slug = slugify(name, {
        lower: true,
        replacement: '-',
    })

    if (!req.file) {

        return next(new AppError("please upload a file", 400))
    }

    const customId = nanoid(4)
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(req.file.path,
        {
            folder: `${process.env.UPLOAD_FOLDER}/catagories/${customId}`
        }
    )
    const catagory = {
        name,
        slug,
        Images: {
            secure_url,
            public_id,

        },
        customId
    }
    const newCatagory = await Category.create(catagory)
    res.status(201).json({
        status: 'success',
        data: {
            newCatagory
        }
    })
}

// get all catagories
export const getAllCatagories = async (req, res, next) => {
    const { id, name, slug } = req.query
    const queryfilters = {}

    if (id) queryfilters._id = id

    if (name) queryfilters.name = name
    if (slug) queryfilters.slug = slug

    const documents = await Category.find(queryfilters)
    if (!documents) return next(new AppError('catagory not found', 404))
    res.status(200).json({ message: 'success', data: documents })


}


// update catagory

export const updateCatagory = async (req, res, next) => {
    const { id } = req.params
    const catagory = await Category.findById(id)
    if (!catagory) return next(new AppError('catagory not found', 404))

    const { name } = req.body
    if (name) {
        const slug = slugify(name, {
            lower: true,
            replacement: '-',
        })
        catagory.slug = slug
        catagory.name = name

    }

    // image

    if (req.file) {
        const splitPublicId = catagory.Images.public_id.split(`${catagory.customId}`)[1]

        const { secure_url } = await cloudinaryConfig().uploader.upload(req.file.path,
            {
                folder: `${process.env.UPLOAD_FOLDER}/catagories/${catagory.customId}`,
                public_id: splitPublicId
            }
        )
        catagory.Images.secure_url = secure_url
    }

    await catagory.save()
    res.status(200).json({
        status: 'success',
        data: {
            catagory
        }
    })
}



// delete catagory

export const deleteCatagory = async (req, res, next) => {
    const { id } = req.params;

    const catagory = await Category.findByIdAndDelete(id);
    if (!catagory) return next(new AppError('catagory not found', 404))

    const cataoryPath = `${process.env.UPLOAD_FOLDER}/catagories/${catagory.customId}`;
    await cloudinaryConfig().api.delete_resources_by_prefix(cataoryPath);
    await cloudinaryConfig().api.delete_folder(cataoryPath);


 

    res.status(200).json({
        status: 'success',
        data: {
            catagory
        }
    })


}


export const listCatagories=async(req,res,next)=>{
    const mongooseQuery=await Category.find();
    const ApiFeaturInstant=new ApiFeatures(mongooseQuery,req.query).pagination().filters();

    const catagories=await ApiFeaturInstant.mongooseQuery;
    res.status(200).json({message:'success',data:catagories})
}