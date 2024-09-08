
import { calculateCartaTotal } from "../../src/Modules/cart/utilites/cart.utilites.js";
import mongoose from "../global-setup.js";
const { Schema, model } = mongoose;

const cartSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    subTotal: Number,


}, { timestamps: true })

cartSchema.pre("save",  function (next) {
      

    this.subTotal = calculateCartaTotal(this.products);
   
    next();
})

cartSchema.post("save",async function (doc) {
    if(doc.products.length === 0){
        await Cart.deleteOne({userId: doc.userId});
       
    }

})

export const Cart = mongoose.models.Cart || model("Cart", cartSchema);