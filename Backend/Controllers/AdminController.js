const User = require("../Models/UserModel");
const { Course } = require("../Models/CourseModel");
const ErrorHandler = require("../Middlewares/errorsmiddleware");
const catchAsyncError = require("../Middlewares/catchAsyncError");
const formatPrice = require('../utils/formatPrice');
const fs = require('fs');
const path = require('path');
// const mongoose  = require("mongoose");

// ==================== DASHBOARD CONTROLLERS ====================
const getDashboardStats = catchAsyncError(async (req, res, next) => {
    // Get counts with specific role filtering
    const [totalStudents, totalInstructors, totalCourses, pendingCourses] = await Promise.all([
      User.countDocuments({ role: 'user' }), // Only count students
      User.countDocuments({ role: 'instructor' }), // Only count instructors
      Course.countDocuments(),
      Course.countDocuments({ status: 'pending' })
    ]);
  
    // Get recent activity metrics
    const [newStudents, activeCourses] = await Promise.all([
      User.countDocuments({ 
        role: 'user', // Only new students
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      }),
      Course.countDocuments({ 
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Active in last 7 days
      })
    ]);
  
    res.status(200).json({
      success: true,
      stats: {
        userStats: {
          totalStudents, // Only students count
          totalInstructors, // Only instructors count
          newStudentsLast7Days: newStudents // Only new students
        },
        courseStats: {
          totalCourses,
          pendingCourses,
          activeCoursesLast7Days: activeCourses
        }
      }
    });
  });

// ==================== USER MANAGEMENT ====================
const getAllUsers = catchAsyncError(async (req, res, next) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  
  const query = { 
    role: { $ne: "admin" },
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  };

  const users = await User.find(query)
    .select('-password -__v')
    .skip((page - 1) * limit)
    .limit(limit);

  const totalUsers = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: page
  });
});

// promoteordemote user

const promoteOrDemoteUser = catchAsyncError(async (req, res, next) => {
  
  const { userId } = req.params;
  console.log("userId:", userId);
  const { role } = req.body;
  console.log("role:", role);
  
  // Allow both promotion and demotion
  if (!["user", "instructor"].includes(role)) {
    return next(new ErrorHandler("Invalid role specified", 400));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select('-password -__v');

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const action = role === "instructor" ? "promoted" : "demoted";
  res.status(200).json({
    success: true,
    message: `User ${action} to ${role} successfully`,
    user
  });
});



const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully"
  });
});

// ==================== COURSE MANAGEMENT ====================

const getCourseById = catchAsyncError(async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('instructor', 'name email')
      .populate('category', 'name');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Convert course to a plain JavaScript object
    const courseData = course.toObject();

    // If thumbnail exists in buffer format, convert to base64
    if (course.thumbnail && course.thumbnail.data) {
      courseData.thumbnail = {
        url: `data:${course.thumbnail.contentType};base64,${course.thumbnail.data.toString('base64')}`,
        contentType: course.thumbnail.contentType
      };
    }

    res.status(200).json({
      success: true,
      data: courseData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error',
      error: err.message 
    });
  }
});



const getAllCourses = catchAsyncError(async (req, res, next) => {
  const { status = 'all', page = 1, limit = 10 } = req.query;
  
  // Base query conditions
  const baseQuery = status === 'all' ? {} : { status };
  
  // Role-specific filtering
  let finalQuery;
  if (req.user?.role === 'admin') {
    // Admin sees all courses (approved + disapproved)
    finalQuery = baseQuery;
  } else if (req.user?.role === 'instructor') {
    // Instructor sees their own courses (both approved and disapproved)
    finalQuery = {
      ...baseQuery,
      instructor: req.user._id
    };
  } else {
    // Students/guests see only approved courses
    finalQuery = {
      ...baseQuery,
      approved: true
    };
  }
  
  // Fetch courses with lean() for better performance
  const courses = await Course.find(finalQuery)
    .populate('instructor', 'name email')
    .populate('approvedBy', 'name email')
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Process thumbnails
  const processedCourses = courses.map(course => {
    if (course.thumbnail?.data) {
      return {
        ...course,
        thumbnail: `data:${course.thumbnail.contentType};base64,${course.thumbnail.data.toString('base64')}`
      };
    }
    return course;
  });

  const totalCourses = await Course.countDocuments(finalQuery);

  res.status(200).json({
    success: true,
    courses: processedCourses,
    totalCourses,
    totalPages: Math.ceil(totalCourses / limit),
    currentPage: page,
    userRole: req.user?.role || 'guest',
    canApprove: req.user?.role === 'admin' // Frontend can use this to show approve buttons
  });
});

const createCourse = async (req, res) => {
  try {
    const { 
      title,
      description,
      category,
      lessons,
      price,
      discount,        // Percentage (0-100)
      discountAmount,  // Calculated amount
      discountExpiry
    } = req.fields;

    console.log("Received fields:", req.fields);

    const { thumbnail } = req.files;
    const instructor = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // Basic validation
    if (!title || !description || !category || !lessons || price === undefined) {
      return res.status(400).json({ 
        success: false,
        message: "Title, description, category, lessons and price are required." 
      });
    }

    // Validate price
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number."
      });
    }

    // Check thumbnail
    if (thumbnail) {
      if (thumbnail.size > 1000000) {
        return res.status(400).json({ 
          success: false,
          message: "Thumbnail should be less than 1mb." 
        });
      }
      
      // Validate image type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(thumbnail.type)) {
        return res.status(400).json({
          success: false,
          message: "Only JPEG/PNG images allowed."
        });
      }
    }

    // Process lessons
    let parsedLessons = [];
    try {
      parsedLessons = JSON.parse(lessons);
      if (!Array.isArray(parsedLessons)) {
        throw new Error("Lessons must be an array");
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid lessons format. Must be valid JSON array.",
        error: error.message
      });
    }

    // Calculate final discount amount
    let finalDiscountAmount = 0;
    if (discount && !isNaN(discount)) {
      // Calculate from percentage
      const discountPercentage = Number(discount);
      if (discountPercentage < 0 || discountPercentage > 100) {
        return res.status(400).json({
          success: false,
          message: "Discount percentage must be between 0 and 100."
        });
      }
      finalDiscountAmount = (numericPrice * discountPercentage) / 100;
    } else if (discountAmount) {
      // Use direct amount
      finalDiscountAmount = Number(discountAmount);
    }

    // Process discount
    let discountDetails = null;
    if (finalDiscountAmount > 0) {
      // Validate discount amount
      if (finalDiscountAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Discount amount must be a positive number."
        });
      }

      // Validate discount doesn't exceed price
      if (finalDiscountAmount > numericPrice) {
        return res.status(400).json({
          success: false,
          message: "Discount amount cannot exceed course price."
        });
      }

      // Process expiry date
      let expiryDate = null;
      if (discountExpiry) {
        expiryDate = new Date(discountExpiry);
        if (isNaN(expiryDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid discount expiry date format. Use YYYY-MM-DD."
          });
        }

        if (expiryDate <= new Date()) {
          return res.status(400).json({
            success: false,
            message: "Discount expiry date must be in the future."
          });
        }
      }

      discountDetails = {
        amount: finalDiscountAmount,
        originalPrice: numericPrice,
        ...(expiryDate && { expiresAt: expiryDate })
      };
    }

    // Prepare course data
    const courseData = { 
      title,
      description,
      category,
      price: numericPrice,
      instructor,
      lessons: parsedLessons,
      ...(discountDetails && { discount: discountDetails }),
      approved: isAdmin,
      ...(isAdmin && { 
        approvedAt: new Date(),
        approvedBy: instructor 
      })
    };

    // Create and save course
    const course = new Course(courseData);

    if (thumbnail) {
      course.thumbnail.data = fs.readFileSync(thumbnail.path);
      course.thumbnail.contentType = thumbnail.type;
      fs.unlinkSync(thumbnail.path); // Remove temp file
    }

    await course.save();
    
    // Calculate discounted price
    const discountedPrice = discountDetails 
      ? numericPrice - discountDetails.amount
      : numericPrice;

    // Prepare response
    const responseData = {
      _id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      discountedPrice: discountedPrice,
      category: course.category,
      instructor: course.instructor,
      thumbnail: course.thumbnail ? true : false,
      discount: course.discount || null,
      approved: course.approved,
      createdAt: course.createdAt
    };

    res.status(201).json({
      success: true,
      message: `Course created ${isAdmin ? 'and approved' : 'successfully. Waiting for admin approval'}`,
      course: responseData
    });

  } catch (error) {
    console.error("Error in createCourse:", error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while creating course",
      error: error.message
    });
  }
};



const updateCourse = catchAsyncError(async (req, res) => {
  try {
    // Validate request data exists
    if (!req.fields && !req.files) {
      return res.status(400).json({
        success: false,
        message: "No data received in request"
      });
    }

    const { courseId } = req.params;
    const updates = {};

    // Handle text fields
    if (req.fields.title) updates.title = req.fields.title;
    if (req.fields.description) updates.description = req.fields.description;
    if (req.fields.category) updates.category = req.fields.category;
    
    // Handle price
    if (req.fields.price !== undefined) {
      updates.price = Number(req.fields.price);
      if (isNaN(updates.price)) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid number"
        });
      }
    }

    // Handle discount
    if (req.fields.discountAmount !== undefined) {
      const discountAmount = Number(req.fields.discountAmount);
      
      if (isNaN(discountAmount)) {
        return res.status(400).json({
          success: false,
          message: "Discount amount must be a valid number"
        });
      }

      if (discountAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Discount amount cannot be negative"
        });
      }

      // Check if discount exceeds price (only if price is being updated)
      if (updates.price !== undefined && discountAmount > updates.price) {
        return res.status(400).json({
          success: false,
          message: "Discount amount cannot exceed course price"
        });
      }

      updates.discount = {
        amount: discountAmount
      };

      // Handle discount expiry if provided
      if (req.fields.discountExpiry) {
        const expiryDate = new Date(req.fields.discountExpiry);
        if (isNaN(expiryDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid discount expiry date format"
          });
        }
        updates.discount.expiresAt = expiryDate;
      } else if (req.fields.discountExpiry === '') {
        // Clear expiry if empty string sent
        updates.discount.expiresAt = undefined;
      }
    } else if (req.fields.discountAmount === '') {
      // Clear entire discount if empty string sent for amount
      updates.discount = undefined;
    }

    // Handle lessons if provided
    if (req.fields.lessons) {
      try {
        updates.lessons = JSON.parse(req.fields.lessons);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid lessons format"
        });
      }
    }

    // Handle thumbnail upload
    if (req.files.thumbnail) {
      const thumbnail = req.files.thumbnail;
      
      // Validate image type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(thumbnail.type)) {
        return res.status(400).json({
          success: false,
          message: "Only JPEG/PNG images allowed"
        });
      }

      updates.thumbnail = {
        data: fs.readFileSync(thumbnail.path),
        contentType: thumbnail.type
      };

      // Clean up temp file
      fs.unlinkSync(thumbnail.path);
    }

    // Find and update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Prepare the response with all relevant fields
    const responseData = {
      _id: updatedCourse._id,
      title: updatedCourse.title,
      description: updatedCourse.description,
      price: updatedCourse.price,
      discountedPrice: updatedCourse.discountedPrice, // Include virtual field
      category: updatedCourse.category,
      lessons: updatedCourse.lessons || [],
      thumbnail: updatedCourse.thumbnail 
        ? `data:${updatedCourse.thumbnail.contentType};base64,${updatedCourse.thumbnail.data.toString('base64')}`
        : null,
      discount: updatedCourse.discount,
      instructor: updatedCourse.instructor,
      createdAt: updatedCourse.createdAt,
      updatedAt: updatedCourse.updatedAt
    };

    res.status(200).json({
      success: true,
      course: responseData
    });

  } catch (error) {
    console.error('Update error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
});



const deleteCourse = catchAsyncError(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.courseId);

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Course deleted successfully"
  });
});


// ==================== ANALYTICS ====================
// controllers/adminController.js
const getSystemAnalytics = catchAsyncError(async (req, res, next) => {
    const { timeRange = 'monthly' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch(timeRange) {
      case 'daily': startDate = new Date(now.setDate(now.getDate() - 1)); break;
      case 'weekly': startDate = new Date(now.setDate(now.getDate() - 7)); break;
      case 'monthly': startDate = new Date(now.setMonth(now.getMonth() - 1)); break;
      case 'yearly': startDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
      default: startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
  
    // Get all analytics data in parallel
    const [
      newUsers,
      activeUsers,
      courseEnrollments,
      instructorSignups,
      popularCourses
    ] = await Promise.all([
      // New user registrations
      User.countDocuments({ createdAt: { $gte: startDate } }),
      
      // Active users (logged in at least once in period)
      User.countDocuments({ lastLogin: { $gte: startDate } }),
      
      // Total course enrollments
      Course.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: { $size: "$studentsEnrolled" } } } }
      ]),
      
      // New instructors
      User.countDocuments({ 
        role: 'instructor',
        createdAt: { $gte: startDate } 
      }),
      
      // Most popular courses
      Course.find({})
        .sort({ studentsEnrolled: -1 })
        .limit(5)
        .select('title studentsEnrolled instructor')
        .populate('instructor', 'name')
    ]);
  
    res.status(200).json({
      success: true,
      analytics: {
        timeRange,
        period: { startDate, endDate: new Date() },
        userMetrics: {
          newUsers,
          activeUsers,
          instructorSignups
        },
        courseMetrics: {
          totalEnrollments: courseEnrollments[0]?.total || 0,
          popularCourses
        }
      }
    });
  });



  const getAllInstructors =  catchAsyncError(async (req, res) => {
    try {
      console.log("users:" , User);
      const instructors = await User.find({ role: 'instructor' }).select('-password');
      console.log("Instructors :" , instructors);
      res.json({ success: true, instructors });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });


// Admin Dashboard Analysis 
// controllers/analyticsController.js

const getCourseEnrollmentAnalytics = catchAsyncError( async (req, res) => {
  try {
    const courses = await Course.find({ approved: true });

    const totalCourses = courses.length;
    let totalEnrollments = 0;
    let mostEnrolledCourse = null;
    const enrollmentsOverTime = {}; // e.g., {"2024-05-01": 12}

    courses.forEach(course => {
      totalEnrollments += course.students.length;
      if (!mostEnrolledCourse || course.students.length > mostEnrolledCourse.students.length) {
        mostEnrolledCourse = course;
      }

      course.students.forEach(s => {
        const dateKey = s.enrolledAt.toISOString().split("T")[0];
        enrollmentsOverTime[dateKey] = (enrollmentsOverTime[dateKey] || 0) + 1;
      });
    });

    res.json({
      totalCourses,
      totalEnrollments,
      mostEnrolledCourse: mostEnrolledCourse ? mostEnrolledCourse.title : null,
      enrollmentsOverTime
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});



const getStudentProgressAnalytics = catchAsyncError( async (req, res) => {
  try {
    const courses = await Course.find({ approved: true });
    let totalProgress = 0;
    let studentCount = 0;
    let completedStudents = 0;
    const dropOffStats = { "0-25": 0, "25-50": 0, "50-75": 0, "75-99": 0, "100": 0 };

    const courseProgress = courses.map(course => {
      let courseTotal = 0;
      let courseStudentCount = 0;

      course.students.forEach(s => {
        totalProgress += s.progress;
        courseTotal += s.progress;
        studentCount++;
        courseStudentCount++;

        if (s.progress === 100) completedStudents++;

        if (s.progress < 25) dropOffStats["0-25"]++;
        else if (s.progress < 50) dropOffStats["25-50"]++;
        else if (s.progress < 75) dropOffStats["50-75"]++;
        else if (s.progress < 100) dropOffStats["75-99"]++;
        else dropOffStats["100"]++;
      });

      return {
        title: course.title,
        averageProgress: courseStudentCount ? (courseTotal / courseStudentCount) : 0
      };
    });

    const topAvgProgressCourses = courseProgress.sort((a, b) => b.averageProgress - a.averageProgress).slice(0, 3);

    res.json({
      averageProgressOverall: studentCount ? (totalProgress / studentCount) : 0,
      completedStudents,
      topAvgProgressCourses,
      dropOffStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


// weekly 
const getUserAnalysis = catchAsyncError( async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalStudents = await User.countDocuments({ role: "user" });

    const verifiedUsers = await User.countDocuments({ accountVerified: true });
    const unverifiedUsers = await User.countDocuments({ accountVerified: false });

    // Weekly registration analysis (last 6 weeks)
    const weeklyStats = await User.aggregate([
      {
        $project: {
          week: {
            $isoWeek: "$createdAt"
          },
          year: { $year: "$createdAt" }
        }
      },
      {
        $group: {
          _id: { week: "$week", year: "$year" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.week": -1 } },
      { $limit: 6 }
    ]);

    const formattedWeeklyStats = weeklyStats.map((item) => {
      return {
        week: `Week ${item._id.week}, ${item._id.year}`,
        registrations: item.count
      };
    }).reverse(); // to show in chronological order

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalInstructors,
        totalStudents,
        verifiedUsers,
        unverifiedUsers,
        weeklyRegistrations: formattedWeeklyStats
      }
    });

  } catch (error) {
    console.error("User Analysis Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});



// get courses analysis 
const getCourseAnalytics = catchAsyncError( async (req, res) => {
  try {
    // 1. Summary Counts
    const totalCourses = await Course.countDocuments();
    const approvedCourses = await Course.countDocuments({ approved: true });
    const disapprovedCourses = totalCourses - approvedCourses;

    // 2. Enrollment Data
    const courses = await Course.find({}, "title students");

    const enrollmentData = courses.map(course => ({
      courseId: course._id,
      title: course.title,
      enrolledStudents: course.students.length
    }));

    return res.status(200).json({
      summary: {
        totalCourses,
        approvedCourses,
        disapprovedCourses
      },
      enrollmentData
    });
  } catch (error) {
    console.error("Course analytics error:", error);
    return res.status(500).json({ error: "Server error while fetching analytics" });
  }
});




module.exports = {
  // Dashboard
  getDashboardStats,
  getCourseEnrollmentAnalytics,
  getStudentProgressAnalytics,
  getUserAnalysis,
  getCourseAnalytics,
  
  // User Management
  getAllUsers,
  promoteOrDemoteUser,
  deleteUser,
  
  // Course Management
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllInstructors,
  
  // Analytics
  getSystemAnalytics,
  
};