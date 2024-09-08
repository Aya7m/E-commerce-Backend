import { Cart } from "../../../database/Models/cart.model.js";

import { AppError } from "../../utilites/classError.js";
import { checkProductStock } from "./utilites/cart.utilites.js";


export const addToCart = async (req, res, next) => {
    const userId = req.authaUser._id;
    const { quantity } = req.body;
    const { productId } = req.params;
    const product = await checkProductStock( productId, quantity );
    if (!product) {
        return next(new AppError('product not avaliable', 404));
    }
    const cart = await Cart.findOne({ userId });
    if (!cart) {
        // const subTotal = product.appliedPrice * quantity;
        const newCart = new Cart({
            userId,
            products: [{ productId: product._id, quantity, price: product.appliedPrice }],
            // subTotal
        })
        await newCart.save();
        return res.status(201).json({
            status: 'product add to cart',
            data: newCart
        })
    }
    const isProductExist = cart.products.find(p => p.productId == productId);
    if (isProductExist) {
        return next(new AppError('product already in cart', 400));
    }
    cart.products.push({ productId, quantity, price: product.appliedPrice });
    // cart.subTotal += product.appliedPrice * quantity;
    await cart.save();
    return res.status(200).json({
        status: 'product add to cart',
        data: cart
    })
}



export const removeFromCart = async (req, res, next) => {
    const userId = req.authaUser._id;
    const { productId } = req.params;
    const cart = await Cart.findOne({ userId, "products.productId": productId });
    if (!cart) {
        return next(new AppError('product not in cart', 404));
    }
    cart.products = cart.products.filter(p => p.productId != productId);



    await cart.save();
    return res.status(200).json({
        status: 'product remove from cart',
        data: cart
    })

}

export const updateCart = async (req, res, next) => {
    const userId = req.authaUser._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId, "products.productId": productId });
    if (!cart) {
        return next(new AppError('product not in cart', 404));
    }

    const product = await checkProductStock(productId, quantity);
    if (!product) {
        return next(new AppError('product not avaliable', 404));
    }


    const productIndex = cart.products.findIndex(p => p.productId.toString() == product._id.toString());
    cart.products[productIndex].quantity = quantity;

 
    await cart.save();
    return res.status(200).json({
        status: 'product update in cart',
        data: cart
    })


}


export const getCart = async (req, res, next) => {
    const userId =  req.authaUser._id;
    const cart = await Cart.findOne({ userId });
   
    return res.status(200).json({
        status: 'success',
        data: cart
    })
}