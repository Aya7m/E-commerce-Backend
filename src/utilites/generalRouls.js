



import joi from 'joi'
import mongoose from 'mongoose'

const objectIdValidatuion=(value,helpers)=>{
    isvalid=mongoose.isValidObjectId(value)
    if(! isvalid){
        return helpers.message('invalid obj id')
    }
    return value
    
}

export const genralRouls = {
    _id: joi.string().required(objectIdValidatuion ),
}