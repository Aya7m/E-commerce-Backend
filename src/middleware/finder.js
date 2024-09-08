
import { AppError } from "../utilites/classError.js"

export const getDocumentsName = (model) => {
    return async (req, res, next) => {
        const { name } = req.body
        // find by name

        if (name) {
            const document = await model.findOne({ name })
            if (document) {
                return next(new AppError("this document name is exist", 404))
            }

        }
        next()
    }

}


export const checkIfIdsExit = (model) => {
    return async (req, res, next) => {
        const { catagory, subCatagory, brand } = req.query
        const brandDocument = await model.findOne({
            _id: brand,
            categoryId: catagory,
            subCategoryId: subCatagory
        }).populate([
            {
                path: 'categoryId',
                select: 'customId'
            },
            {
                path: 'subCategoryId',
                select: 'customId'
            },
        ])

        // console.log(brandDocument);


        if (!brandDocument) {
            return next(new AppError(`${model.modelName} not found}`, 404))
        }


        req.brandDocument = brandDocument;


        next();
    };


};