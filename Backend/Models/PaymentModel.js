

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "PKR",
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Success", "Failed"],
    default: "Pending",
  },
  paymentMethod: {
    type: String,
    enum: ["CreditCard", "BankTransfer", "Wallet"],
    default: null
  },
  transactionId: {
    type: String,
    index: true
  },
  paymentDate: {
    type: Date,
  },
  payfastPaymentId: {
    type: String,
    index: true
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

// Indexes for faster queries
paymentSchema.index({ user: 1, course: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ createdAt: -1 });

// Pre-save hook
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Payment status methods
paymentSchema.methods.markAsSuccess = function(txId, paymentDate, gatewayData) {
  this.paymentStatus = "Success";
  this.transactionId = txId;
  this.paymentDate = paymentDate || new Date();
  this.gatewayResponse = gatewayData;
  return this.save();
};

paymentSchema.methods.markAsFailed = function(gatewayData) {
  this.paymentStatus = "Failed";
  this.gatewayResponse = gatewayData;
  return this.save();
};



// Static method to find successful payments for a course
paymentSchema.statics.findSuccessfulPayments = function(courseId) {
  return this.find({
    course: courseId,
    paymentStatus: "Success"
  }).populate('user', 'name email');
};

module.exports = mongoose.model("Payment", paymentSchema);