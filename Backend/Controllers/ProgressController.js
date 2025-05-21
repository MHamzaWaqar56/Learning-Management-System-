const { Course } = require("../Models/CourseModel");
const catchAsyncError = require("../Middlewares/catchAsyncError");

// Complete Lesson
const completeLesson = catchAsyncError(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const userId = req.user._id;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found"
    });
  }

  await course.completeLesson(userId, lessonId);
  const progress = course.getStudentProgress(userId);

  res.status(200).json({
    success: true,
    message: "Lesson completed successfully",
    progress
  });
});


// Get Progress
const getCourseProgress = catchAsyncError(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found"
    });
  }

  const progress = course.getStudentProgress(userId);

  res.status(200).json({
    success: true,
    progress
  });
});

module.exports = {
  completeLesson,
  getCourseProgress
};