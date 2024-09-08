
import joi from 'joi'
import { coupenTypes } from '../../utilites/enums.js'
import { genralRouls } from '../../utilites/generalRouls.js'
export const createCoupenSchema = {
    body: joi.object({
        coupenCode: joi.string().required(),
        users: joi.array().items(joi.object({
            userId: genralRouls._id.required(),
            maxCount: joi.number().min(1).required()
        })).required(),
        from: joi.date().greater(Date.now()).required(),
        till: joi.date().greater(joi.ref('from')).required(),
        coupenType: joi.string().valid(...Object.values(coupenTypes)).required(),
        coupenAmount: joi.number().when('coupenType', {
            is: joi.string().valid(coupenTypes.Percentage),
            then: joi.number().max(100).required(),
        }).min(1).required().messages({

            'number.min': 'coupen amount must be greater than 0',
            'number.max': 'coupen amount must be less than 100'
        })

    })
}


export const  updateCoupenSchema = {
    body: joi.object({
        coupenCode: joi.string().optional(),
        users: joi.array().items(joi.object({
            userId: genralRouls._id,
            maxCount: joi.number().min(1).optional()
        })),
        from: joi.date().greater(Date.now()).optional(),
        till: joi.date().greater(joi.ref('from')).optional(),
        coupenType: joi.string().valid(...Object.values(coupenTypes)).optional(),
        coupenAmount: joi.number().when('coupenType', {
            is: joi.string().valid(coupenTypes.Percentage),
            then: joi.number().max(100).optional(),
        }).min(1).messages({
            'number.min': 'coupen amount must be greater than 0',
            'number.max': 'coupen amount must be less than 100'
        })
    }),
    params: joi.object({
        coupenId: genralRouls._id.required()
    }),
    authUser:joi.object({    
        _id:genralRouls._id.required()
    }).optional({allowUnknown: true})
}