
const Payment = require("../Models/PaymentModel");
const User = require("../Models/UserModel");
const Order = require("../Models/OrderModel");
const { Course } = require("../Models/CourseModel");
const querystring = require('querystring');
const crypto = require('crypto');
const verifyPayfastSignature = require("../utils/verifiyPayfastSignature");

// Initialize Payment
const initiatePayment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Fetch user and course details
    const [user, course] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId)
    ]);

    if (!user || !course) {
      return res.status(404).json({ 
        success: false, 
        message: "User or course not found" 
      });
    }

    // Create order first
    const order = await Order.create({
      user: userId,
      course: courseId,
      amount: course.discountedPrice,
      paymentGateway: "Payfast",
      currency: "PKR"
    });

    // Create payment record
    const payment = await Payment.create({
      user: userId,
      course: courseId,
      order: order._id,
      amount: course.discountedPrice,
      currency: "PKR",
      paymentStatus: "Pending"
    });


    // Prepare PayFast data
    const paymentData = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: `${process.env.FRONTEND_URL}/payment-success?payment=${payment._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?payment=${payment._id}`,
      notify_url: `${process.env.BACKEND_URL}/api/v1/notification/notify`,


      name_first: user.name.split(' ')[0],
      name_last: user.name.split(' ')[1] || '',
      email_address: user.email,
      // cell_number: user.phone || '',
      m_payment_id: payment._id.toString(),
      amount: course.discountedPrice.toFixed(2),
      item_name: course.title,
      item_description: `Payment for ${course.title} course`,
    };

    const paymentURL = `https://sandbox.payfast.co.za/eng/process?${querystring.stringify(paymentData)}`;

    res.status(200).json({ 
      success: true, 
      url: paymentURL,
      paymentId: payment._id,
      orderId: order._id
    });

  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Payment initiation failed",
      error: error.message 
    });
  }
};





const handlePaymentNotification = async (req, res) => {
  try {
    const data = req.body;

    console.log("Received PayFast Notification:", data);


    // ✅ Step 1: Verify Signature
    const isValid = verifyPayfastSignature(data);
    if (!isValid) {
      console.warn("❌ Invalid PayFast Signature");
      return res.status(400).send("Invalid Signature");
    }

    const paymentId = data.m_payment_id;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    const isSuccess = data.payment_status === "COMPLETE";

    // ✅ Step 2: Update Payment
    await payment[isSuccess ? 'markAsSuccess' : 'markAsFailed'](
      data.pf_payment_id,
      new Date(),
      data
    );

    // ✅ Step 3: Update Order
    const order = await Order.findById(payment.order);
    if (order) {
      await order[isSuccess ? 'markAsPaid' : 'markAsFailed'](payment._id);
    }

    // ✅ Step 4: Enroll User
    if (isSuccess) {
      await User.findByIdAndUpdate(payment.user, {
        $addToSet: { courses: payment.course }
      });
    }

    console.log("✅ PayFast IPN Verified and Processed");

    res.status(200).send("ITN received");

  } catch (error) {
    console.error("Payment notification error:", error);
    res.status(500).send("ITN processing failed");
  }
};




// Verify Payment Status
const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.status(200).json({
      success: true,
      paymentStatus: payment.paymentStatus,
      payment
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};

// Success Callback
const handleSuccess = async (req, res) => {
  try {
    const { payment } = req.query;
    const paymentRecord = await Payment.findById(payment);
    console.log("Record :", paymentRecord);

    if (!paymentRecord) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=payment_not_found`);
    }

    if (paymentRecord.paymentStatus === 'Success') {
      return res.redirect(`${process.env.FRONTEND_URL}/courses/${paymentRecord.course}?payment=success`);
    }


    // If payment not yet confirmed, redirect to verification
    res.redirect(`${process.env.FRONTEND_URL}/payment/verify?payment=${payment}`);

  } catch (error) {
    console.error('Success callback error:', error);
    // res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=server_error`);
  }
};

// Cancel Callback
const handleCancel = async (req, res) => {
  try {
    const { payment } = req.query;
    await Payment.findByIdAndUpdate(payment, {
      paymentStatus: 'Failed'
    });

    // res.redirect('http://localhost:5173/payment-failed');
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?payment=${payment}`);

  } catch (error) {
    console.error('Cancel callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=server_error`);
  }
};

module.exports = { 
  initiatePayment,
  handlePaymentNotification,
  verifyPayment,
  handleSuccess,
  handleCancel
};