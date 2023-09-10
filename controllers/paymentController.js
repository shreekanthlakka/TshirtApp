const BigPromise = require('../middlewares/bigPromise');
const stripe = require('stripe')(process.env.STRIPE_API_SECRET);

exports.sendStripeKey = BigPromise(async(req,res,next) => {
        res.status(200).json({
                stripekey:process.env.STRIPE_API_PK
        })
});

exports.captureStripePayments = BigPromise(async(req,res,next) => {
        const paymentintent = await stripe.paymentIntents.create({
                amount : req.body.amount,
                currency:'inr',

                //optional
                metadata: {integration_check:accept_a_payment},
        });
        res.statue(200).json({
                sucess:true,
                client_secret:paymentintent.client_secret,
                amount:req.body.amount,
                //we can also send id
        })
});

exports.sendRazorPayKey = BigPromise(async(req,res,next) => {
        res.status(200).json({
                razorpaykey:process.env.RAZORPAY_API_PK
        })
});

exports.captureRazorPayPayments = BigPromise(async(req,res,next) => {
        const instance = new Razorpay({
                key_id :process.env.RAZORPAY_API_KEY,
                key_secret :process.env.RAZORPAY_API_SECRET
        })
        const options = {
                amount : req.body.amount,
                currency : 'inr',

        };
        const myorder = instance.orders.create(options);
        res.statue(200).json({
                sucess:true,
                amount:req.body.amount,
                order:myorder
        });
});