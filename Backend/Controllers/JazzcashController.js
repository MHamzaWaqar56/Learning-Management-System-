require('dotenv').config();

const Payment = require("../Models/PaymentModel");
const User = require("../Models/UserModel");
const Order = require("../Models/OrderModel");
const { Course } = require("../Models/CourseModel");
const crypto = require("crypto");
const catchAsyncError = require('../Middlewares/catchAsyncError');

// Helper to create transaction date/time in required format YYYYMMDDHHMMSS
function makeTxnDate() {
  const now = new Date();
  return now.toISOString().slice(0,19).replace(/[-:T]/g,"");
}

// Helper to create expiry date/time (e.g. 15 mins later)
function makeTxnExpiryDate() {
  const now = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes later
  return now.toISOString().slice(0,19).replace(/[-:T]/g,"");
}

// Helper to generate secure hash for JazzCash
function generateSecureHash(params, hashKey) {
  // Sort keys alphabetically
  const orderedKeys = Object.keys(params).sort();

  // Create string "key=value&key=value&..." excluding pp_SecureHash
  const dataString = orderedKeys
    .filter(key => key !== "pp_SecureHash")
    .map(key => `${key}=${params[key]}`)
    .join('&');

  // Append hash key at the end
  const stringToHash = dataString + `&pp_SecureHash=${hashKey}`;

  // Generate SHA256 hash in uppercase hex format
  return crypto.createHash('sha256').update(stringToHash).digest('hex').toUpperCase();
}

// 🎯 Initiate JazzCash Payment
const initiateJazzcashPayment = catchAsyncError( async (req, res) => {
  try {

    const {
      JAZZCASH_MERCHANT_ID,
      JAZZCASH_PASSWORD,
      JAZZCASH_INTEGRITY_SALT,
      JAZZCASH_ENVIRONMENT,
    } = process.env;


    const { courseId } = req.params;
    const userId = req.user._id;

    const [user, course] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId),
    ]);

    if (!user || !course) {
      return res.status(404).json({ success: false, message: "User or Course not found" });
    }

    const order = await Order.create({
      user: userId,
      course: courseId,
      amount: course.discountedPrice,
      paymentGateway: "JazzCash",
      currency: "PKR",
    });

    const payment = await Payment.create({
      user: userId,
      course: courseId,
      order: order._id,
      amount: course.discountedPrice,
      currency: "PKR",
      paymentStatus: "Pending",
    });

    const txnRefNo = `T${Date.now()}`;

    // Prepare payment parameters
    const paymentData = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: JAZZCASH_MERCHANT_ID,
      pp_SubMerchantID: "",
      pp_Password: JAZZCASH_PASSWORD,
      pp_BankID: "",
      pp_ProductID: "",
      pp_TxnRefNo: txnRefNo,
      pp_Amount: (course.discountedPrice * 100).toFixed(0), // amount in paisa
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: makeTxnDate(),
      pp_BillReference: `REF${payment._id}`,
      pp_Description: `Payment for ${course.title}`,
      pp_TxnExpiryDateTime: makeTxnExpiryDate(),
      pp_SecureHash: "", // will be generated below
    //   pp_MerchantMPIN: "",
      pp_MobileNumber: user.mobile || "03001234567",
    //   pp_CNIC: user.cnic || "3520212345678",
      pp_MerchantUserName: user.name,
      pp_MerchantInvoiceNumber: `${payment._id}`,
    };

    // Generate secure hash
    paymentData.pp_SecureHash = generateSecureHash(paymentData, JAZZCASH_INTEGRITY_SALT);

    // console.log("Data :", paymentData.pp_SecureHash)

    // Payment URL (sandbox or live)
    const paymentUrl =
      JAZZCASH_ENVIRONMENT === "live"
        ? "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/"
        : "https://sandbox.jazzcash.com.pk/Sandbox/Home/callLogPagaRedirection";

    // Respond with payment form data and URL to frontend
    res.status(200).json({
      success: true,
      url: paymentUrl,
      params: paymentData,
      method: "POST",
      paymentId: payment._id,
      orderId: order._id,
    });
  } catch (error) {
    console.error("JazzCash Payment Init Error:", error);
    res.status(500).json({
      success: false,
      message: "JazzCash payment initiation failed",
      error: error.message,
    });
  }
});

// 🛎️ Handle JazzCash Response (Redirect after payment)
const handleJazzcashResponse = catchAsyncError( async (req, res) => {
  try {
    const data = req.method === "POST" ? req.body : req.query;

    console.log("JazzCash Response Data:", data);

    // Extract important fields
    const {
      pp_ResponseCode,
      pp_MerchantInvoiceNumber,
      pp_TxnRefNo,
      pp_SecureHash,
      pp_Amount,
      pp_TxnCurrency,
    } = data;

    if (!pp_MerchantInvoiceNumber) {
      return res.status(400).send("Invalid response: Missing invoice number");
    }

    // Fetch payment record
    const payment = await Payment.findById(pp_MerchantInvoiceNumber);
    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    // Prepare data for hash verification
    // Remove pp_SecureHash from data and then generate hash again to verify
    const hashKey = process.env.JAZZCASH_INTEGRITY_SALT;
    const paramsToVerify = { ...data };
    delete paramsToVerify.pp_SecureHash;

    const generatedHash = generateSecureHash(paramsToVerify, hashKey);

    if (generatedHash !== pp_SecureHash) {
      console.warn("Secure hash mismatch! Possible tampering.");
      return res.status(400).send("Hash verification failed");
    }

    // Check if payment succeeded
    const isSuccess = pp_ResponseCode === "000";

    if (isSuccess) {
      payment.paymentStatus = "Success";
      payment.transactionId = pp_TxnRefNo;
      payment.paymentResponse = data;
      await payment.save();

      // Mark order as paid
      const order = await Order.findById(payment.order);
      if (order) {
        order.status = "Paid";
        await order.save();
      }

      // Add course to user's purchased courses
      await User.findByIdAndUpdate(payment.user, {
        $addToSet: { courses: payment.course },
      });

      // Redirect to success page on frontend
      return res.redirect(
        `${process.env.FRONTEND_URL}/courses/${payment.course}?payment=success`
      );
    } else {
      // Payment failed
      payment.paymentStatus = "Failed";
      payment.transactionId = pp_TxnRefNo;
      payment.paymentResponse = data;
      await payment.save();

      // Mark order as failed
      const order = await Order.findById(payment.order);
      if (order) {
        order.status = "Failed";
        await order.save();
      }

      // Redirect to failure page on frontend
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
    }
  } catch (error) {
    console.error("JazzCash Response Handling Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=server_error`);
  }
});

module.exports = {
  initiateJazzcashPayment,
  handleJazzcashResponse,
};




/////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////


// const axios = require('axios');
// const base64 = require('base-64');
// const Payment = require("../Models/PaymentModel");
// const User = require("../Models/UserModel");
// const Order = require("../Models/OrderModel");
// const { Course } = require("../Models/CourseModel");
// const catchAsyncError = require('../Middlewares/catchAsyncError');

// // 🧠 Easypaisa MA Transaction API
// const initiateEasypaisaPayment = catchAsyncError(async (req, res) => {
//   try {
//     const {
//       EASYPAY_USERNAME,
//       EASYPAY_PASSWORD,
//       EASYPAY_STORE_ID,
//       EASYPAY_API_URL, // e.g., https://easypaystg.easypaisa.com.pk/easypay-service/rest/v4/initiate-ma-transaction
//     } = process.env;

//     const { courseId } = req.params;
//     const userId = req.user._id;

//     const [user, course] = await Promise.all([
//       User.findById(userId),
//       Course.findById(courseId),
//     ]);

//     if (!user || !course) {
//       return res.status(404).json({ success: false, message: "User or Course not found" });
//     }

//     const order = await Order.create({
//       user: userId,
//       course: courseId,
//       amount: course.discountedPrice,
//       paymentGateway: "Easypaisa",
//       currency: "PKR",
//     });

//     const payment = await Payment.create({
//       user: userId,
//       course: courseId,
//       order: order._id,
//       amount: course.discountedPrice,
//       currency: "PKR",
//       paymentStatus: "Pending",
//     });

//     const payload = {
//       orderId: `ORD-${Date.now()}`,
//       storeId: parseInt(EASYPAY_STORE_ID),
//       transactionAmount: course.discountedPrice.toFixed(2),
//       transactionType: "MA",
//       mobileAccountNo: user.mobile || "03451234567",
//       emailAddress: user.email,
//     };


//     const headers = {
//       "Content-Type": "application/json",
//       Credentials: base64.encode(`${EASYPAY_USERNAME}:${EASYPAY_PASSWORD}`)
//     };
    

//     // Call Easypaisa API
//     const { data } = await axios.post(EASYPAY_API_URL, payload, { headers });
//     console.log("Payload :", data);

//     // Check API response
//     if (data.responseCode === "0000") {
//       // Success
//       payment.paymentToken = data.transactionId;
//       payment.transactionId = data.transactionId;
//       payment.paymentResponse = data;
//       payment.paymentStatus = "Initiated";
//       await payment.save();

//       res.status(200).json({
//         success: true,
//         message: "Easypaisa payment initiated successfully.",
//         paymentId: payment._id,
//         orderId: order._id,
//         token: data.transactionId,
//         transactionDateTime: data.transactionDateTime,
//       });
//     } else {
//       payment.paymentStatus = "Failed";
//       payment.paymentResponse = data;
//       await payment.save();

//       res.status(400).json({
//         success: false,
//         message: "Failed to initiate Easypaisa payment.",
//         error: data.responseDesc,
//       });
//     }

//   } catch (error) {
//     console.error("Easypaisa Payment Init Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Easypaisa payment initiation failed",
//       error: error.message,
//     });
//   }
// });


// module.exports = {initiateEasypaisaPayment}