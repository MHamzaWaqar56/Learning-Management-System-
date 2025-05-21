import './App.css'
import './index.css'
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import 'antd/dist/antd.css'; // For older versions
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Route, Routes } from 'react-router-dom'
import AboutUs from './Pages/AboutUs.jsx'
import Contact from './Pages/Contact.jsx'
import CourseList from './Pages/ADashboard/CourseList.jsx'
import CreateCourse from './Pages/ADashboard/CreateCourse.jsx'
import ManageCourse from './Pages/Course/ManageCourse.jsx'
import Denied from './Pages/Denied.jsx'
import CourseLecture from './Pages/CourseLecture.jsx'
import AddCourseLectures from './Pages/ADashboard/AddCourseLectures.jsx'
import AdminDashboard from './Pages/ADashboard/AdminDashboard.jsx'
import HomePage from './Pages/HomePage.jsx'
import PrivacyPolicy from './Pages/PrivacyPolicy.jsx'
import NotFound from './Pages/NotFound.jsx'
import ForgetPassword from './Pages/Password/ForgotPassword.jsx'
import ResetPassword from './Pages/Password/ResetPassword.jsx'
import Auth from './Pages/Auth.jsx'
import { useContext, useEffect } from 'react'
import { Context } from './main.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'
import OtpVerification from './Pages/Password/OtpVerification.jsx.jsx'
import AdminRoute from './Compontents/AdminRoute.jsx'
import UserManagement from './Pages/ADashboard/UserManagement.jsx'
import InstructorRoutes from './Compontents/AdminAndInstructorRoutes.jsx'
import AdminAndInstructorRoutes from './Compontents/AdminAndInstructorRoutes.jsx'
import InstructorDashboard from './Pages/InstDashboard/InstructorDashboard.jsx'
import AdminAnalysis from './Pages/ADashboard/AdminAnalysis.jsx'
import Courses from './Pages/Courses.jsx'
import UserProfile from './Pages/UserProfile.jsx'
import UpdateProfile from './Pages/UpdateProfile.jsx'
import AuthRoute from './Compontents/AuthRoute.jsx'
import UserQuiz from './Compontents/UserQuizComponents/UserQuiz.jsx';
import GetOwnStudents from './Pages/InstDashboard/GetOwnStudents.jsx';
import InstructorAnalysis from './Pages/InstDashboard/InstructorAnalysis.jsx';
import PaymentSuccess from './Pages/PaymentPages/PaymentSuccess';
import PaymentFailed from './Pages/PaymentPages/PaymentFailed';
import Checkout from './Pages/PaymentPages/Checkout';



function App() {
  const { setIsAuthenticated, setUser } = useContext(Context);

  useEffect(() => {
    const getUser = async () => {
      await axios
        .get("http://localhost:5000/api/v1/user/me", { withCredentials: true })
        .then((res) => {
          setUser(res.data.user);
          setIsAuthenticated(true);
        })
        .catch((err) => {
          setUser(null);
          setIsAuthenticated(false);
        });
    };
    getUser();
  }, []);

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<HomePage/>} />
        <Route path='/about' element={<AboutUs/>} />
        <Route path='/user/courses' element={<Courses/>} />
        <Route path='/contact' element={<Contact/>} />
        <Route path='/policy' element={<PrivacyPolicy/>} />
        <Route path='/denied' element={<Denied/>} />
        <Route path='/auth' element={<Auth />} />
        <Route path='/otp-verification/:email/:phone' element={<OtpVerification />} />
        <Route path="/password/forgot" element={<ForgetPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword/>} />
        
        
        
        <Route element={<AuthRoute />}>
        <Route path='/profile' element={<UserProfile />} />
        <Route path='/profile/update' element={<UpdateProfile />} />
        <Route path='/user/courses/:courseId/lectures' element={<CourseLecture />} />
        <Route path="/user/courses/:courseId/attempt-quiz" element={<UserQuiz /> } />
        <Route path="/payment-success" element={<PaymentSuccess /> } />
        <Route path="/payment-failed" element={<PaymentFailed /> } />
        <Route path="/checkout/:courseId" element={<Checkout /> } />
        </Route>


        {/* Protected Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path='/admin/dashboard' element={<AdminDashboard/>} />
          <Route path='/admin/get-users' element={<UserManagement />} />
          <Route path='/admin/analysis' element={<AdminAnalysis />} />
        </Route>

        <Route element={<InstructorRoutes />}>
        <Route path='/instructor/dashboard' element={<InstructorDashboard />} />
        <Route path='/instructor/enrolledusers' element={<GetOwnStudents />} />
        <Route path='/instructor/analysis' element={<InstructorAnalysis />} />
        </Route>

        <Route element={<AdminAndInstructorRoutes />}>
        <Route path='/admin/course/create' element={<CreateCourse/>} />
        <Route path='/instructor/course/create' element={<CreateCourse/>} />
        <Route path='/admin/course/add-lecture/:id' element={<AddCourseLectures/>} />
        <Route path='/instructor/course/add-lecture/:id' element={<AddCourseLectures/>} />
        <Route path='/admin/courses' element={<CourseList/>} />
        <Route path='/instructor/courses' element={<CourseList/>} />
        <Route path='/:admin/course/edit/:id' element={<ManageCourse/>} />
        <Route path='/:instructor/course/edit/:id' element={<ManageCourse/>} />
        </Route>

        {/* Authenticated User Routes */}
        <Route path='/user/courses/:courseId/lectures' element={<CourseLecture />} />
        
        {/* Catch-all Route */}
        <Route path='*' element={<NotFound/>} />
      </Routes>
    </>
  )
}

export default App
