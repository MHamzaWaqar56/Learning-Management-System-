// paymentRoutes.js
const express = require('express');
// const { isAuthenticated } = require('../Middlewares/auth');
const { handlePaymentNotification } = require('../Controllers/paymentController');


const router = express.Router();

router.post('/notify' , handlePaymentNotification);

module.exports = router;