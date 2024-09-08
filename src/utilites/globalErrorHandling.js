

export const asyncHandel = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => {
            // res.status(500).json({message:'catchError',err})
            next(err)
        })
    }

}

export const globalErrorHand=(err,req,res,next)=>{
    res.status(err.statusCode||500).json({message:"error",err:err.message})
}