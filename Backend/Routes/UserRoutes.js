const express = require("express");
const {
  registerController,
  verifyOTPController,
  loginController,
  logoutController,
  getUserController,
  forgotPasswordController,
  userProfileEdit,
  getUserProfileData,
  resetPasswordController,
} = require("../Controllers/UserController");
const router = express.Router();
const { isAuthenticated } = require("../Middlewares/auth.js");
const { getAllUserCourses, getCourseLectures } = require("../Controllers/UserCourseController.js");

// register
router.post("/register", registerController);
router.post("/otp-verification", verifyOTPController);
router.post("/login", loginController);
router.get("/logout", isAuthenticated, logoutController);
router.get("/courses", getAllUserCourses);
router.get("/courses/:courseId/lectures", getCourseLectures);
router.get("/me", isAuthenticated, getUserController);
router.post("/password/forgot", forgotPasswordController);
router.put("/password/reset/:token", resetPasswordController);
router.get('/profile', isAuthenticated, getUserProfileData);

router.put("/profile/edit", isAuthenticated, userProfileEdit);


module.exports = router;
