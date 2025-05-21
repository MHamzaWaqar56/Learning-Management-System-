const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../Middlewares/auth');
const { createQuiz, getAdminQuiz ,addQuestions, updateQuiz, getQuizStats, getQuizQuestions, updateQuestion, deleteQuestion } = require('../Controllers/AdminQuizController');
const { getQuiz, submitQuiz, getQuizResults } = require('../Controllers/UserQuizController');


// Admin/Instructor routes
router.post('/:courseId/createquiz', isAuthenticated , authorizeRoles("admin" , "instructor") , createQuiz);
router.get('/:courseId/getquiz', isAuthenticated , authorizeRoles("admin" , "instructor"), getAdminQuiz);
router.post('/quiz/:quizId/questions', isAuthenticated , authorizeRoles("admin" , "instructor") , addQuestions);
router.patch('/quiz/:quizId', isAuthenticated , authorizeRoles("admin" , "instructor") , updateQuiz);
router.get('/quiz/:quizId/stats', isAuthenticated , authorizeRoles("admin" , "instructor") , getQuizStats);
router.get('/quiz/:quizId/getquestions', isAuthenticated , authorizeRoles("admin" , "instructor") , getQuizQuestions);
router.patch('/quiz/:quizId/questions/:questionId', isAuthenticated , authorizeRoles("admin" , "instructor") , updateQuestion);
router.delete('/quiz/:quizId/questions/:questionId', isAuthenticated , authorizeRoles("admin" , "instructor") , deleteQuestion);




// Student routes
router.get('/courses/:courseId/attempt-quiz', isAuthenticated , getQuiz);
router.post('/courses/:courseId/quiz/:quizId/submit-quiz', isAuthenticated , submitQuiz);
router.get('/courses/:courseId/quiz/:quizId/results' , isAuthenticated , getQuizResults);

module.exports = router;