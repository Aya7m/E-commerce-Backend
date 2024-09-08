import { User } from "../../../database/Models/user.model.js";
import  { compareSync } from "bcrypt";
import { AppError } from "../../utilites/classError.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../servies/sendEmail.js";
import { Address } from "../../../database/Models/address.model.js";

export const registerUser = async (req, res, next) => {

    const { username, email, password, gender, age, phone, userType,country,city,postalCode,buldingNumber,floorNumber,addresslable } = req.body;
   


    let code = Math.floor(100000 + Math.random() * 900000);
    req.body.OTPCode = code;
    // email check

    const isEmailExist = await User.findOne({ email });

    if (isEmailExist) {
        return next(new AppError("this email is exist", 404));
    }

    // hashing password

    // send Email

    const userObject = new User({
        username,
        email,
        password,
        gender,
        age,
        phone,

        userType
    })


    // create new Address
    const addressInestant=new Address({
       userId:userObject._id, country,city,postalCode,buldingNumber,floorNumber,addresslable,isDefault:true
    })
    // create in db

    sendEmail(req.body.email, code)
   

    const user = await userObject.save();
    const saveAddress=await addressInestant.save()

    res.status(200).json({
        status: "success",
        data: {
            user,saveAddress
        }
    })


}


export const updateUser = async (req, res, next) => {
    const { userId } = req.params;
    const { password, username } = req.body;



    // const document=new User({_id:userId})
    // const user = await document.updateOne({username})

    const user = await User.findByIdAndDelete(
        { _id: userId },
        { username },
        { new: true }
    ).select("password")


    res.status(200).json({
        status: "success",
        data: {
            user
        }
    })

}


export const login = async (req, res, next) => {

    const { email, password } = req.body
    const userExist = await User.findOne({ email })

    if (!userExist) {
        return next(new AppError("this email is not exist", 404))
    }
    const isMatch = compareSync(password, userExist.password)

    if (!isMatch) {
        return next(new AppError("password is not correct", 404))
    }

    const token = jwt.sign({ userId: userExist._id, userType: userExist.userType, username: userExist.username, email: userExist.email }, "signInToken", { expiresIn: "1d" })

    res.status(200).json({
        status: "success",
        token
    })


}