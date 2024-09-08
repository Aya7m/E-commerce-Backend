import { Router } from "express";
import { cancleOrder, createOrder, deliverOrder, listOrders, paymentWithStrip, refundPayment, stripeWebhockLocal } from "./order.controller.js";
import { auth } from "../../middleware/auth.js";
import { asyncHandel } from "../../utilites/globalErrorHandling.js";


const orderRouter=Router()


orderRouter.post('/create', auth(),asyncHandel(createOrder))
orderRouter.put('/cancel/:orderId',auth(),asyncHandel(cancleOrder))
orderRouter.put('/delevered/:orderId',auth(),asyncHandel(deliverOrder))
orderRouter.get('/list',auth(),asyncHandel(listOrders))
orderRouter.post('/stripePay/:orderId',auth(),asyncHandel(paymentWithStrip))
orderRouter.post('/webhook',asyncHandel(stripeWebhockLocal))
orderRouter.post('/refund/:orderId',auth(),asyncHandel(refundPayment))


export default orderRouter