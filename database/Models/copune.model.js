
import {DescountType} from "../../src/utilites/enums.js";
import mongoose from "../global-setup.js";
const { Schema, model } = mongoose;

const copuneSchema = new Schema({
    coupenCode: {
        type: String,
        required: true,
        unique: true
    },
    coupenAmount: {
        type: Number,
        required: true
    },
    coupenType: {
        type: String,
       
        enum: Object.values(DescountType)
    },
    from: {
        type: Date,
        required: true
    },
    till: {
        type: Date,
        required: true
    },
    users: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            maxCount: {
                type: Number,
                required: true,
                min: 1
            },
            useageCount: {
                type: Number,
                default: 0
            }
        }
    ],
    isEnabled: {
        type: Boolean,
        default: true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
})


export const Copune = mongoose.models.Copune || model("Copune", copuneSchema);


// create coupen check log
// coupenId,userId,changes:{}

const coupenCheckLogSchema = new Schema({
    coupenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Copune",
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    changes: {
        type: Object,
        required: true
    }
}, {
    timestamps: true
})

export const CoupenCheckLog = mongoose.models.CoupenCheckLog || model("CoupenCheckLog", coupenCheckLogSchema);
