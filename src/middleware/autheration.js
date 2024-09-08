import { AppError } from "../utilites/classError.js"



export const authorization=(allowRoules)=>{
    return async(req,res,next)=>{
        const user=req.authaUser
        if(!allowRoules.includes(user.role)){
            return next(new AppError("authorization Error",401))
        }
          next()
    }

  
}