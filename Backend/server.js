const express = require("express");
const AdminRoutes = require("./Routes/AdminRoutes.js");
const CourseRoutes = require("./Routes/CourseRoutes.js");
const CourseApproval = require("./Routes/CourseApproval.js");
const app = express();
const cors = require("cors");
const colors = require("colors");
const dotenv = require("dotenv");
const connectDB = require("./DataBase/connectDB");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { errorsMiddleware } = require("./Middlewares/errorsmiddleware.js");
const UserRoutes = require("./Routes/UserRoutes.js");
const { removeUnverifiedAccounts } = require("./Automation/RemoveUnverifiedUser.js");
const Formidable = require("express-formidable");
const EnrollmentRoute = require("./Routes/EnrollmentRoute.js")
const ProgressRoutes = require("./Routes/ProgressRoutes.js")
const QuizRoutes = require("./Routes/QuizRoutes.js")
const CertificateRoutes = require("./Routes/CertificateRoutes.js");
const path = require("path");
const InstructorRoutes = require('./Routes/InstructorRoutes.js')
const ContactRoute = require('./Routes/ContactRoute.js')
const paymentRoutes = require('./Routes/paymentRoutes.js');
const PaymentNotifyRoute = require('./Routes/PaymentNotifyRoute.js');


// Load environment variables
dotenv.config();

// Database Connection
connectDB();

// Remove unverified accounts (cron job)
removeUnverifiedAccounts();

// 1. سب سے پہلے standard body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. اب دیگر middleware
app.use(cors({
  origin: ['http://localhost:5173', process.env.FRONTEND_URL],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'Content-Type']
}));

app.use(morgan("dev"));
app.use(cookieParser());

// // 3. اب آپ کا logging middleware (body اب accessible ہوگا)
// app.use((req, res, next) => {
//   console.log('\n=== new Request ===');
//   console.log('Method:', req.method);
//   console.log('URL:', req.url);
//   console.log('Headers:', req.headers);
//   console.log('Body:', req.body); // اب undefined نہیں آئے گا
//   next();
// });

// Configure formidable for file uploads
const formidableMiddleware = Formidable({
  encoding: 'utf-8',
  multiples: true,
  keepExtensions: true,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  filter: function ({ name, originalFilename, mimetype }) {
    return mimetype && mimetype.includes("image");
  }
});

app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use("/api/v1/user", UserRoutes); // بغیر formidable کے

// صرف admin routes جنہیں file upload کی ضرورت ہو
app.use("/api/v1/admin", AdminRoutes);

app.use("/api/v1/instructor", InstructorRoutes)

app.use("/api/v1/courses", formidableMiddleware , CourseRoutes);

app.use("/api/v1/courseapproval" , CourseApproval);

app.use("/api/v1/enrollment" , EnrollmentRoute);

app.use("/api/v1/progress" , ProgressRoutes);

app.use("/api/v1/quizzes", QuizRoutes);

app.use("/api/v1/contact", ContactRoute);

app.use("/api/v1/certificate", CertificateRoutes);

app.use("/api/v1/payment", paymentRoutes);

app.use("/api/v1/notification", express.urlencoded({ extended: false }) , PaymentNotifyRoute);


// Error middleware (ہمیشہ آخر میں)
app.use(errorsMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on Port : ${PORT}`.bgCyan.white);
});