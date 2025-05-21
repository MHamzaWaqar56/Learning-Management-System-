// routes/instructor.js
const express = require('express');
const { getInstructorDashboard, getCourseAnalysis, getInstructorCourses } = require('../Controllers/InstructorDashboardController');
const { isAuthenticated, authorizeRoles } = require('../Middlewares/auth');
const router = express.Router();

router.get('/dashboard/:instructorId', isAuthenticated , authorizeRoles("instructor") ,  getInstructorDashboard);

router.get('/course/:courseId/analysis', isAuthenticated , authorizeRoles("instructor") , getCourseAnalysis);

router.get('/courses/:instructorId', isAuthenticated ,  getInstructorCourses);

module.exports = router;
