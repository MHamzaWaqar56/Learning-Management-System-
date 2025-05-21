
// GET /api/courses/:courseId/quiz

const catchAsyncError = require("../Middlewares/catchAsyncError");
const { ErrorHandler } = require("../Middlewares/errorsmiddleware");
const { Course, CourseQuiz } = require("../Models/CourseModel");

// Get quiz for student attempt



const getQuiz = catchAsyncError(async (req, res, next) => {
    try{

        const course = await Course.findById(req.params.courseId);
    if (!course) return next(new ErrorHandler('Course not found', 404));
  
    // Check enrollment
    const isEnrolled = course.students.some(s => s.user.equals(req.user._id));
    if (!isEnrolled) return next(new ErrorHandler('Not enrolled in this course', 403));
  
    // Check course completion
    const enrollment = course.students.find(s => s.user.equals(req.user._id));
    if (enrollment.progress < 100) {
      return next(new ErrorHandler('Complete all lessons first', 400));
    }
  
    const quiz = await CourseQuiz.findById(course.quiz);
    console.log("Validate quiz :", quiz);
    if (!quiz) return next(new ErrorHandler('Quiz not available', 404));
  
    // Shuffle questions array using Fisher-Yates algorithm
    const shuffledQuestions = [...quiz.questions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }
  
    // For security, don't send correct answers
    const quizForStudent = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      passingScore : quiz.passingScore,
      questions: shuffledQuestions.map(q => ({
        _id: q._id,
        question: q.question,
        options : q.options,
        correctAnswer : q.correctAnswer
        // options: shuffleArray(q.options) // Also shuffle options if needed
      }))
    };
  
    res.status(200).json({
      success: true,
      quiz: quizForStudent
    })

    }catch(error){
        res.status(500).json({
            message: 'Failed to Get Quiz...',
            error: error.message }) 
    }
  });



// Helper function to shuffle arrays (can be used for options too)
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}


  // POST /api/courses/:courseId/quiz/attempt
// Submit quiz answers
const submitQuiz = catchAsyncError(async (req, res, next) => {
    try {
      const { answers, timeTaken } = req.body;
      const course = await Course.findById(req.params.courseId);
      
      if (!course) {
        return next(new ErrorHandler('Course not found', 404));
      }
  
      // Get the quiz document
      const quiz = await CourseQuiz.findById(course.quiz);
      if (!quiz) {
        return next(new ErrorHandler('Quiz not found', 404));
      }
  
      // Get question IDs from the quiz
      const questionIds = quiz.questions.map(q => q._id.toString());
  
      // Validate answers
      const answeredQuestionIds = Object.keys(answers);
      
      // Check for missing answers
      const missingAnswers = questionIds.filter(
        id => !answeredQuestionIds.includes(id)
      );

      
      if (missingAnswers.length > 0) {
        return next(new ErrorHandler(
          `Please answer all questions. Missing ${missingAnswers.length} answers`,
          400
        ));
      }

      // Proceed with submission
      const result = await course.attemptQuiz(req.user._id, answers, timeTaken);
      
      res.status(200).json({
        success: true,
        ...result
      });
    } catch(error) {
      console.error("Submission Error:", error);
      res.status(500).json({
        message: 'Quiz submission failed',
        error: error.message
      });
    }
  });



const getQuizResults = catchAsyncError(async (req, res, next) => {
   try{
    const course = await Course.findById(req.params.courseId);
   
    if (!course) return next(new ErrorHandler('Course not found', 404));
  
    const results = await course.getQuizResults(req.user._id);
    
    
    res.status(200).json({
      success: true,
      results
    });

   }catch(error){
    res.status(500).json({
        message: 'Failed to get Result...',
        error: error.message })

   }
  });




module.exports = { getQuiz , submitQuiz , getQuizResults}