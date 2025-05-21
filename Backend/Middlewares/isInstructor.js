const catchAsyncError = require('./catchAsyncError.js');


// Combined middleware approach
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ErrorHandler = require('./errorsmiddleware.js'); 

const isAuthInstructor = [
    // 1. First check authentication
    (req, _, next) => {
      if (!req.cookies || !req.cookies.token) {
        return next(new ErrorHandler("Authentication token missing", 401));
      }
      next();
    },
    (req, _, next) => {
      const token = req.cookies.token;
      if (!token) {
        return next(new ErrorHandler("Login required", 401));
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Set userId first
        next();
      } catch (error) {
        return next(new ErrorHandler("Invalid token", 401));
      }
    },
    
    // 2. Then fetch user and check role
    catchAsyncError(async (req, _, next) => {
      const user = await import('mongoose').then(({ default: mongoose }) => mongoose.model('User').findById(req.userId));
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      
      if (user.role !== "instructor") {
        return next(new ErrorHandler("Instructor access only", 403));
      }
      
      req.user = user; // Attach full user object
      next();
    })
  ];


  module.exports = {isAuthInstructor};