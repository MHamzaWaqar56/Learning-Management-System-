// const User = require("../Models/UserModel");
const { Course } = require("../Models/CourseModel");
const ErrorHandler = require("../Middlewares/errorsmiddleware");
const catchAsyncError = require("../Middlewares/catchAsyncError");
const fs = require('fs');
const path = require('path');
const { default: mongoose } = require("mongoose");


const getAllUserCourses = catchAsyncError(async (req, res, next) => {
    const { status = 'all', page = 1, limit = 10 } = req.query;
    
    const query = status === 'all' ? {} : { status };
    
    // Fetch courses with lean() for better performance
    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // Add lean() to get plain JavaScript objects
  
    // Process courses to handle thumbnails
    const processedCourses = courses.map(course => {
      // If thumbnail exists and is in buffer format
      if (course.thumbnail && course.thumbnail.data) {
        const base64String = course.thumbnail.data.toString('base64');
        return {
          ...course,
          thumbnail: `data:${course.thumbnail.contentType};base64,${base64String}`
        };
      }
      
      // If thumbnail is already a URL or doesn't exist
      return course;
    });

    // Send the processed courses as a response
    res.status(200).json({
      success: true,
      courses: processedCourses
    });
});


// get approved courses for students
const getAllApprovedCourses = catchAsyncError(async (req, res, next) => {
  try {
    
    const { page = 1, limit = 10 } = req.query;
  
  // Only fetch approved courses
  const query = { approved: true };
  
  // Fetch approved courses with lean() for better performance
  const courses = await Course.find(query)
    .populate('instructor', 'name email')
    .populate('approvedBy', 'name email') // Optional: show who approved
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Process courses to handle thumbnails
  const processedCourses = courses.map(course => {
    // If thumbnail exists and is in buffer format
    if (course.thumbnail?.data) {
      return {
        ...course,
        thumbnail: `data:${course.thumbnail.contentType};base64,${course.thumbnail.data.toString('base64')}`
      };
    }
    return course;
  });

  const totalApprovedCourses = await Course.countDocuments(query);

  res.status(200).json({
    success: true,
    courses: processedCourses,
    totalCourses: totalApprovedCourses,
    totalPages: Math.ceil(totalApprovedCourses / limit),
    currentPage: page
  });

  } catch (error) {
    console.error("Error fetching approved courses:", error);
    res.status(500).json({ success: false, message: "Server error" });
    next(error);
    
  }
});



// get courses lectures
const getCourseLectures = catchAsyncError(async (req, res, next) => {
  try {
    // First verify the course exists
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Then populate just the lessons
    const populatedCourse = await Course.findById(req.params.courseId)
      .populate('lessons')
      .select('lessons'); // Sirf lessons field select karo

    res.status(200).json({
      success: true,
      lessons: populatedCourse.lessons // Sirf lessons array return karo
    });

  } catch (error) {
    next(error);
  }
});




const getCourseStudents = catchAsyncError(async (req, res, next) => {
  const courseId = req.params.courseId;
  const instructorId = req.user._id;

  // Add deep population of student details
  const course = await Course.findOne({
    _id: courseId,
    instructor: instructorId
  }).populate({
    path: 'students.user',
    select: 'name email phone role',
    options: { lean: true } // Better performance
  });

  if (!course) {
    return next(new ErrorHandler('Course not found', 404));
  }

  // Transform student data for better response
  const formattedStudents = course.students.map(student => ({
    id: student.user._id,
    name: student.user.name,
    email: student.user.email,
    phone: student.user.phone,
    progress: student.progress,
    lastActive: student.enrolledAt,
    completedLessons: student.completedLessons.length
  }));

  res.status(200).json({
    success: true,
    courseTitle: course.title,
    students: formattedStudents,
    totalStudents: course.students.length,
    analytics: {
      averageProgress: course.students.reduce((a, b) => a + b.progress, 0) / course.students.length || 0,
      activeStudents: course.students.filter(s => s.progress > 0).length
    }
  });
});

const approveCourse =  catchAsyncError( async (req, res) => {
  try {
    const { courseId } = req.params;
    const adminId = req.user._id;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can approve courses"
      });
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        approved: true,
        approvedAt: new Date(),
        approvedBy: adminId
      },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Course approved successfully",
      course
    });

  } catch (error) {
    console.error("Error in approveCourse:", error);
    res.status(500).json({
      success: false,
      message: "Error while approving course",
      error: error.message
    });
  }
});


// disapprove course
const disapproveCourse = catchAsyncError(async (req, res, next) => {
  const { courseId } = req.params;
  const adminId = req.user._id; // Admin who is disapproving
 
  // Validate course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorHandler('Course not found', 404));
  }

  // Update course status
  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      approved: false,
      approvedAt: null,
      approvedBy: null,
      disapprovedBy: adminId,
      disapprovalDate: new Date()
    },
    { new: true }
  ).populate('instructor', 'name email');

  res.status(200).json({
    success: true,
    message: 'Course disapproved successfully',
    course: updatedCourse
  });
});



module.exports = { getAllUserCourses , getAllApprovedCourses , getCourseLectures , getCourseStudents , approveCourse , disapproveCourse};
