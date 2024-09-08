import { Router } from "express";
import { createCoupen, disableOrEnableCoupen, getAllCoupen, getCoupenById, updateCoupen } from "./coupen.controller.js";
import { validate } from "../../middleware/validation.js";
import { createCoupenSchema, updateCoupenSchema } from "./coupen.schema.js";
import { asyncHandel } from "../../utilites/globalErrorHandling.js";
import { auth } from "../../middleware/auth.js";

const coupenRouter=Router()


coupenRouter.post('/create', auth(),validate(createCoupenSchema),asyncHandel(createCoupen))
coupenRouter.get('/list', auth(),asyncHandel(getAllCoupen))
coupenRouter.get('/details/:coupenId', auth(),asyncHandel(getCoupenById))
coupenRouter.put('/update/:coupenId', auth(),validate(updateCoupenSchema),asyncHandel(updateCoupen))
coupenRouter.put('/enable/:coupenId', auth(),asyncHandel(disableOrEnableCoupen))

export default coupenRouter