class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Error Middleware for handling errors globally
const errorsMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error.";

  // Handling CastError (invalid object ids, etc.)
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}`;
    err = new ErrorHandler(message, 400); // 'new' keyword ka use
  }

  // Handling invalid JSON Web Token errors
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again.`;
    err = new ErrorHandler(message, 400); // 'new' keyword ka use
  }

  // Handling expired JSON Web Token errors
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is expired, Try again.`;
    err = new ErrorHandler(message, 400); // 'new' keyword ka use
  }

  // Handling duplicate entry errors (e.g., MongoDB duplicate key error)
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
    err = new ErrorHandler(message, 400); // 'new' keyword ka use
  }

  // Responding with error message and status code
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports = { errorsMiddleware, ErrorHandler };



