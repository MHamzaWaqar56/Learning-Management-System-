// POST /api/quizzes

const catchAsyncError = require("../Middlewares/catchAsyncError");
const { ErrorHandler } = require("../Middlewares/errorsmiddleware");
const { Course, CourseQuiz } = require("../Models/CourseModel");

// Create a new quiz for a course (admin/instructor only)
const createQuiz = catchAsyncError(async (req, res, next) => {
    const { title, description, passingScore, timeLimit } = req.body;
    const { courseId } = req.params; // اب یہ URL سے آئے گا
    
    // Verify the user is admin or course instructor
    const course = await Course.findById(courseId);
    if (!course) return next(new ErrorHandler('Course not found', 404));
    
    if (req.user.role !== 'admin' && !course.instructor.equals(req.user._id)) {
      return next(new ErrorHandler('Not authorized to create quiz for this course', 403));
    }

    const quiz = await CourseQuiz.create({
      courseId,
      title,
      description,
      passingScore,
      timeLimit,
      createdBy: req.user._id
    });

    // Link quiz to course
    course.quiz = quiz._id;
    await course.save();

    res.status(201).json({
      success: true,
      quiz
    });
});

// get Quiz Data        
const getAdminQuiz = catchAsyncError(async (req, res, next) => {
    const quiz = await CourseQuiz.findOne({ 
      courseId: req.params.courseId 
    });
  
    if (!quiz) {
      return next(new ErrorHandler('Quiz not found', 404));
    }
  
    res.status(200).json({
      success: true,
      quiz
    });
  });


  // POST /api/quizzes/:quizId/questions
// Add questions to a quiz (admin/instructor only)
const addQuestions = catchAsyncError(async (req, res, next) => {
    const { questions } = req.body;
    const quiz = await CourseQuiz.findById(req.params.quizId);
  
    if (!quiz) return next(new ErrorHandler('Quiz not found', 404));
  
    // Verify ownership
    const course = await Course.findOne({ quiz: quiz._id });
    if (req.user.role !== 'admin' && !course.instructor.equals(req.user._id)) {
      return next(new ErrorHandler('Not authorized to modify this quiz', 403));
    }
  
    quiz.questions.push(...questions);
    await quiz.save();
  
    res.status(200).json({
      success: true,
      quiz
    });
  });



  // PATCH /api/quizzes/:quizId
// Update quiz settings (admin/instructor only)
const updateQuiz = catchAsyncError(async (req, res, next) => {
    const updates = req.body;
    const quiz = await CourseQuiz.findById(req.params.quizId);
  
    if (!quiz) return next(new ErrorHandler('Quiz not found', 404));
  
    // Verify ownership
    const course = await Course.findOne({ quiz: quiz._id });
    if (req.user.role !== 'admin' && !course.instructor.equals(req.user._id)) {
      return next(new ErrorHandler('Not authorized to modify this quiz', 403));
    }
  
    Object.keys(updates).forEach(update => quiz[update] = updates[update]);
    await quiz.save();
  
    res.status(200).json({
      success: true,
      quiz
    });
  });



  // GET /api/quizzes/:quizId/stats
// Get quiz statistics (admin/instructor only)
const getQuizStats = catchAsyncError(async (req, res, next) => {
    const quiz = await CourseQuiz.findById(req.params.quizId);
    if (!quiz) return next(new ErrorHandler('Quiz not found', 404));
  
    // Verify ownership
    const course = await Course.findOne({ quiz: quiz._id });
    if (req.user.role !== 'admin' && !course.instructor.equals(req.user._id)) {
      return next(new ErrorHandler('Not authorized to view this quiz', 403));
    }
  
    const stats = {
      totalAttempts: 0,
      averageScore: 0,
      passRate: 0,
      questionStats: []
    };
  
    // Get all courses using this quiz (for multi-section courses)
    const courses = await Course.find({ quiz: quiz._id }).populate('students.user');
  
    // Calculate statistics
    let totalScore = 0;
    let passedCount = 0;
    let totalAttempts = 0;
    const questionStats = quiz.questions.map(q => ({
      questionId: q._id,
      correctCount: 0,
      totalAttempts: 0
    }));
  
    courses.forEach(course => {
      course.students.forEach(student => {
        student.quizAttempts.forEach(attempt => {
          totalAttempts++;
          totalScore += attempt.score;
          if (attempt.passed) passedCount++;
          
          attempt.answers.forEach(answer => {
            const qStat = questionStats.find(q => q.questionId.equals(answer.questionId));
            if (qStat) {
              qStat.totalAttempts++;
              if (answer.isCorrect) qStat.correctCount++;
            }
          });
        });
      });
    });
  
    if (totalAttempts > 0) {
      stats.totalAttempts = totalAttempts;
      stats.averageScore = Math.round(totalScore / totalAttempts);
      stats.passRate = Math.round((passedCount / totalAttempts) * 100);
      stats.questionStats = questionStats.map(q => ({
        ...q,
        successRate: Math.round((q.correctCount / q.totalAttempts) * 100) || 0
      }));
    }
  
    res.status(200).json({
      success: true,
      stats
    });
  });




const getQuizQuestions = catchAsyncError( async (req, res) => {
    try {
      const { quizId } = req.params;
  
      const quiz = await CourseQuiz.findById(quizId).select('questions');
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
  
      res.json({
        count: quiz.questions.length,
        questions: quiz.questions
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to fetch questions',
        error: error.message 
      });
    }
  });
  
  // Update a question
const updateQuestion = catchAsyncError( async (req, res) => {
    try {
      const { quizId, questionId } = req.params;
      const updateData = req.body;
  
      const quiz = await CourseQuiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
  
      const question = quiz.questions.id(questionId);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
  
      // Update question fields
      Object.assign(question, updateData);
      await quiz.save();
  
      res.json({
        message: 'Question updated successfully',
        question
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to update question',
        error: error.message 
      });
    }
  });
  
  // Delete a question
const deleteQuestion = catchAsyncError( async (req, res) => {
    try {
      const { quizId, questionId } = req.params;
  
      const quiz = await CourseQuiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
  
      quiz.questions.pull(questionId);
      await quiz.save();
  
      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to delete question',
        error: error.message 
      });
    }
  });




  module.exports = {
    createQuiz, getAdminQuiz , addQuestions , updateQuiz , getQuizStats, getQuizQuestions , updateQuestion , deleteQuestion
  }