const express = require('express');
const router = express.Router();

const { isLoggedIn, customRole } = require('../middlewares/user');
const { 
        sendStripeKey, 
        sendRazorPayKey, 
        captureStripePayments, 
        captureRazorPayPayments 
} = require('../controllers/paymentController');

router.route('/stripekey').get(isLoggedIn , sendStripeKey);
router.route('/razorpaykey').get(isLoggedIn , sendRazorPayKey);

router.route('/capturestripe').post(isLoggedIn , captureStripePayments);
router.route('/capturerazorpay').post(isLoggedIn , captureRazorPayPayments);





module.exports = router;
