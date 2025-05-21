const { Course } = require("../Models/CourseModel");
const catchAsyncError = require("../Middlewares/catchAsyncError");
const { default: mongoose } = require("mongoose");
const User = require("../Models/UserModel");


const enrollInCourse = catchAsyncError( async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check if course is approved
    if (!course.approved) {
      return res.status(403).json({
        success: false,
        message: "This course is not yet approved for enrollment"
      });
    }

    // Enroll the student
   const student = await course.enrollStudent(userId);
   console.log("Student : ", student);

    res.status(200).json({
      success: true,
      message: "Successfully enrolled in the course",
      course: {
        _id: course._id,
        title: course.title,
        instructor: course.instructor,
        progress: 0,
        totalLessons: course.totalLessons
      }
    });

  } catch (error) {
    console.error("Error in enrollInCourse:", error);
    res.status(500).json({
      success: false,
      message: "Error while enrolling in course",
      error: error.message
    });
  }
});


// check user enrollment 
// Check if user is enrolled in a course
const checkEnrollment = catchAsyncError(async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const userId = req.user?._id;
  
      // Validate user exists
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }
  
      // Validate course ID
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID"
        });
      }
  
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found"
        });
      }
  
      const isEnrolled = course.students.some(student => 
        student.user.equals(userId)
      );
  
      res.status(200).json({
        success: true,
        isEnrolled
      });
  
    } catch (error) {
      console.error("Error checking enrollment:", error);
      res.status(500).json({
        success: false,
        message: "Error checking enrollment status",
        error: error.message
      });
    }
  });


  module.exports = { enrollInCourse , checkEnrollment };