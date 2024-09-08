import { Router } from "express";
import { login, registerUser, updateUser } from "./user.controller.js";
import { asyncHandel } from "../../utilites/globalErrorHandling.js";


const userRouter=Router()

userRouter.post('/signUp',asyncHandel(registerUser))

userRouter.put('/update/:userId',asyncHandel(updateUser))

userRouter.post('/login',asyncHandel(login))



export default userRouter