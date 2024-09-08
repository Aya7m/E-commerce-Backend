

const dataMethod = ['body', 'query', 'params', 'header', 'file', 'files']
export const validate = (schema) => {
    return (req, res, next) => {

        let arrError = []
        dataMethod.forEach((key) => {
            if (schema[key]) {
                const {error} = schema[key].validate(req[key], { abortEarly: false })
               
                if (error?.details) {
                    error.details.forEach((err)=>{
                      arrError.push(err.message)  
                    })
                    
                    
                }

            }
            

        })

        if(arrError.length){
            return res.status(400).json({message:'validation error',error:arrError})
        }

        next()


    }

}