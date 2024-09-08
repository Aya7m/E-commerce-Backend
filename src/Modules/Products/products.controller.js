import slugify from "slugify"

import { AppError } from "../../utilites/classError.js"
import { cloudinaryConfig, uploadFile } from "../../utilites/cloudinary.js"
import { nanoid } from "nanoid"
import { Product } from "../../../database/Models/product.model.js"
import { Brand } from "../../../database/Models/brand.model.js"
import { badge, DescountType, ReviewStatus } from "../../utilites/enums.js"
import { calculateProductPrice } from "../../utilites/calculatePrice.js"
import { paginate } from "mongoose-paginate-v2"
import { ApiFeatures } from "../../utilites/apiFeatures.js"

export const createProduct = async (req, res, next) => {
    const { title, overview, specs, price, stock, discountAmount, descountType } = req.body


    if (!req.files.length) {
        return next(new AppError('please upload a file', 400))
    }


    const brandDocument = req.brandDocument;







    const URLs = [];
    // const brandCustom = brandDocument.customId;
    // const catagoryCusid = brandDocument.catagoryId.customId;
    // const subCatagoryCusid = brandDocument.subCategoryId.customId;
    const customId = nanoid(4);
    const folder = `${process.env.UPLOAD_FOLDER}/catagories/${brandDocument.categoryId.customId}/sub-categories/${brandDocument.subCategoryId.customId}/brands/${brandDocument.customId}/products/${customId}`

    for (const file of req.files) {

        // const { secure_url, public_id } = await uploadFile({
        //     file: file.path,
        //     folder,
        // });

        const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(file.path, {
            folder: folder,


        })



        URLs.push({ secure_url, public_id })

    }


    const product = {
        title,

        overview,
        specs: JSON.parse(specs),
        price,
        stock,


        appliedDiscount: {
            amount: discountAmount,
            type: descountType
        },
        Images: {
            URLs,
            customId
        },

        brandId: brandDocument._id,
        categoryId: brandDocument.categoryId._id,
        subCategoryId: brandDocument.subCategoryId._id,
    }



    const createdProduct = await Product.create(product)
    // socket event to notificate all clients

   return res.status(200).json({ message: 'success', data: createdProduct })

}



export const updateProduct = async (req, res, next) => {
    const { productId } = req.params;

    const { title, stock, overview, badge, price, discountAmount, descountType, specs } = req.body;
    // find product from db
    const product = await Product.findById(productId)

    if (!product) return next(new AppError('product not found', 404))

    // update product
    if (title) {
        product.title = title
        product.slug = slugify(title, { lower: true, replacement: '-' })
    }

    if (stock) {
        product.stock = stock
    }
    if (overview) {
        product.overview = overview
    }
    if (badge) {
        product.badge = badge
    }
    if (price || discountAmount || descountType) {
        const newPrice = price || product.price
        const discount = {}
        discount.amount = discountAmount || product.appliedDiscount.amount
        discount.type = descountType || product.appliedDiscount.type


        product.appliedPrice = calculateProductPrice(newPrice, discount)


        product.price = newPrice
        product.appliedDiscount = discount
    }

    // speces

    if (specs) product.specs = specs;
    await product.save()

    res.status(200).json({ message: 'success', data: product })
}


// get

export const getProducts = async (req, res, next) => {
    // const { page = 1, limit = 5, ...filtering } = req.query
    // const skip = (page - 1) * limit



    // const feltrString=JSON.stringify(filtering)
    // const replaceFilter=feltrString.replaceAll(/lt|gt|lte|eq|ne|regex/g,(ele)=>`$${ele}`)
    // const parseFiltering=JSON.parse(replaceFilter)


    const mongooseQuery = Product.find().populate( [
        { path: 'Reviews',select:'-_id userId rating comment', match: { reviewStatus: ReviewStatus.Accept } },
    ])
    const ApiFeaturInstant = new ApiFeatures(mongooseQuery, req.query).pagination().sort().filters()

    const products = await ApiFeaturInstant.mongooseQuery
    res.status(200).json({ message: 'success', data: products })
}


export const deleteProduct = async (req, res, next) => {
    const { productId } = req.params
    const product = await Product.findByIdAndDelete(productId).populate('brandId').populate('categoryId').populate('subCategoryId')
    if (!product) return next(new AppError('product not found', 404))


    res.status(200).json({ message: 'success', data: product })

}