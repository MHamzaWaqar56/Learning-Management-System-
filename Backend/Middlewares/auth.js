const catchAsyncError = require("./catchAsyncError.js");
const { ErrorHandler } = require("./errorsmiddleware.js");
const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel.js");

const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("User is not authenticated.", 400));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decoded.id);

  next();
});


const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};


module.exports = { isAuthenticated , authorizeRoles};


