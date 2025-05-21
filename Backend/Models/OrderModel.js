const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ["Created", "Attempted", "Paid", "Failed", "Cancelled"],
    default: "Created"
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  },
  paymentGateway: {
    type: String,
    enum: ["JazzCash" , "Easypaisa"],
    required: true
  },
  gatewayOrderId: {
    type: String
  },
  receipt: {
    type: String
  },
  currency: {
    type: String,
    default: "PKR"
  },
  attempts: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save hook to update updatedAt
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to initiate payment
orderSchema.methods.initiatePayment = async function() {
  this.orderStatus = "Attempted";
  this.attempts += 1;
  await this.save();
  return this;
};

// Method to mark payment success
orderSchema.methods.markAsPaid = async function(paymentId) {
  this.orderStatus = "Paid";
  this.payment = paymentId;
  await this.save();
  return this;
};

// Method to mark payment failed
orderSchema.methods.markAsFailed = async function() {
  this.orderStatus = "Failed";
  await this.save();
  return this;
};

module.exports = mongoose.model("Order", orderSchema);