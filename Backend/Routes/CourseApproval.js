const express = require('express');
const router = express.Router();

const { isAuthenticated, authorizeRoles } = require('../Middlewares/auth');
const { approveCourse, getAllApprovedCourses, disapproveCourse  } = require('../Controllers/UserCourseController');

router.patch('/:courseId/approve', isAuthenticated , authorizeRoles("admin") , approveCourse);  
router.get('/getcourses' , getAllApprovedCourses);
router.patch('/:courseId/disapprove', isAuthenticated , authorizeRoles("admin") , disapproveCourse); 



module.exports = router;
