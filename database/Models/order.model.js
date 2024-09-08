
import mongoose from "../global-setup.js";
import { OrderStatus, PaymentMethod } from "../../src/utilites/enums.js";
import { Product } from "./product.model.js";
import { Copune } from "./copune.model.js";
const { Schema, model } = mongoose;

const orderSchema = new Schema({

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
    fromCart: {
        type: Boolean,
        default: true
    },
    address: String,
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",

    },
    contantNumber: {
        type: String,
        required: true
    },
    subTotal: {
        type: Number,
        required: true
    },
    shoppingfee: {
        type: Number,
        required: true
    },
    VAT: {
        type: Number,
        required: true
    },
    coupenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupen",

    },
    total: {
        type: Number,
        required: true
    },
    estamitedDeliveryDate: {
        type: Date,
        required: true
    },

    paymentMethod: {
        type: String,
        required: true,
        enum: Object.values(PaymentMethod)
    },
    orderStatus: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus)
    },
    deliveredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    canceledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
   
    deliveredAt: Date,
    cancelledAt: Date,
    payment_intent: String

}, { timestamps: true });


orderSchema.post("save", async function () {
    // decriment stock of product

    for (const product of this.products) {
        await Product.updateOne({ _id: product.productId }, { $inc: { stock: -product.quantity } })
    }

    // inciment use count of coupen

    if (this.coupenId) {
      const coupen=  await Copune.findById(this.coupenId)
      coupen.users.find(user=>user.userId.toString()===this.userId.toString()).useageCount++;
      await coupen.save() 
    }
})


export const Order = mongoose.models.Order || model("Order", orderSchema);
