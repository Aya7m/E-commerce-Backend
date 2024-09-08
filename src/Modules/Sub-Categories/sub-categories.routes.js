import { Router } from "express"
import { asyncHandel } from "../../utilites/globalErrorHandling.js";
import { createSubCategory, deleteSubCategory, getSubCategory, updateSubCategory } from "./sub-categories.controller.js";
import { multerHost } from "../../middleware/multerLocal.js";
import { extention } from "../../utilites/fileExtention.js";
import { getDocumentsName } from "../../middleware/finder.js";
import { SubCategory } from "../../../database/Models/sub-category.model.js";


const subCatagoriesRouter = Router();


subCatagoriesRouter.post('/create',
    multerHost({ allawedExtention: extention.Image }).single("image"), getDocumentsName(SubCategory)
    , asyncHandel(createSubCategory))


subCatagoriesRouter.get('/', asyncHandel(getSubCategory))

subCatagoriesRouter.put('/update/:id',
    multerHost({ allawedExtention: extention.Image }).single("image"),
    getDocumentsName(SubCategory),
    asyncHandel(updateSubCategory))


subCatagoriesRouter.delete('/delete/:id', asyncHandel(deleteSubCategory))

export default subCatagoriesRouter