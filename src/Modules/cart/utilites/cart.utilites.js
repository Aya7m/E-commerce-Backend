import { Product } from "../../../../database/Models/product.model.js"


export const checkProductStock = async (productId, quantity) => {
    return await Product.findOne({ _id: productId, stock: { $gte: quantity } })


}

export const calculateCartaTotal = (products) => {
    let subTotal = 0;
    products.forEach(product => {
        subTotal += product.price * product.quantity
    });
    return subTotal
}