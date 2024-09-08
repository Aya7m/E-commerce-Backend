import { Order } from "../../../database/Models/order.model.js"
import { Product } from "../../../database/Models/product.model.js"
import { Review } from "../../../database/Models/review.model.js"
import { AppError } from "../../utilites/classError.js"
import { OrderStatus, ReviewStatus } from "../../utilites/enums.js"


export const createReview = async (req, res, next) => {


    const { productId, comment, rating } = req.body

    // check if user already reviewed in this product

    const isAlradyReview = await Review.findOne({ productId, userId: req.authaUser._id })
    if (isAlradyReview) return next(new AppError('you can not review twice', 400))
    // check if product exist

    const product = await Product.findById(productId)
    if (!product) return next(new AppError('product not found', 404))
    // check if user buy this product

    const isBuyProduct = await Order.findOne({ userId: req.authaUser._id, "products.productId": productId, orderStatus: OrderStatus.Delivered })
    if (!isBuyProduct) return next(new AppError('you must buy this product before review', 400))

    const newReview = new Review({
        userId: req.authaUser._id,
        productId: productId,
        comment: comment,
        rating: rating
    })

    await newReview.save()

    return res.status(200).json({ message: 'review added successfully' })


}


export const getAllReviews = async (req, res, next) => {
    const review = await Review.find().populate([
        { path: "userId", select: "username email -_id" },
        { path: "productId", select: "title rating -_id" }
    ])


    return res.status(200).json({ message: 'success', data: review })
}


export const approveOrRejectReview = async (req, res, next) => {
    const { reviewId } = req.params;
    const { accept, reject } = req.body;
    if (accept && reject) return next(new AppError('you can not accept and reject at the same time', 400))

    const review = await Review.findByIdAndUpdate(reviewId, { reviewStatus: accept ? ReviewStatus.Accept : reject ? ReviewStatus.Rejected : ReviewStatus.Pending }, { new: true })

    return res.status(200).json({ message: 'success', data: review })
}
