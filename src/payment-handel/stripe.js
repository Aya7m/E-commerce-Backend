
import Stripe from 'stripe';
import { Copune } from '../../database/Models/copune.model.js';






export const createCheckoutSession = async ({
    customer_email,
    metadata,
    disconnect,
    line_items

}) => {
    const stripe = new Stripe(process.env.SECRIT_SRTIPE_KEY)

    const paymentData = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email,
        metadata,
        success_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL,
        disconnect,
        line_items,
    });

    return paymentData
}




export const createStripeCoupen = async ({ coupenId }) => {
    const findCoupen = await Copune.findById(coupenId)

    if (!findCoupen) {

        return next(new AppError('coupen not found', 404))

    }

    // let coupenObj = {}
    
    // if (findCoupen.coupenType == DescountType.Amount) {
    //     coupenObj = {
    //         name: findCoupen.coupenCode,
    //         amount_off: findCoupen.coupenAmount * 100,
    //         currency: 'egp',
    //     }

    // }

    // if (findCoupen.coupenType == DescountType.PERCENTAGE) {
    //     coupenObj = {
    //         name: findCoupen.coupenCode,
    //         percent_off: findCoupen.coupenAmount,

    //     }

    // };

    // const stripe = new Stripe(process.env.SECRIT_SRTIPE_KEY)

    // const stripeCoupen = await stripe.coupons.create(coupenObj)


    // return stripeCoupen


    const stripe = new Stripe(process.env.SECRIT_SRTIPE_KEY)
    const stripeCoupen = await stripe.coupons.create({

        name: findCoupen.coupenCode,

        percent_off: findCoupen.coupenAmount,

    })
    const  strAmmCoupen=await stripe.coupons.create({

        name: findCoupen.coupenCode,

        amount_off: findCoupen.coupenAmount * 100,

        currency: 'egp',

    })

    return stripeCoupen || strAmmCoupen

}

// create payment method

export const createPaymentMethod = async ({token}) => {
    const stripe = new Stripe(process.env.SECRIT_SRTIPE_KEY)

    const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
   
            token,
        },
      });

    return paymentMethod
}

// create paymentIntent

export const createPaymentIntent = async ({ amount, currency }) => {
    const stripe = new Stripe(process.env.SECRIT_SRTIPE_KEY)
    const paymentMethod= await createPaymentMethod({token:'tok_visa'})

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects:"never"
        },
        

        payment_method:paymentMethod.id



    });
    return paymentIntent
}

// retrieve payment intent

export const retrievePaymentIntent = async ({ paymentIntentId }) => {

    const stripe = new Stripe(process.env.SECRIT_SRTIPE_KEY)

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent    

}


// conform payment intent

export const conformPaymentIntent=async({paymentIntentId})=>{


    const stripe = new Stripe(process.env.SECRIT_SRTIPE_KEY)

    const paymentDetails=await retrievePaymentIntent({paymentIntentId});
    const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentDetails.payment_method,
         
        }
      );

    return paymentIntent
}


export const refundPaymentData=async({paymentIntentId})=>{
    const stripe = new Stripe(process.env.SECRIT_SRTIPE_KEY)
    const refund = await stripe.refunds.create({
        payment_intent:paymentIntentId,
      });

    return refund
}