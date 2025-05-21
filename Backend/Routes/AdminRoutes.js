
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  promoteOrDemoteUser,
  deleteUser,
  getSystemAnalytics,
  getAllInstructors,
  getCourseEnrollmentAnalytics,
  getStudentProgressAnalytics,
  getUserAnalysis,
  getCourseAnalytics,
} = require('../Controllers/AdminController');
const { isAuthenticated, authorizeRoles } = require('../Middlewares/auth');




// Dashboard
router.get('/dashboard', getDashboardStats);
// router.get("/analytics", isAuthenticated , authorizeRoles("admin") , getAdminAnalytics);

// Course Enrollment Analytics
router.get("/analysis/course-enrollment", isAuthenticated , authorizeRoles("admin") , getCourseEnrollmentAnalytics);

// Student Progress Analytics
router.get("/analysis/student-progress", isAuthenticated , authorizeRoles("admin") , getStudentProgressAnalytics);

// User Analysis 
router.get("/analysis/users", isAuthenticated , authorizeRoles("admin") , getUserAnalysis);

// Courses Analysis 
router.get("/analysis/course-analytics" , isAuthenticated , authorizeRoles("admin") , getCourseAnalytics);


// User Management
router.get('/users', getAllUsers);
router.patch('/users/:userId/promote',  isAuthenticated, authorizeRoles("admin"), promoteOrDemoteUser);
router.delete('/users/:userId', deleteUser);

router.get('/instructors', getAllInstructors); 

// Analytics
router.get('/analytics', getSystemAnalytics);

module.exports = router;
