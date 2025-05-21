
const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../Middlewares/auth');
const { enrollInCourse } = require('../Controllers/UserEnrollment');
const { checkEnrollment } = require('../Controllers/UserEnrollment');

router.post('/courses/:courseId/enroll', isAuthenticated , enrollInCourse);
router.get('/courses/:courseId/enrollment-status', isAuthenticated, checkEnrollment);


module.exports = router;