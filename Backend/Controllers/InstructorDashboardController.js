const { default: mongoose } = require('mongoose');
const catchAsyncError =  require('../Middlewares/catchAsyncError');
const { ErrorHandler } = require('../Middlewares/errorsmiddleware');
const { Course } = require('../Models/CourseModel');
// const Course = require("../Models/CourseModel");

const getEnrolledUsersByInstructor = catchAsyncError( async (req, res, next) => {
  try {
    const { instructorId } = req.params;
    
    // 1. Find all courses by this instructor
    const courses = await Course.find({ instructor: instructorId })
      .populate({
        path: 'students.user',
        select: 'name email role' // Only get these fields
      });
    
    if (!courses || courses.length === 0) {
      return next(new ErrorHandler('No courses found for this instructor', 404));
    }
    
    // 2. Extract unique enrolled users
    const enrolledUsers = [];
    const userIds = new Set(); // To track unique users
    
    courses.forEach(course => {
      course.students.forEach(enrollment => {
        if (enrollment.user && !userIds.has(enrollment.user._id.toString())) {
          userIds.add(enrollment.user._id.toString());
          enrolledUsers.push({
            user: enrollment.user,
            enrolledAt: enrollment.enrolledAt,
            courses: [{
              courseId: course._id,
              courseTitle: course.title,
              progress: enrollment.progress
            }]
          });
        } else if (enrollment.user) {
          // If user already exists, just add the course info
          const existingUser = enrolledUsers.find(u => 
            u.user._id.toString() === enrollment.user._id.toString()
          );
          existingUser.courses.push({
            courseId: course._id,
            courseTitle: course.title,
            progress: enrollment.progress
          });
        }
      });
    });
    
    res.status(200).json({
      success: true,
      count: enrolledUsers.length,
      data: enrolledUsers
    });
    
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
});



const getInstructorDashboard = catchAsyncError( async (req, res) => {
  try {
    const instructorId = req.params.instructorId;

    // 🟡 1. Get all courses by this instructor
    const courses = await Course.find({ instructor: instructorId });

    // 🟡 2. Count of courses
    const totalCourses = courses.length;

    // 🟡 3. Get all enrolled students (aggregate unique users)
    const studentIdsSet = new Set();
    courses.forEach(course => {
      course.students.forEach(enroll => {
        studentIdsSet.add(enroll.user.toString());
      });
    });

    const totalStudents = studentIdsSet.size;

    // 🟡 4. Enrollment count for last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
    }).reverse();

    // Prepare a map for counts
    const enrollCountMap = {};
    last7Days.forEach(date => enrollCountMap[date] = 0);

    courses.forEach(course => {
      course.students.forEach(enroll => {
        const dateStr = new Date(enroll.enrolledAt).toISOString().slice(0, 10);
        if (enrollCountMap[dateStr] !== undefined) {
          enrollCountMap[dateStr]++;
        }
      });
    });

    const enrollData = last7Days.map(date => ({
      date,
      enrollments: enrollCountMap[date]
    }));

    // 🟢 Response
    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        totalStudents,
        enrollChart: enrollData
      }
    });

  } catch (error) {
    console.error("Instructor Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});



// Analysis api

// Route: GET /api/instructor/course/:courseId/analysis

const getCourseAnalysis = catchAsyncError( async (req, res) => {
  try {
    const instructorId = req.user._id; // Assuming you use JWT auth middleware
    const courseId = req.params.courseId;

    const course = await Course.findOne({ _id: courseId, instructor: instructorId })
      .populate('students.user', 'name email')
      .populate('quiz');


    if (!course) {
      return res.status(404).json({ error: 'Course not found or unauthorized' });
    }

    const totalStudents = course.totalStudents;
    const averageProgress = course.completionRate;
    const totalLessons = course.totalLessons;



    // Quiz analysis
    let totalAttempts = 0;
    let totalScore = 0;
    let passCount = 0;
    let failCount = 0;
    let certificateCount = 0;

    const lessonStats = Array(totalLessons).fill(0); // to calculate per-lesson completion

    const topPerformers = [];

    course.students.forEach(student => {
      const { quizAttempts, certificate, completedLessons } = student;

  
      // Top scorer tracking
      if (quizAttempts.length > 0) {
        const bestAttempt = quizAttempts.reduce((max, a) => (a.score > max.score ? a : max), quizAttempts[0]);
        topPerformers.push({
          name: student?.user?.name,
          email: student?.user?.email,
          score: bestAttempt.score
        });
      }

      quizAttempts.forEach(a => {
        totalAttempts++;
        totalScore += a.score;
        if (a.passed) passCount++;
        else failCount++;
      });

      if (certificate.issued) certificateCount++;

      completedLessons.forEach(cl => {
        const lessonIndex = course.lessons.findIndex(lesson => lesson._id.equals(cl.lessonId));
        if (lessonIndex !== -1) {
          lessonStats[lessonIndex]++;
        }
      });
    });

    const avgQuizScore = totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(2) : 0;
    const quizPassRate = totalAttempts > 0 ? ((passCount / totalAttempts) * 100).toFixed(2) : 0;

    // Lesson Completion Rate per lesson
    const lessonCompletion = course.lessons.map((lesson, index) => ({
      lessonTitle: lesson.title,
      completedBy: lessonStats[index],
      completionRate: ((lessonStats[index] / totalStudents) * 100).toFixed(2)
    }));

    // Sort top performers
    topPerformers.sort((a, b) => b.score - a.score);

    res.json({
      courseTitle: course.title,
      totalStudents,
      averageProgress: averageProgress.toFixed(2),
      totalQuizAttempts: totalAttempts,
      avgQuizScore,
      quizPassRate,
      quizFailRate: (100 - quizPassRate).toFixed(2),
      certificatesIssued: certificateCount,
      lessonCompletion,
      topPerformers: topPerformers.slice(0, 5)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Get Instructor's Courses 
// controllers/instructorController.js
const getInstructorCourses = catchAsyncError(async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    // Validate instructorId
    if (!instructorId || !mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid instructor ID format'
      });
    }

    // Find courses and properly handle the result
    const courses = await Course.find({ instructor: instructorId }).select('id title').lean();

    // Check if courses exist (safe check even if courses is null/undefined)
    if (!courses || courses.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No courses found for this instructor',
        courses: []
      });
    }

    // Return found courses
    return res.status(200).json({
      success: true,
      message: 'Courses fetched successfully',
      courses
    });

  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message || 'Unknown error occurred'
    });
  }
});




module.exports = {getEnrolledUsersByInstructor, getInstructorCourses , getInstructorDashboard , getCourseAnalysis}