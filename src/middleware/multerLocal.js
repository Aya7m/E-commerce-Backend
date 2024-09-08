
import multer from "multer"
import fs from 'fs'
import path from 'path'
import { DateTime } from "luxon"
import { nanoid } from "nanoid"
import { extention } from "../utilites/fileExtention.js"
import { AppError } from "../utilites/classError.js"








export const multerLocal = ({ filePath = "general", allawedExtention } = {}) => {
    const distantionPath = path.resolve(`src/uploads/${filePath}`)
    if (!fs.existsSync(distantionPath)) {
        fs.mkdirSync(distantionPath, { recursive: true })
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, distantionPath)
        },
        filename: (req, file, cb) => {
            const uniquefileName = DateTime.now().toFormat("yyyy-mm-dd") +
                "__" + nanoid() + "__" + file.originalname;

            cb(null, uniquefileName)
        }

    })

    const fileFilter = (req, file, cb) => {
        if (allawedExtention?.includes(file.mimetype)) {
            return cb(null, true)
        }
        cb(new AppError("invalid file type only jpeg"), 400), false
    }
    const file = multer({ fileFilter, storage })
    return file

}


export const multerHost = ({ allawedExtention = extention.Image} = {}) => {


    const storage = multer.diskStorage({

        filename: (req, file, cb) => {
            const uniquefileName = DateTime.now().toFormat("yyyy-mm-dd") +
                "__" + nanoid() + "__" + file.originalname;

            cb(null, uniquefileName)
        }

    })

    const fileFilter = (req, file, cb) => {
        if (allawedExtention?.includes(file.mimetype)) {
            return cb(null, true)
        }
        cb(new AppError("invalid file type only jpeg"), 400), false
    }
    const file = multer({ fileFilter, storage })
    return file

}