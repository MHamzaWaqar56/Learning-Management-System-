const path = require("path");
const fs = require('fs');
const mongoose = require("mongoose");
const User = require('./UserModel.js');

// Enhanced Quiz Attempt Schema
const quizAttemptSchema = new mongoose.Schema({
  attemptDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    selectedOption: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  timeTaken: {
    type: Number, // in seconds
    min: 0
  },
  attemptNumber: {
    type: Number,
    required: true
  }
}, { _id: false });

// Enhanced Enrollment Schema (updated with payment info)
const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['payfast', 'manual', 'free'],
    default: 'free'
  },
  completedLessons: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    readingProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  quizAttempts: [quizAttemptSchema],
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: Date,
    certificateId: String,
    downloadUrl: String,
    quizScore: Number,
    issuedForAttempt: Number
  },
  lastQuizAttempt: Date
}, { _id: false });

// Lesson Schema
const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  sequence: {
    type: Number,
    default: 0
  },
  wordCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Course Quiz Schema (unchanged)
const courseQuizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true
  },
  title: {
    type: String,
    default: "Course Assessment"
  },
  description: String,
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function(v) {
          return v.length >= 2;
        },
        message: props => `Question must have at least 2 options`
      }
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0
    },
    explanation: String,
    points: {
      type: Number,
      default: 1,
      min: 1
    }
  }],
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  timeLimit: {
    type: Number,
    min: 1
  },
  maxAttempts: {
    type: Number,
    min: 1
  },
  shuffleQuestions: {
    type: Boolean,
    default: true
  },
  shuffleOptions: {
    type: Boolean,
    default: true
  },
  showCorrectAnswers: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Main Course Schema with Price Field
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  currency: {
    type: String,
    default: 'PKR',
    enum: ['PKR'],
    immutable: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  thumbnail: {
    data: Buffer,
    contentType: String
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  students: [enrollmentSchema],
  totalStudents: {
    type: Number,
    default: 0
  },
  lessons: [lessonSchema],
  totalLessons: {
    type: Number,
    default: 0
  },
  requiresQuiz: {
    type: Boolean,
    default: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseQuiz"
  },
  quizSettings: {
    retryCooldown: {
      type: Number,
      default: 1,
      min: 0
    },
    requirePassingQuiz: {
      type: Boolean,
      default: true
    }
  },
  // discountedPrice: {
  //   type: Number,
  //   min: 0,
  //   default: function() {
  //     if (this.discount && this.discount.amount) {
  //       return this.price - this.discount.amount;
  //     }
  //     return this.price;
  //   }
  // },
  discountedPrice: {
    type: Number,
    min: 0,
    default: function() {
      return this.price; // Default to original price
    }
  },
  discount: {
    amount: {
      type: Number,
      min: 0
    },
    originalPrice: Number,
    expiresAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/* ====================== */
/* === PRE-SAVE HOOKS === */
/* ====================== */

courseSchema.pre('save', function(next) {

   // Check and remove expired discount
   if (this.discount?.expiresAt && this.discount.expiresAt < new Date()) {
    this.discount = undefined;
    this.discountedPrice = this.price;
  }

  // Calculate discounted price if valid discount exists
  if (this.discount?.amount && (!this.discount.expiresAt || this.discount.expiresAt >= new Date())) {
    this.discountedPrice = this.price - this.discount.amount;
  } else {
    this.discountedPrice = this.price;
  }


  this.lessons.forEach((lesson, index) => {
    if (!lesson.sequence) lesson.sequence = index + 1;
    lesson.wordCount = lesson.content.split(/\s+/).length;
  });
  this.lessons.sort((a, b) => a.sequence - b.sequence);
  this.totalLessons = this.lessons.length;
  this.totalStudents = this.students.length;


  // if (this.isModified('price') || this.isModified('discount')) {
  //   this.discountedPrice = this.discount?.amount 
  //     ? this.price - this.discount.amount 
  //     : this.price;
  // }
  
  if (this.isModified('approved')) {
    this.approvedAt = this.approved ? new Date() : null;
  }
  
  next();
});



/* ====================== */
/* === QUERY MIDDLEWARE == */
/* ====================== */

// Automatically clean expired discounts before any find operation
courseSchema.pre(/^find/, function(next) {
  // Update expired discounts in background
  // this.model.updateMany(
  //   { 
  //     'discount.expiresAt': { $lt: new Date() },
  //     discount: { $exists: true }
  //   },
  //   { 
  //     $unset: { discount: "" },
  //     $set: { discountedPrice: "$price" }
  //   }
  // ).exec();

  this.model.updateMany(
    {
      'discount.expiresAt': { $lt: new Date() },
      discount: { $exists: true }
    },
    [
      { $set: { discountedPrice: "$price" } }, // aggregation syntax
      { $unset: "discount" }
    ]
  ).exec();
  

  // Filter out expired discounts from query results
  this.where({
    $or: [
      { discount: { $exists: false } },
      { 'discount.expiresAt': { $gt: new Date() } }
    ]
  });
  
  next();
});



/* ==================== */
/* === VIRTUAL FIELDS == */
/* ==================== */

courseSchema.virtual('totalWordCount').get(function() {
  return this.lessons.reduce((sum, lesson) => sum + lesson.wordCount, 0);
});

courseSchema.virtual('completionRate').get(function() {
  if (!this.students.length) return 0;
  return this.students.reduce((sum, s) => sum + s.progress, 0) / this.students.length;
});


courseSchema.virtual('isFree').get(function() {
  return this.price === 0;
});

courseSchema.virtual('hasActiveDiscount').get(function() {
  return this.discount && 
         (!this.discount.expiresAt || this.discount.expiresAt >= new Date());
});

/* ==================== */
/* === STATIC METHODS == */
/* ==================== */

courseSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructor: instructorId })
    .populate('instructor', 'name email')
    .populate('students.user', 'name email');
};

courseSchema.statics.getRevenueStats = async function(instructorId) {
  return this.aggregate([
    { $match: { instructor: mongoose.Types.ObjectId(instructorId) } },
    { $unwind: "$students" },
    { 
      $group: {
        _id: null,
        totalRevenue: { $sum: "$students.amountPaid" },
        avgRevenue: { $avg: "$students.amountPaid" },
        totalEnrollments: { $sum: 1 }
      }
    }
  ]);
};

/* ===================== */
/* === INSTANCE METHODS = */
/* ===================== */


courseSchema.methods.checkDiscountExpiry = function() {
  if (this.discount?.expiresAt && this.discount.expiresAt < new Date()) {
    this.discount = undefined;
    this.discountedPrice = this.price;
    return true; // discount was expired and removed
  }
  return false; // discount is still valid
};



// Updated enrollment with payment tracking
courseSchema.methods.enrollStudent = async function(userId, paymentInfo = {}) {
  if (this.students.some(s => s.user.equals(userId))) {
    throw new Error('Student already enrolled');
  }
  
  this.checkDiscountExpiry();

  const enrollment = {
    user: userId,
    progress: 0,
    amountPaid: paymentInfo.amount || this.discountedPrice || 0, // Store direct PKR value
    paymentMethod: paymentInfo.method || 'free',
    completedLessons: []
  };
  
  this.students.push(enrollment);
  
  await User.findByIdAndUpdate(userId, {
    $addToSet: { 
      enrolledCourses: {
        course: this._id,
        progress: 0,
        enrolledAt: new Date(),
        amountPaid: enrollment.amountPaid // Store direct PKR value
      }
    }
  });
  
  await this.save();
  return this;
};


// Complete Lesson
courseSchema.methods.completeLesson = async function(userId, lessonId) {
  const enrollment = this.students.find(s => s.user.equals(userId));
  if (!enrollment) throw new Error('Student not enrolled');

  const lesson = this.lessons.id(lessonId);
  if (!lesson) throw new Error('Lesson not found');

  const alreadyCompleted = enrollment.completedLessons.some(
    l => l.lessonId && l.lessonId.equals(lessonId)
  );
  
  if (!alreadyCompleted) {
    enrollment.completedLessons.push({
      lessonId: lessonId,
      completedAt: new Date(),
      readingProgress: 100
    });
    
    const completedCount = enrollment.completedLessons.length;
    const newProgress = Math.round((completedCount / this.lessons.length) * 100);
    
    enrollment.progress = newProgress;
    
    await User.updateOne(
      { 
        _id: userId,
        "enrolledCourses.course": this._id 
      },
      {
        $set: { 
          "enrolledCourses.$.progress": newProgress,
          "enrolledCourses.$.updatedAt": new Date() 
        }
      }
    );
    
    await this.save();
  }

  return this;
};

// Enhanced Quiz Attempt Method
courseSchema.methods.attemptQuiz = async function(userId, answers, timeTaken) {
  try {
    const enrollment = this.students.find(s => s.user.equals(userId));
    if (!enrollment) throw new Error('Student not enrolled');
    
    // Verify course completion
    if (enrollment.progress < 100) {
      throw new Error('Complete all lessons before attempting quiz');
    }

    // Get quiz details
    const quiz = await mongoose.model('CourseQuiz').findById(this.quiz);
    if (!quiz) throw new Error('Quiz not found');


    // Validate answers
    const questionIds = quiz.questions.map(q => q._id.toString());
    const answeredQuestionIds = Object.keys(answers);
    
    const missingAnswers = questionIds.filter(id => 
      !answeredQuestionIds.includes(id)
    );

    if (missingAnswers.length > 0) {
      throw new Error(`Missing answers for ${missingAnswers.length} questions`);
    }

    // Calculate score
    let correctCount = 0;
    const detailedAnswers = quiz.questions.map((question) => {
      const questionIdStr = question._id.toString();
      const userAnswer = answers[questionIdStr]; // Get user's answer for this question
      
      if (userAnswer === undefined) {
        console.error(`No answer found for question ${questionIdStr}`);
        return {
          questionId: question._id,
          selectedOption: null,
          isCorrect: false
        };
      }

      const isCorrect = parseInt(userAnswer) === parseInt(question.correctAnswer);
      
      // console.log(`Question ${questionIdStr}:`, {
      //   expected: question.correctAnswer,
      //   actual: userAnswer,
      //   isCorrect
      // });

      if (isCorrect) correctCount++;
      
      return {
        questionId: question._id,
        selectedOption: userAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // console.log(`Score: ${score}% (${correctCount}/${quiz.questions.length} correct)`);

    // Record attempt
    const attemptNumber = enrollment.quizAttempts.length + 1;
    const attemptDate = new Date();
    enrollment.quizAttempts.push({
      score,
      passed,
      answers: detailedAnswers,
      timeTaken,
      attemptNumber,
      attemptDate,
    });
    enrollment.lastQuizAttempt = attemptDate;

    // Issue certificate if passed
    // if (passed && !enrollment.certificate?.issued) {
    //   enrollment.certificate = {
    //     issued: true,
    //     issuedAt: new Date(),
    //     certificateId: `CERT-${this._id.toString().slice(-4)}-${userId.toString().slice(-4)}-${Date.now().toString().slice(-6)}`,
    //     quizScore: score,
    //     issuedForAttempt: attemptNumber
    //   };
    // }

    // await this.save();


    let certificateEarned = false;
    if (passed && !enrollment.certificate?.issued) {
      const certificateId = `CERT-${this._id.toString().slice(-4)}-${userId.toString().slice(-4)}-${Date.now().toString().slice(-6)}`;
      
      enrollment.certificate = {
        issued: true,
        issuedAt: attemptDate,
        certificateId,
        quizScore: score,
        issuedForAttempt: attemptNumber,
        downloadUrl: `/api/v1/courses/${this._id}/certificates/${certificateId}`
      };
      
      certificateEarned = true;
      
      // Add certificate to user's profile
      await User.findByIdAndUpdate(userId, {
        $push: {
          certificates: {
            course: this._id,
            certificateId,
            issuedAt: attemptDate,
            score
          }
        }
      });
    }

    await this.save();

    return {
      success: true,
      score,
      passed,
      passingScore: quiz.passingScore,
      certificateEarned,
      certificateId : enrollment.certificate?.certificateId ,
      certificateUrl : enrollment.certificate?.downloadUrl,
      attemptNumber,
      attemptDate,
      // certificateEarned: passed && enrollment.certificate?.issued && enrollment.certificate.issuedForAttempt === attemptNumber
    };

  } catch (error) {
    console.error('Quiz submission failed:', error);
    throw error; // Re-throw for controller to handle
  }
};


// Get Quiz Details for Student
courseSchema.methods.getQuizDetails = async function(userId) {
  const enrollment = this.students.find(s => s.user.equals(userId));
  if (!enrollment) throw new Error('Student not enrolled');

  const quiz = await mongoose.model('CourseQuiz').findById(this.quiz);
  if (!quiz) throw new Error('Quiz not found');

  const lastAttempt = enrollment.quizAttempts.slice(-1)[0];
  const canRetry = quiz.maxAttempts 
    ? enrollment.quizAttempts.length < quiz.maxAttempts
    : true;

  return {
    canAttempt: enrollment.progress === 100,
    lastAttempt,
    totalQuestions: quiz.questions.length,
    passingScore: quiz.passingScore,
    timeLimit: quiz.timeLimit,
    hasCertificate: enrollment.certificate?.issued || false,
    attemptsRemaining: quiz.maxAttempts 
      ? quiz.maxAttempts - enrollment.quizAttempts.length 
      : null,
    canRetry,
    retryCooldown: this.quizSettings.retryCooldown || 1
  };
};

// Get Detailed Quiz Results
courseSchema.methods.getQuizResults = async function(userId, attemptIndex = -1) {
  const enrollment = this.students.find(s => s.user.equals(userId));
  if (!enrollment) throw new Error('Student not enrolled');

  const quiz = await mongoose.model('CourseQuiz').findById(this.quiz);
  if (!quiz) throw new Error('Quiz not found');

  const attempt = enrollment.quizAttempts[
    attemptIndex >= 0 ? attemptIndex : enrollment.quizAttempts.length - 1
  ];
  if (!attempt) throw new Error('No quiz attempts found');

  const results = {
    score: attempt.score,
    passed: attempt.passed,
    attemptDate: attempt.attemptDate,
    timeTaken: attempt.timeTaken,
    attemptNumber: attempt.attemptNumber,
    questions: quiz.questions.map((q, i) => ({
      questionId: q._id,
      questionText: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      selectedAnswer: attempt.answers[i]?.selectedOption,
      isCorrect: attempt.answers[i]?.isCorrect,
      explanation: q.explanation
    }))
  };

  return results;
};

// Get Student Progress
courseSchema.methods.getStudentProgress = function(userId) {
  const enrollment = this.students.find(s => s.user.equals(userId));
  if (!enrollment) throw new Error('Student not enrolled');

  const completedCount = enrollment.completedLessons.length;
  const totalLessons = this.lessons.length;
  const percentage = Math.round((completedCount / totalLessons) * 100);

  return {
    completedLessons: completedCount,
    totalLessons: totalLessons,
    completionPercentage: percentage,
    certificate: enrollment.certificate,
    canAttemptQuiz: completedCount === totalLessons,
    quizAttempts: enrollment.quizAttempts.length,
    passedQuiz: enrollment.quizAttempts.some(a => a.passed)
  };
};


courseSchema.methods.generateCertificate = async function(userId) {
  const enrollment = this.students.find(s => s.user.equals(userId));
  if (!enrollment) throw new Error('Student not enrolled');
  
  if (!enrollment.certificate?.issued) {
      throw new Error('Certificate not earned yet');
  }

  // Get user details
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Certificate data
  const certificateData = {
      courseTitle: this.title,
      studentName: user.name,
      completionDate: enrollment.certificate.issuedAt,
      quizScore: enrollment.certificate.quizScore,
      certificateId: enrollment.certificate.certificateId,
      instructorName: (await User.findById(this.instructor))?.name || 'Course Instructor'
  };

  // Generate a unique filename
  const filename = `certificate_${certificateData.certificateId}.pdf`;
  const filePath = path.join(__dirname, '../public/certificates', filename);

  // Create certificates directory if it doesn't exist
  if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  // Update download URL if not already set
  if (!enrollment.certificate.downloadUrl) {
      enrollment.certificate.downloadUrl = `/api/v1/certificate/${certificateData.certificateId}/download`;
      await this.save();
  }

  return certificateData;
};


// Export Models
const CourseQuiz = mongoose.model("CourseQuiz", courseQuizSchema);
const Course = mongoose.model("Course", courseSchema);

module.exports = {
  Course,
  CourseQuiz
};





///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////// 
/////////////////////////////////////////////////////////




// const path = require("path");
// const fs = require('fs');
// // const User = require('./UserModel');
// const mongoose = require("mongoose");
// const User = require('./UserModel.js')

// // Enhanced Quiz Attempt Schema
// const quizAttemptSchema = new mongoose.Schema({
//   attemptDate: {
//     type: Date,
//     default: Date.now,
//     required: true
//   },
//   score: {
//     type: Number,
//     required: true,
//     min: 0,
//     max: 100
//   },
//   passed: {
//     type: Boolean,
//     required: true
//   },
//   answers: [{
//     questionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true
//     },
//     selectedOption: {
//       type: Number,
//       required: true
//     },
//     isCorrect: {
//       type: Boolean,
//       required: true
//     }
//   }],
//   timeTaken: {
//     type: Number, // in seconds
//     min: 0
//   },
//   attemptNumber: {
//     type: Number,
//     required: true
//   }
// }, { _id: false });

// // Enhanced Enrollment Schema
// const enrollmentSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   enrolledAt: {
//     type: Date,
//     default: Date.now
//   },
//   progress: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 100
//   },
//   completedLessons: [{
//     lessonId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true
//     },
//     completedAt: {
//       type: Date,
//       default: Date.now
//     },
//     readingProgress: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 100
//     }
//   }],
//   quizAttempts: [quizAttemptSchema],
//   certificate: {
//     issued: {
//       type: Boolean,
//       default: false
//     },
//     issuedAt: Date,
//     certificateId: String,
//     downloadUrl: String,
//     quizScore: Number,
//     issuedForAttempt: Number
//   },
//   lastQuizAttempt: Date
// }, { _id: false });

// // Lesson Schema (unchanged)
// const lessonSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   content: {
//     type: String,
//     required: true
//   },
//   sequence: {
//     type: Number,
//     default: 0
//   },
//   wordCount: {
//     type: Number,
//     default: 0
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Enhanced Course Quiz Schema
// const courseQuizSchema = new mongoose.Schema({
//   courseId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Course",
//     required: true,
//     index: true
//   },
//   title: {
//     type: String,
//     default: "Course Assessment"
//   },
//   description: String,
//   questions: [{
//     question: {
//       type: String,
//       required: true
//     },
//     options: {
//       type: [String],
//       required: true,
//       validate: {
//         validator: function(v) {
//           return v.length >= 2; // At least 2 options
//         },
//         message: props => `Question must have at least 2 options`
//       }
//     },
//     correctAnswer: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     explanation: String,
//     points: {
//       type: Number,
//       default: 1,
//       min: 1
//     }
//   }],
//   passingScore: {
//     type: Number,
//     default: 70,
//     min: 0,
//     max: 100
//   },
//   timeLimit: { // in minutes
//     type: Number,
//     min: 1
//   },
//   maxAttempts: {
//     type: Number,
//     min: 1
//   },
//   shuffleQuestions: {
//     type: Boolean,
//     default: true
//   },
//   shuffleOptions: {
//     type: Boolean,
//     default: true
//   },
//   showCorrectAnswers: {
//     type: Boolean,
//     default: false
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   price: {
//     type: Number,
//     required: true,
//     min: 0,
//     default: 0
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Pre-save hook for CourseQuiz
// courseQuizSchema.pre('save', function(next) {
//   this.updatedAt = new Date();
  
//   // Validate correctAnswer indexes
//   this.questions.forEach((question, index) => {
//     if (question.correctAnswer >= question.options.length) {
//       throw new Error(
//         `Correct answer index out of range for question ${index + 1}`
//       );
//     }
//   });
  
//   next();
// });

// // Main Course Schema with Quiz Enhancements
// const courseSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 100,
//     index: true
//   },
//   description: {
//     type: String,
//     required: true
//   },

//   category: {
//     type: String,
//     required: true,
//     index: true
//   },
//   thumbnail: {
//     data: Buffer,
//     contentType: String
//   },
//   instructor: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//     index: true
//   },
//   approved: {
//     type: Boolean,
//     default: false
//   },
//   approvedAt: Date,
//   approvedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User"
//   },
//   students: [enrollmentSchema],
//   totalStudents: {
//     type: Number,
//     default: 0
//   },
//   lessons: [lessonSchema],
//   totalLessons: {
//     type: Number,
//     default: 0
//   },
//   requiresQuiz: {
//     type: Boolean,
//     default: true
//   },
//   quiz: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "CourseQuiz"
//   },
//   quizSettings: {
//     retryCooldown: { // hours
//       type: Number,
//       default: 1,
//       min: 0
//     },
//     requirePassingQuiz: {
//       type: Boolean,
//       default: true
//     }
//   }
// }, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// /* ====================== */
// /* === PRE-SAVE HOOKS === */
// /* ====================== */

// courseSchema.pre('save', function(next) {
//   // Auto-set sequence numbers if not provided
//   this.lessons.forEach((lesson, index) => {
//     if (!lesson.sequence) {
//       lesson.sequence = index + 1;
//     }
//     lesson.wordCount = lesson.content.split(/\s+/).length;
//   });

//   // Sort lessons by sequence
//   this.lessons.sort((a, b) => a.sequence - b.sequence);
  
//   // Update calculated fields
//   this.totalLessons = this.lessons.length;
//   this.totalStudents = this.students.length;
  
//   // Set approval timestamp if approved
//   if (this.isModified('approved') && this.approved) {
//     this.approvedAt = new Date();
//   }
  
//   next();
// });

// /* ==================== */
// /* === VIRTUAL FIELDS == */
// /* ==================== */

// courseSchema.virtual('totalWordCount').get(function() {
//   return this.lessons.reduce((sum, lesson) => sum + lesson.wordCount, 0);
// });

// courseSchema.virtual('completionRate').get(function() {
//   if (!this.students.length) return 0;
//   const total = this.students.reduce((sum, s) => sum + s.progress, 0);
//   return total / this.students.length;
// });



// /* ==================== */
// /* === STATIC METHODS == */
// /* ==================== */

// courseSchema.statics.findByInstructor = function(instructorId) {
//   return this.find({ instructor: instructorId })
//     .populate('instructor', 'name email')
//     .populate('students.user', 'name email');
// };

// /* ===================== */
// /* === INSTANCE METHODS = */
// /* ===================== */

// // Enrollment Management
// courseSchema.methods.enrollStudent = async function(userId) {
//   if (this.students.some(s => s.user.equals(userId))) {
//     throw new Error('Student already enrolled');
//   }
  
//   this.students.push({ 
//     user: userId,
//     progress: 0,
//     completedLessons: [] 
//   });
  
//   await User.findByIdAndUpdate(
//     userId,
//     { 
//       $addToSet: { 
//         enrolledCourses: {
//           course: this._id,
//           progress: 0,
//           enrolledAt: new Date()
//         }
//       } 
//     }
//   );
  
//   await this.save();
//   return this;
// };

// // Complete Lesson
// courseSchema.methods.completeLesson = async function(userId, lessonId) {
//   const enrollment = this.students.find(s => s.user.equals(userId));
//   if (!enrollment) throw new Error('Student not enrolled');

//   const lesson = this.lessons.id(lessonId);
//   if (!lesson) throw new Error('Lesson not found');

//   const alreadyCompleted = enrollment.completedLessons.some(
//     l => l.lessonId && l.lessonId.equals(lessonId)
//   );
  
//   if (!alreadyCompleted) {
//     enrollment.completedLessons.push({
//       lessonId: lessonId,
//       completedAt: new Date(),
//       readingProgress: 100
//     });
    
//     const completedCount = enrollment.completedLessons.length;
//     const newProgress = Math.round((completedCount / this.lessons.length) * 100);
    
//     enrollment.progress = newProgress;
    
//     await User.updateOne(
//       { 
//         _id: userId,
//         "enrolledCourses.course": this._id 
//       },
//       {
//         $set: { 
//           "enrolledCourses.$.progress": newProgress,
//           "enrolledCourses.$.updatedAt": new Date() 
//         }
//       }
//     );
    
//     await this.save();
//   }

//   return this;
// };

// // Enhanced Quiz Attempt Method
// courseSchema.methods.attemptQuiz = async function(userId, answers, timeTaken) {
//   try {
//     const enrollment = this.students.find(s => s.user.equals(userId));
//     if (!enrollment) throw new Error('Student not enrolled');
    
//     // Verify course completion
//     if (enrollment.progress < 100) {
//       throw new Error('Complete all lessons before attempting quiz');
//     }

//     // Get quiz details
//     const quiz = await mongoose.model('CourseQuiz').findById(this.quiz);
//     if (!quiz) throw new Error('Quiz not found');


//     // Validate answers
//     const questionIds = quiz.questions.map(q => q._id.toString());
//     const answeredQuestionIds = Object.keys(answers);
    
//     const missingAnswers = questionIds.filter(id => 
//       !answeredQuestionIds.includes(id)
//     );

//     if (missingAnswers.length > 0) {
//       throw new Error(`Missing answers for ${missingAnswers.length} questions`);
//     }

//     // Calculate score
//     let correctCount = 0;
//     const detailedAnswers = quiz.questions.map((question) => {
//       const questionIdStr = question._id.toString();
//       const userAnswer = answers[questionIdStr]; // Get user's answer for this question
      
//       if (userAnswer === undefined) {
//         console.error(`No answer found for question ${questionIdStr}`);
//         return {
//           questionId: question._id,
//           selectedOption: null,
//           isCorrect: false
//         };
//       }

//       const isCorrect = parseInt(userAnswer) === parseInt(question.correctAnswer);
      
//       // console.log(`Question ${questionIdStr}:`, {
//       //   expected: question.correctAnswer,
//       //   actual: userAnswer,
//       //   isCorrect
//       // });

//       if (isCorrect) correctCount++;
      
//       return {
//         questionId: question._id,
//         selectedOption: userAnswer,
//         isCorrect
//       };
//     });

//     const score = Math.round((correctCount / quiz.questions.length) * 100);
//     const passed = score >= quiz.passingScore;

//     // console.log(`Score: ${score}% (${correctCount}/${quiz.questions.length} correct)`);

//     // Record attempt
//     const attemptNumber = enrollment.quizAttempts.length + 1;
//     const attemptDate = new Date();
//     enrollment.quizAttempts.push({
//       score,
//       passed,
//       answers: detailedAnswers,
//       timeTaken,
//       attemptNumber,
//       attemptDate,
//     });
//     enrollment.lastQuizAttempt = attemptDate;

//     // Issue certificate if passed
//     // if (passed && !enrollment.certificate?.issued) {
//     //   enrollment.certificate = {
//     //     issued: true,
//     //     issuedAt: new Date(),
//     //     certificateId: `CERT-${this._id.toString().slice(-4)}-${userId.toString().slice(-4)}-${Date.now().toString().slice(-6)}`,
//     //     quizScore: score,
//     //     issuedForAttempt: attemptNumber
//     //   };
//     // }

//     // await this.save();


//     let certificateEarned = false;
//     if (passed && !enrollment.certificate?.issued) {
//       const certificateId = `CERT-${this._id.toString().slice(-4)}-${userId.toString().slice(-4)}-${Date.now().toString().slice(-6)}`;
      
//       enrollment.certificate = {
//         issued: true,
//         issuedAt: attemptDate,
//         certificateId,
//         quizScore: score,
//         issuedForAttempt: attemptNumber,
//         downloadUrl: `/api/v1/courses/${this._id}/certificates/${certificateId}`
//       };
      
//       certificateEarned = true;
      
//       // Add certificate to user's profile
//       await User.findByIdAndUpdate(userId, {
//         $push: {
//           certificates: {
//             course: this._id,
//             certificateId,
//             issuedAt: attemptDate,
//             score
//           }
//         }
//       });
//     }

//     await this.save();

//     return {
//       success: true,
//       score,
//       passed,
//       passingScore: quiz.passingScore,
//       certificateEarned,
//       certificateId : enrollment.certificate?.certificateId ,
//       certificateUrl : enrollment.certificate?.downloadUrl,
//       attemptNumber,
//       attemptDate,
//       // certificateEarned: passed && enrollment.certificate?.issued && enrollment.certificate.issuedForAttempt === attemptNumber
//     };

//   } catch (error) {
//     console.error('Quiz submission failed:', error);
//     throw error; // Re-throw for controller to handle
//   }
// };


// // Get Quiz Details for Student
// courseSchema.methods.getQuizDetails = async function(userId) {
//   const enrollment = this.students.find(s => s.user.equals(userId));
//   if (!enrollment) throw new Error('Student not enrolled');

//   const quiz = await mongoose.model('CourseQuiz').findById(this.quiz);
//   if (!quiz) throw new Error('Quiz not found');

//   const lastAttempt = enrollment.quizAttempts.slice(-1)[0];
//   const canRetry = quiz.maxAttempts 
//     ? enrollment.quizAttempts.length < quiz.maxAttempts
//     : true;

//   return {
//     canAttempt: enrollment.progress === 100,
//     lastAttempt,
//     totalQuestions: quiz.questions.length,
//     passingScore: quiz.passingScore,
//     timeLimit: quiz.timeLimit,
//     hasCertificate: enrollment.certificate?.issued || false,
//     attemptsRemaining: quiz.maxAttempts 
//       ? quiz.maxAttempts - enrollment.quizAttempts.length 
//       : null,
//     canRetry,
//     retryCooldown: this.quizSettings.retryCooldown || 1
//   };
// };

// // Get Detailed Quiz Results
// courseSchema.methods.getQuizResults = async function(userId, attemptIndex = -1) {
//   const enrollment = this.students.find(s => s.user.equals(userId));
//   if (!enrollment) throw new Error('Student not enrolled');

//   const quiz = await mongoose.model('CourseQuiz').findById(this.quiz);
//   if (!quiz) throw new Error('Quiz not found');

//   const attempt = enrollment.quizAttempts[
//     attemptIndex >= 0 ? attemptIndex : enrollment.quizAttempts.length - 1
//   ];
//   if (!attempt) throw new Error('No quiz attempts found');

//   const results = {
//     score: attempt.score,
//     passed: attempt.passed,
//     attemptDate: attempt.attemptDate,
//     timeTaken: attempt.timeTaken,
//     attemptNumber: attempt.attemptNumber,
//     questions: quiz.questions.map((q, i) => ({
//       questionId: q._id,
//       questionText: q.question,
//       options: q.options,
//       correctAnswer: q.correctAnswer,
//       selectedAnswer: attempt.answers[i]?.selectedOption,
//       isCorrect: attempt.answers[i]?.isCorrect,
//       explanation: q.explanation
//     }))
//   };

//   return results;
// };

// // Get Student Progress
// courseSchema.methods.getStudentProgress = function(userId) {
//   const enrollment = this.students.find(s => s.user.equals(userId));
//   if (!enrollment) throw new Error('Student not enrolled');

//   const completedCount = enrollment.completedLessons.length;
//   const totalLessons = this.lessons.length;
//   const percentage = Math.round((completedCount / totalLessons) * 100);

//   return {
//     completedLessons: completedCount,
//     totalLessons: totalLessons,
//     completionPercentage: percentage,
//     certificate: enrollment.certificate,
//     canAttemptQuiz: completedCount === totalLessons,
//     quizAttempts: enrollment.quizAttempts.length,
//     passedQuiz: enrollment.quizAttempts.some(a => a.passed)
//   };
// };

// // Certificate Generation
// // courseSchema.methods.generateCertificate = async function(userId) {
// //   const enrollment = this.students.find(s => s.user.equals(userId));
// //   if (!enrollment) throw new Error('Student not enrolled');
  
// //   if (!enrollment.certificate?.issued) {
// //     throw new Error('Certificate not earned yet');
// //   }

// //   // In a real implementation, this would generate a PDF or image
// //   const certificateData = {
// //     courseTitle: this.title,
// //     studentName: (await User.findById(userId)).name,
// //     completionDate: enrollment.certificate.issuedAt,
// //     quizScore: enrollment.certificate.quizScore,
// //     certificateId: enrollment.certificate.certificateId
// //   };

// //   // This would be replaced with actual PDF generation logic
// //   const downloadUrl = `/certificates/download/${certificateData.certificateId}`;
  
// //   // Update download URL if not already set
// //   if (!enrollment.certificate.downloadUrl) {
// //     enrollment.certificate.downloadUrl = downloadUrl;
// //     await this.save();
// //   }

// //   return {
// //     ...certificateData,
// //     downloadUrl
// //   };
// // };


// courseSchema.methods.generateCertificate = async function(userId) {
//   const enrollment = this.students.find(s => s.user.equals(userId));
//   if (!enrollment) throw new Error('Student not enrolled');
  
//   if (!enrollment.certificate?.issued) {
//       throw new Error('Certificate not earned yet');
//   }

//   // Get user details
//   const user = await User.findById(userId);
//   if (!user) throw new Error('User not found');

//   // Certificate data
//   const certificateData = {
//       courseTitle: this.title,
//       studentName: user.name,
//       completionDate: enrollment.certificate.issuedAt,
//       quizScore: enrollment.certificate.quizScore,
//       certificateId: enrollment.certificate.certificateId,
//       instructorName: (await User.findById(this.instructor))?.name || 'Course Instructor'
//   };

//   // Generate a unique filename
//   const filename = `certificate_${certificateData.certificateId}.pdf`;
//   const filePath = path.join(__dirname, '../public/certificates', filename);

//   // Create certificates directory if it doesn't exist
//   if (!fs.existsSync(path.dirname(filePath))) {
//       fs.mkdirSync(path.dirname(filePath), { recursive: true });
//   }

//   // Update download URL if not already set
//   if (!enrollment.certificate.downloadUrl) {
//       enrollment.certificate.downloadUrl = `/api/v1/certificate/${certificateData.certificateId}/download`;
//       await this.save();
//   }

//   return certificateData;
// };




// // Export Models
// const CourseQuiz = mongoose.model("CourseQuiz", courseQuizSchema);
// const Course = mongoose.model("Course", courseSchema);

// // Export both models as named exports
// module.exports = {
//   Course,
//   CourseQuiz
// };
