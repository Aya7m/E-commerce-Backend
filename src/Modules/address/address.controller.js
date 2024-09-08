

// add new address

import axios from "axios";
import { Address } from "../../../database/Models/address.model.js"
import { AppError } from "../../utilites/classError.js";

export const addAddress = async (req, res, next) => {
    const { country, city, postalCode, buldingNumber, floorNumber, addresslable, setAsDefault } = req.body
    const userId = req.authaUser._id;

    // todo city validation


        // validation cities

        const cities=await axios.get('https://api.api-ninjas.com/v1/city?country=EG&limit=40',{
            headers:{
    
                'X-Api-Key':process.env.CITY_API_KEY
            }
        })
    
        console.log(cities.data);
    
        const ifCityExist=cities.data.find(c=>c.name===city);
        if(!ifCityExist){
            return next(new AppError('city not found', 404));
        }
        
    const address = new Address({
        userId,
        country, city, postalCode, buldingNumber, floorNumber, addresslable, setAsDefault,
        isDefault: [true, false].includes(setAsDefault) ? setAsDefault : false,
    })

    // if default address is default return to undefault

    if (address.isDefault) {
        await Address.updateOne({ userId, isDefault: true }, { isDefault: false })
    }
    const newAddress = await address.save()
    res.status(200).json({
        status: "success",
        data: newAddress
    })
}



export const updateAddress = async (req, res, next) => {
    const { country, city, postalCode, buldingNumber, floorNumber, addresslable, setAsDefault } = req.body;

    const userId = req.authaUser._id;
    const { addressId } = req.params;

    const address = await Address.findOne({ _id: addressId, userId, isMarkedAsDeleted: false })

    if (!address) {
        return next(new AppError("address not found", 404))
    }

   

    if (country) address.country = country
    if (city) address.city = city
    if (postalCode) address.postalCode = postalCode
    if (buldingNumber) address.buldingNumber = buldingNumber
    if (floorNumber) address.floorNumber = floorNumber
    if (addresslable) address.addresslable = addresslable
    if ([true, false].includes(setAsDefault)) {
        address.isDefault = [true, false].includes(setAsDefault) ? setAsDefault : false
        await Address.updateOne({ userId, isDefault: true }, { isDefault: false })
    }



    const updatedAddress = await address.save()
    res.status(200).json({
        status: "success",
        data: updatedAddress
    })




}


export const deleteAddress = async (req, res, next) => {


    const userId = req.authaUser._id;
    const { addressId } = req.params;

    const address = await Address.findOneAndUpdate({ _id: addressId, userId, isMarkedAsDeleted: false },{ isMarkedAsDeleted: true,isDefault:false },{ new: true })

    if (!address) {
        return next(new AppError("address not found", 404))
    }

    res.status(200).json({
        status: "success",
        data: address
    })

   
}


export const getAllAddress = async (req, res, next) => {

    const userId = req.authaUser._id;

    const address = await Address.find({ userId, isMarkedAsDeleted: false })

    res.status(200).json({
        status: "success",
        data: address
    })
}
