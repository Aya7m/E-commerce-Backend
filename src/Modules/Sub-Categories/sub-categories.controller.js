import { nanoid } from "nanoid"
import { Category } from "../../../database/Models/category.model.js"
import { AppError } from "../../utilites/classError.js"
import { SubCategory } from "../../../database/Models/sub-category.model.js"
import slugify from "slugify"
import { cloudinaryConfig } from "../../utilites/cloudinary.js"
import { Brand } from "../../../database/Models/brand.model.js"


export const createSubCategory = async (req, res, next) => {
    // check catagory id

    const catagory = await Category.findById(req.query.categoryId)
    if (!catagory) return next(new AppError('catagory not found', 404))


    const { name } = req.body
    const slug = slugify(name, {
        lower: true,
        replacement: '-'
    })

    if (!req.file) return next(new AppError('please upload a file', 400))

    const customId = nanoid(4)
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(req.file.path, {
        folder: `${process.env.UPLOAD_FOLDER}/catagories/${catagory.customId}/sub-categories/${customId}`


    })

    const subCategory = {
        name,
        slug,
        Images: {
            secure_url,
            public_id
        },
        customId,
        categoryId: catagory._id
    }


    const document = await SubCategory.create(subCategory)

    res.status(200).json({

        message: 'success', data: document
    })
}


export const getSubCategory = async (req, res, next) => {
    const { name, slug, id } = req.query
    const queryfilters = {}
    if (name) queryfilters.name = name
    if (slug) queryfilters.slug = slug
    if (id) queryfilters._id = id

    const documents = await SubCategory.find(queryfilters)
    if (!documents) return next(new AppError('sub catagory not found', 404))


    res.status(200).json({ message: 'success', data: documents })
}


export const updateSubCategory = async (req, res, next) => {

    const { id } = req.params
    const subCategory = await SubCategory.findById(id).populate('categoryId')
    if (!subCategory) return next(new AppError('sub catagory not found', 404))

    const { name } = req.body

    if (name) {
        const slug = slugify(name, {
            lower: true,
            replacement: '-'
        })
        subCategory.name = name
        subCategory.slug = slug 
    }
    if (req.file) {

        const splitPublicId = subCategory.Images.public_id.split(`${subCategory.customId}`)[1]

        const { secure_url } = await cloudinaryConfig().uploader.upload(req.file.path, {
            folder: `${process.env.UPLOAD_FOLDER}/catagories/${subCategory.categoryId.customId}/sub-categories/${subCategory.customId}`,
            public_id: splitPublicId
        })

        subCategory.Images.secure_url = secure_url
    }


    await subCategory.save()
    res.status(200).json({ message: 'success', data: subCategory })
}


export const deleteSubCategory = async (req, res, next) => {

    const { id } = req.params
    const subCategory = await SubCategory.findByIdAndDelete(id).populate('categoryId')
    if (!subCategory) return next(new AppError('sub catagory not found', 404))

        const SubcataoryPath=`${process.env.UPLOAD_FOLDER}/catagories/${subCategory.categoryId.customId}/sub-categories/${subCategory.customId}`;
        await cloudinaryConfig().api.delete_resources_by_prefix(SubcataoryPath);
        await cloudinaryConfig().api.delete_folder(SubcataoryPath);


        // todo delete brands

        await Brand.deleteMany({ subCategoryId:subCategory.id })

    res.status(200).json({ message: 'success', data: subCategory })

    

}