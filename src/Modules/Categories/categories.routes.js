import { Router } from "express";
import { createCatagory, deleteCatagory, getAllCatagories, listCatagories, updateCatagory } from "./categories.controller.js";
import { asyncHandel } from "../../utilites/globalErrorHandling.js";
import { multerHost } from "../../middleware/multerLocal.js";
import { extention } from "../../utilites/fileExtention.js";
import { getDocumentsName } from "../../middleware/finder.js";
import { Category } from "../../../database/Models/category.model.js";



const categoriesRouter = Router()

categoriesRouter.post('/create',
    multerHost({ allawedExtention: extention.Image }).single("image"),
    getDocumentsName(Category)
    , asyncHandel(createCatagory))


categoriesRouter.get('/', asyncHandel(getAllCatagories))

categoriesRouter.put('/update/:id',
    multerHost({ allawedExtention: extention.Image }).single("image"),
    getDocumentsName(Category),
    asyncHandel(updateCatagory))


categoriesRouter.delete('/delete/:id', asyncHandel(deleteCatagory))

categoriesRouter.get('/list', asyncHandel(listCatagories))

export default categoriesRouter