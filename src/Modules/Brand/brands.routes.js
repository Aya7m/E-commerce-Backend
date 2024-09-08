import { Router } from "express";
import { asyncHandel } from "../../utilites/globalErrorHandling.js";
import { createBrand, deleteBrand, getbrands, updateBrand } from "./brands.controller.js";
import { multerHost } from "../../middleware/multerLocal.js";
import { extention } from "../../utilites/fileExtention.js";
import { getDocumentsName } from "../../middleware/finder.js";
import { Brand } from "../../../database/Models/brand.model.js";
import { get } from "mongoose";

const brandsRoute = Router()

brandsRoute.post('/create', multerHost({ allawedExtention: extention.Image }).single("image"),
    getDocumentsName(Brand),
    asyncHandel(createBrand))


brandsRoute.get('/', asyncHandel(getbrands))

brandsRoute.put('/update/:id',
    multerHost({ allawedExtention: extention.Image }).single("image"),
    getDocumentsName(Brand),
    asyncHandel(updateBrand))

brandsRoute.delete('/delete/:id', asyncHandel(deleteBrand))

export default brandsRoute