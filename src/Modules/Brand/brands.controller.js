import slugify from "slugify"
import { Brand } from "../../../database/Models/brand.model.js"
import { SubCategory } from "../../../database/Models/sub-category.model.js"
import { nanoid } from "nanoid"
import { cloudinaryConfig } from "../../utilites/cloudinary.js"
import { AppError } from "../../utilites/classError.js"
import { Product } from "../../../database/Models/product.model.js"


export const createBrand = async (req, res, next) => {
    const { catagory, subCatagory } = req.query
    const issubCatagory = await SubCategory.findById({ _id: subCatagory, catagory: catagory }).populate('categoryId')
    if (!issubCatagory) return next(new AppError('sub catagory not found', 404))


    const { name } = req.body
    const slug = slugify(name, {
        lower: true,
        replacement: '-',
    })
    if (!req.file) return next(new AppError('please upload a file', 400))

    const customId = nanoid(4)
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(req.file.path, {
        folder: `${process.env.UPLOAD_FOLDER}/catagories/${issubCatagory.categoryId.customId}/sub-categories/${issubCatagory.customId}/brands/${customId}`,

    })

    const brand = {
        name,
        slug,
        logo: {
            secure_url,
            public_id
        },
        customId,
        categoryId: issubCatagory.categoryId._id,
        subCategoryId: issubCatagory._id,

    }
    const document = await Brand.create(brand)

    res.status(201).json({
        status: 'success',
        message: 'brand created successfully',
        document
    })



}



export const getbrands = async (req, res, next) => {
    const { name, slug, id } = req.query

    const queryFilters = {}

    if (name) queryFilters.name = name
    if (slug) queryFilters.slug = slug
    if (id) queryFilters._id = id
    const brands = await Brand.find(queryFilters)
    if (!brands) return next(new AppError('brands not found', 404))

    res.status(200).json({
        message: 'success',
        data: brands
    })

}



export const updateBrand = async (req, res, next) => {

    const { id } = req.params
    const brand = await Brand.findById(id).populate('categoryId').populate('subCategoryId')
    if (!brand) return next(new AppError('brand not found', 404))
    const { name } = req.body
    if (name) {
        const slug = slugify(name, {
            lower: true,
            replacement: '-',
        }) 
        brand.name = name
        brand.slug = slug
    }

    if (req.file) {

        const splitPublicId = brand.logo.public_id.split(`${brand.customId}`)[1]

        const { secure_url } = await cloudinaryConfig().uploader.upload(req.file.path, {
            folder: `${process.env.UPLOAD_FOLDER}/catagories/${brand.categoryId.customId}/sub-categories/${brand.subCategoryId.customId}/brands/${brand.customId}`,
            public_id: splitPublicId
        })

        brand.logo.secure_url = secure_url
    }


    await brand.save()
    res.status(200).json({
        status: 'success',
        message: 'brand updated successfully',
        data: brand
    })

}


export const deleteBrand = async (req, res, next) => {

    const { id } = req.params
    const brand = await Brand.findByIdAndDelete(id).populate('categoryId').populate('subCategoryId')
    if (!brand) return next(new AppError('brand not found', 404))
    const brandPath =`${process.env.UPLOAD_FOLDER}/catagories/${brand.categoryId.customId}/sub-categories/${brand.subCategoryId.customId}/brands/${brand.customId}`;
    await cloudinaryConfig().api.delete_resources_by_prefix(brandPath)
    await cloudinaryConfig().api.delete_folder(brandPath)


    await Product.deleteMany({ brandId: id })

    

    res.status(200).json({
        status: 'success',
        message: 'brand deleted successfully',
        data: brand
    })

    // delete product related with brand
}