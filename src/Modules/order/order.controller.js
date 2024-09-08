import { DateTime } from "luxon"
import { Address } from "../../../database/Models/address.model.js"
import { Cart } from "../../../database/Models/cart.model.js"
import { Order } from "../../../database/Models/order.model.js"
import { AppError } from "../../utilites/classError.js"
import { OrderStatus, PaymentMethod } from "../../utilites/enums.js"

import { calculateCartaTotal } from "../cart/utilites/cart.utilites.js"
import { applayCoupen, validateCoupen } from "./order.utilites.js"
import { Product } from "../../../database/Models/product.model.js"
import { ApiFeatures } from "../../utilites/apiFeatures.js"
import { conformPaymentIntent, createCheckoutSession, createPaymentIntent, createStripeCoupen, refundPaymentData } from "../../payment-handel/stripe.js"

export const createOrder = async (req, res, next) => {
    const userId = req.authaUser._id;
    const { address, addressId, contantNumber, coupenCode, shoppingfee, VAT, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId }).populate('products.productId')

    if (!cart || !cart.products.length) {
        return next(new AppError('Empty cart', 400))
    }

    // check if product exist
    const isSoldout = cart.products.find((p) => p.productId.stock < p.quantity)
    if (isSoldout) {
        return next(new AppError(`product ${isSoldout.productId.title} product is soldout,400`))
    }
    const subTotal = calculateCartaTotal(cart.products)
    let total = subTotal + shoppingfee + VAT;


    let coupen = null

    if (coupenCode) {
        const isCoupenValidate = await validateCoupen(coupenCode, userId)

        if (isCoupenValidate.error) {
            return next(new AppError(isCoupenValidate.message, 400))
        }

        coupen = isCoupenValidate.coupen;
        total = applayCoupen(subTotal, coupen)


    }

    if (!address && !addressId) {
        return next(new AppError('address and addressId are required', 400))
    }
    if (addressId) {
        // check if addressId is exist

        const addressExist = await Address.findOne({ userId, _id: addressId })

        if (!addressExist) {
            return next(new AppError('address not found', 400))
        }




    }

    let orderStatus = OrderStatus.Pending;
    if (paymentMethod === PaymentMethod.Cash) {
        orderStatus = OrderStatus.Placed
    }


    const orderObj = new Order({
        userId,
        products: cart.products,
        address,
        addressId,
        contantNumber,
        subTotal,
        total,
        shoppingfee,
        coupenId: coupen?._id,
        VAT,
        paymentMethod,
        orderStatus,
        estamitedDeliveryDate: DateTime.now().plus({ days: 7 }).toFormat("yyyy-MM-dd"),
    }

    )

    await orderObj.save()



    // clear cart

    cart.products = []

    await cart.save()

    // decriment the stock of products


    // incremnet userCount of coupen

    res.status(201).json({ message: 'order created successfully', order: orderObj })









}


export const cancleOrder = async (req, res, next) => {


    const { _id } = req.authaUser;
    const { orderId } = req.params;

    // check if order exist

    const order = await Order.findOne({ _id: orderId, userId: _id, orderStatus: { $in: [OrderStatus.Pending, OrderStatus.Placed, OrderStatus.Conformed] } })
    if (!order) {
        return next(new AppError('order not found', 400))
    }
    // check if order bought befor 3 days

    const orderDate = DateTime.fromJSDate(order.createdAt);
    const currentDate = DateTime.now();
    const diff = Math.ceil(Number(currentDate.diff(orderDate, 'days').toObject().days).toFixed(2))

    if (diff > 3) {
        return next(new AppError('order cancle after 3 days', 400))
    }

    // update order status to cancel
    order.orderStatus = OrderStatus.Canceled;
    order.cancelledAt = DateTime.now();
    order.canceledBy = req.authaUser._id;

    await Order.updateOne({ _id: orderId }, order)

    // update product stock in product model
    for (const product of order.products) {
        await Product.updateOne({ _id: product.productId }, {
            $inc: {
                stock: product.quantity
            }
        })
    }

    res.status(200).json({ message: 'order cancle successfully', order })

}


export const deliverOrder = async (req, res, next) => {
    const { _id } = req.authaUser;
    const { orderId } = req.params;
    // check if order exist

    const order = await Order.findOne({ _id: orderId, userId: _id, orderStatus: { $in: [OrderStatus.Placed, OrderStatus.Conformed] } })
    if (!order) {
        return next(new AppError('order not found', 400))
    }

    order.orderStatus = OrderStatus.Delivered;
    order.deliveredAt = DateTime.now();

    await Order.updateOne({ _id: orderId }, order)
    res.status(200).json({ message: 'order delivered successfully', order })

}


export const listOrders = async (req, res, next) => {

    // const { _id } = req.authaUser;
    // const query = { userId: _id, ...req.query }



    // const populateArray = [
    //     { path: "products.productId", select: "title appliedPrice Images rating " },
    // ]


    // const ApiFeaturesInestance = new ApiFeatures(Order,query,populateArray).pagination().sort().filters();
    // const orders = await ApiFeaturesInestance.mongooseQuery;
    // res.status(200).json({ message: 'success', data: orders })




    const populateArray = [
        { path: "products.productId", select: "title appliedPrice Images rating " },
    ]
    const orders = await Order.find().populate(populateArray)



    res.status(200).json({ message: 'success', data: orders })
}




export const paymentWithStrip = async (req, res, next) => {
    const { orderId } = req.params;
    const { _id } = req.authaUser;

    const order = await Order.findOne({ _id: orderId, userId: _id, orderStatus: "pending" });

    if (!order) {
        return next(new AppError('order not found', 400))
    }
    const paymentObject = {

        customer_email: req.authaUser.email,
        metadata: {
            orderId: order._id.toString()
        },
        discounts: [],
        line_items:
            order.products.map((product) => {

                return {
                    price_data: {
                        currency: "egp",
                        product_data: {
                            name: req.authaUser.username
                        },
                        unit_amount: product.price * 100

                    },
                    quantity: product.quantity
                }

            }),



    }

    if (order.coupenId) {
        const stripeCoupen = await createStripeCoupen({ coupenId: order.coupenId })
        if (stripeCoupen.status) {
            return next(new AppError(stripeCoupen.message, 400));
        }

        paymentObject.discounts.push({
            coupon: stripeCoupen.id
        })
    }

    const checkOutSection = await createCheckoutSession(paymentObject);
    const paymentIntent=await createPaymentIntent({amount:order.total, currency:"egp"})
    order.payment_intent=paymentIntent.id
    await order.save()

    res.status(200).json({ message: 'payment initialized', data: checkOutSection ,paymentIntent})


}


export const stripeWebhockLocal=async(req,res,next)=>{
   
    const orderId=req.body.data.object.metadata.orderId;
    const confirmOrder=await Order.findByIdAndUpdate(orderId,{orderStatus:OrderStatus.Conformed},{new:true})

    const confirmPayment=await conformPaymentIntent({paymentIntentId:confirmOrder.payment_intent})

    res.status(200).json('payment initialized')
    
}



export const refundPayment=async(req,res,next)=>{
    const{orderId}=req.params;
    const findOrder=await Order.findOne({_id:orderId,
        orderStatus:OrderStatus.Conformed
    }
        
    )

    if(!findOrder){
        return next(new AppError('order not found',400))
    }

    const refund=await refundPaymentData({paymentIntentId:findOrder.payment_intent})
    if(refund.status){
        return next(new AppError(refund.message,400))
    }
    findOrder.orderStatus=OrderStatus.Refunded;
    await findOrder.save()
    res.status(200).json('payment refunded')
}



