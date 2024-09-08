import { Router } from "express";
import { asyncHandel } from "../../utilites/globalErrorHandling.js";
import { addAddress, deleteAddress, getAllAddress, updateAddress } from "./address.controller.js";
import { auth } from "../../middleware/auth.js";



const addressRouter=Router()

addressRouter.post('/add',auth(),asyncHandel(addAddress))
addressRouter.put('/update/:addressId',auth(),asyncHandel(updateAddress))
addressRouter.put('/soft-delete/:addressId',auth(),asyncHandel(deleteAddress))
addressRouter.get('/list',auth(),asyncHandel(getAllAddress))


export default addressRouter