import { Router } from "express";
import { asyncHandel } from "../../utilites/globalErrorHandling.js";
import { addToCart, getCart, removeFromCart, updateCart} from "./cart.controller.js";
import { auth } from "../../middleware/auth.js";


const cartRouter=Router()

cartRouter.post('/add/:productId',auth(),asyncHandel(addToCart))
cartRouter.put('/remove/:productId',auth(),asyncHandel(removeFromCart))
cartRouter.put('/update/:productId',auth(),asyncHandel(updateCart))
cartRouter.get('/',auth(),asyncHandel(getCart))


export default cartRouter