
const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseById,
  getAllInstructors,
} = require('../Controllers/AdminController');
const formidable = require("express-formidable");
// const { isInstructor, isAuthInstructor } = require('../Middlewares/isInstructor');
const { isAuthenticated, authorizeRoles } = require('../Middlewares/auth');
const { getCourseStudents } = require('../Controllers/UserCourseController');
const { getEnrolledUsersByInstructor } = require("../Controllers/InstructorDashboardController")


// Course Management
router.get('/getcourses', isAuthenticated  , getAllCourses);
router.get('/course/:courseId', getCourseById);
// router.post('/create-courses', formidable(), createCourse);
router.post(
  '/create-courses',
  isAuthenticated, // Check authentication first
  authorizeRoles('admin', 'instructor'), // Then check roles
  formidable(), // Then parse form data
  createCourse // Finally handle the request
);
router.patch('/course/:courseId', isAuthenticated, updateCourse);
router.delete('/course/:courseId', isAuthenticated, deleteCourse); 
router.get('/:instructorId/enrolled-users',  isAuthenticated  , getEnrolledUsersByInstructor)


module.exports = router;
