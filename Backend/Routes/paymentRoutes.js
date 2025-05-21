// // paymentRoutes.js
// const express = require('express');
// const { 
//   initiatePayment, 
//   handlePaymentNotification,
//   handleSuccess,
//   handleCancel,
//   verifyPayment
// } = require('../Controllers/paymentController');
// const { isAuthenticated } = require('../Middlewares/auth');

// const router = express.Router();

// router.post('/initiate/:courseId', isAuthenticated , initiatePayment);
// router.get('/success', isAuthenticated , handleSuccess);
// router.get('/cancel', isAuthenticated , handleCancel);
// router.get('/verify/:paymentId', isAuthenticated , verifyPayment);

// module.exports = router;



const express = require("express");
const router = express.Router();
const {
  initiateJazzcashPayment,
  handleJazzcashResponse,
  initiateEasypaisaPayment
} = require("../Controllers/JazzcashController");
const { isAuthenticated } = require('../Middlewares/auth');
// const { initiateEasypaisaPayment } = require("../Controllers/JazzcashController");


router.post("/initiate/:courseId", isAuthenticated, initiateJazzcashPayment);
router.post("/jazzcash/response", handleJazzcashResponse);
// router.post("/notify", handleJazzcashNotification);
// router.get("/verify/:paymentId", verifyJazzcashPayment);
// router.get("/success", handleJazzcashSuccess);
// router.get("/cancel", handleJazzcashCancel);

module.exports = router;

