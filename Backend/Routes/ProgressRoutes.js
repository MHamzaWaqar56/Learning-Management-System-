const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../Middlewares/auth');
const { 
  completeLesson, 
  getCourseProgress
} = require('../Controllers/ProgressController');

// Mark lesson as complete
router.put('/courses/:courseId/lessons/:lessonId/complete', isAuthenticated, completeLesson);

// Get course progress
router.get('/courses/:courseId/progress', isAuthenticated, getCourseProgress);

module.exports = router;