import express from 'express'
import { databaseConnected } from './database/dbConnection.js'
import { config } from 'dotenv'
import jwt from 'jsonwebtoken'


import { globalErrorHand } from './src/utilites/globalErrorHandling.js'
import { AppError } from './src/utilites/classError.js'
import categoriesRouter from './src/Modules/Categories/categories.routes.js'
import subCatagoriesRouter from './src/Modules/Sub-Categories/sub-categories.routes.js'
import brandsRoute from './src/Modules/Brand/brands.routes.js'
import productRouter from './src/Modules/Products/products.routes.js'
import userRouter from './src/Modules/user/user.routes.js'
import { User } from './database/Models/user.model.js'
import addressRouter from './src/Modules/address/address.routes.js'
import cartRouter from './src/Modules/cart/cart.routes.js'
import coupenRouter from './src/Modules/coupen/coupen.routes.js'
import {  disableCopunescroneJob } from './src/utilites/crones.js'
import { gracefulShutdown } from 'node-schedule'
import orderRouter from './src/Modules/order/order.routes.js'
import ReviewRouter from './src/Modules/reviews/review.routes.js'


config()

const app = express()
const port = process.env.PORT || 5000;


app.use(express.json())
app.use('/catagory',categoriesRouter)
app.use('/subCatagory',subCatagoriesRouter)
app.use('/brand',brandsRoute)
app.use('/product',productRouter)
app.use('/user',userRouter)
app.use('/address',addressRouter)
app.use('/cart',cartRouter)
app.use('/coupen',coupenRouter)
app.use('/order',orderRouter)
app.use('/review',ReviewRouter)


disableCopunescroneJob()
// gracefulShutdown()

app.use('*',(req,res,next)=>{
    // res.status(404).json({message:'page not found'})
    
   return next(new AppError(`invalid url${req.originalUrl}`,404))
})



// global err

app.use(globalErrorHand)


// verify Email


app.get('/verify/:token', async (req, res) => {
    jwt.verify(req.params.token, 'nour', async (err, payload) => {
        if (err) return res.json(err)
        await User.findOneAndUpdate({ email: payload.email }, { isEmailVerified: true })
        res.json({ message: 'success', email: payload.email })
    })

})


app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))