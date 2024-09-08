

import { hashSync } from "bcrypt";
import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,

        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        userType: {
            type: String,
            default:"User",
            enum: ["Admin", "User"],
        },
        age: {
            type: Number,
            required: true,
            min: 18,
        },
        gender: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: Number,
            required: false,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isMarkedAsDeleted: {
            type: Boolean,
            default: false,

        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    // ===============================pre hock=============================
    if (this.isModified("password")) {
        this.password = hashSync(this.password, +process.env.SALT_ROUND);

    }

    next()
})


// userSchema.pre("updateOne",{document:true, query:false}, async function (next) {

//     // ===============================update hock=============================
//     next()
// })
// userSchema.post("save", async function (doc, next) {
//     // ===============================post hock=============================

//     next()

// })


// userSchema.post("updateOne", async function (doc, next) {
//     // ===============================post hock=============================)

//     next()
// })


// query middleware

// userSchema.post(["updateOne","findOneAndUpdate"],function(next){
//     // pre update hook

//     console.log(this.getQuery());
//     console.log(this.getFilter());
//     console.log(this.getUpdate());
//     console.log(this.getOptions());




//     next()

// })



export const User = mongoose.models.User || model("User", userSchema);






