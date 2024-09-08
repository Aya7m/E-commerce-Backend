

import mongoose from "../global-setup.js";
import { ReviewStatus } from "../../src/utilites/enums.js";
const { Schema, model } = mongoose;

const reviewSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,

    },

    reviewStatus: {
        type: String,
        enum: Object.values(ReviewStatus),
        default: ReviewStatus.Pending
    },
    actionDonBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }


}, { timestamps: true });


export const Review = mongoose.models.Review || model("Review", reviewSchema);