import { Router } from "express";
import { asyncHandel } from "../../utilites/globalErrorHandling.js";
import { createProduct, deleteProduct, getProducts, updateProduct } from "./products.controller.js";
import { multerHost } from "../../middleware/multerLocal.js";
import { extention } from "../../utilites/fileExtention.js";
import { checkIfIdsExit } from "../../middleware/finder.js";
import { Brand } from "../../../database/Models/brand.model.js";
import { Product } from "../../../database/Models/product.model.js";


const productRouter=Router();


productRouter.post('/create',
    multerHost({ allawedExtention: extention.Image }).array("image", 5),
    checkIfIdsExit(Brand)

   
    
    ,asyncHandel(createProduct))
    
productRouter.put('/update/:productId',
    asyncHandel(updateProduct))


    productRouter.get('/', asyncHandel(getProducts))
    productRouter.delete('/delete/:productId', asyncHandel(deleteProduct))

export default productRouter