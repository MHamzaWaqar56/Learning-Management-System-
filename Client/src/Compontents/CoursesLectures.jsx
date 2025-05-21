
import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Spin, Modal , Tag} from 'antd';
import { toast } from 'react-toastify';
import { Context } from '../main';
import approvalApi from '../APIs/ApprovalApi';
import CourseProgress from '../Pages/CourseProgress';
import EnrollmentButton from './EnrollmentButton';
import FormatPrice from '../Helper/FormatPrice';

// Styled Components

const CoursesWrapper = styled.div`
  padding: 2rem;
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
`;

const TitlePrice = styled.div`
  display : flex;
  justify-content: space-between;
`

const OriginalPrice = styled.span`
  text-decoration: line-through;
  color: #999;
  font-size: 0.9rem;
  margin-right: 0.5rem;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const CarouselContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 1.5rem;
  scroll-behavior: smooth;
  padding-bottom: 1rem;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CourseCard = styled.div`
  flex: 0 0 auto;
  width: 30%;
  background: white;
  border-radius: 0.8rem;
  position : relative;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: 0.3s;
`;

const Thumbnail = styled.div`
  width: 100%;
  height: 180px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CourseContent = styled.div`
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CourseTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #222;
`;

const CourseDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CourseCategory = styled.span`
  background-color: #f0f0f0;
  color: #555;
  display: flex ;
  justify-content: space-between;
  padding: 0.3rem 0.5rem;
  border-radius: 0.3rem;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
`;

const InstructorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const InstructorAvatar = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-weight: bold;
  text-transform: uppercase;
`;


const DiscountBadge = styled(Tag)`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  font-weight: bold;
  background-color: #ff4d4f;
  color: white;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 14px;
`;




const InstructorName = styled.span`
  color: #555;
  font-size: 0.9rem;
`;

const SeeLecturesButton = styled(Button)`
  margin-top: 1rem;
  width: 100%;
  background-color: #1890ff;
  color: white;
  border: none;

  &:hover {
    background-color: #40a9ff !important;
    color: white !important;
  }
`;

<<<<<<< HEAD
=======
const CoursePrice = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #222;
`;

>>>>>>> 8021f8c (Your commit message)
const ExpiryBadge = styled(Tag)`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  font-weight: bold;
  background-color: #1890ff;
  color: white;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 12px;
`;

const DiscountedPrice = styled.span`
  color: #ff4d4f;
  font-weight: bold;
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
`;

function CoursesLectures() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(Context);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const carouselRef = useRef();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await approvalApi.getAllApprovedCourses({
        page: 1,
        limit: 100, // load all courses
      });

      setCourses(response.courses);
      const status = {};
      response.courses.forEach((course) => {
        status[course._id] = false;
      });
      setEnrollmentStatus(status);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollLeft += 320;
        if (
          carouselRef.current.scrollLeft + carouselRef.current.offsetWidth >=
          carouselRef.current.scrollWidth
        ) {
          carouselRef.current.scrollLeft = 0;
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [courses]);

  const handleSeeLectures = (courseId) => {
    if (!isAuthenticated) {
      setLoginModalVisible(true);
      return;
    }
    navigate(`/user/courses/${courseId}/lectures`);
  };

  const handleEnrollSuccess = (courseId) => {
    setEnrollmentStatus((prev) => ({
      ...prev,
      [courseId]: true,
    }));
  };

  const handleLoginRedirect = () => {
    navigate('/auth');
    setLoginModalVisible(false);
  };

  const isDiscountActive = (course) => {
    if (!course.discount || course.discount.amount <= 0) return false;
    if (!course.discount.expiresAt) return true;
    return new Date(course.discount.expiresAt) > new Date();
  };

  const getDiscountedPrice = (course) => {
    if (!isDiscountActive(course)) return course.price;
    return course.price - course.discount.amount;
  };

  return (
    <CoursesWrapper>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Spin size="large" />
        </div>
      ) : courses.length > 0 ? (
        <CarouselContainer ref={carouselRef}>
        {courses.map((course) => {
          const hasActiveDiscount = isDiscountActive(course);
      const discountedPrice = getDiscountedPrice(course);
      
          return(
          <CourseCard key={course._id}>
          {hasActiveDiscount && (
            <DiscountBadge color="red">
              {Math.round((course.discount.amount / course.price) * 100)}% OFF
            </DiscountBadge>
          )}
            <Thumbnail>
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} />
              ) : (
                <img src="https://via.placeholder.com/300x180?text=No+Thumbnail" alt="Placeholder" />
              )}
            </Thumbnail>
            
            <CourseContent>
            
            <TitlePrice>
              <CourseTitle>{course.title}</CourseTitle>
              <div>
                {hasActiveDiscount ? (
                  <>
                    <OriginalPrice>
                      <FormatPrice price={course.price} />
                    </OriginalPrice>
                    <DiscountedPrice>
                      <FormatPrice price={discountedPrice} />
                    </DiscountedPrice>
                  </>
                ) : (
                  <CoursePrice>
                    <FormatPrice price={course.price} />
                  </CoursePrice>
                )}
              </div>
            </TitlePrice>

            {/* Discount expiry notice */}
            {hasActiveDiscount && course.discount.expiresAt && (
              <ExpiryBadge>
                Offer Ends: {new Date(course.discount.expiresAt).toLocaleDateString()}
              </ExpiryBadge>
            )}
<<<<<<< HEAD

=======
>>>>>>> 8021f8c (Your commit message)
            
              {course.category && (
                <CourseCategory>
                  <p style={{margin: "0px"}}>Category:</p>
                  {course.category}
                </CourseCategory>
              )}
              
              <CourseDescription>
                {course.description?.length > 50 
                  ? `${course.description.substring(0, 50)}...` 
                  : course.description}
              </CourseDescription>
              
              <InstructorInfo>
                <InstructorAvatar>
                  {course.instructor?.name?.charAt(0) || 'I'}
                </InstructorAvatar>
                <InstructorName>
                  {course.instructor?.name || 'Instructor'}
                </InstructorName>
              </InstructorInfo>

              {/* Course Progress Component */}
              {isAuthenticated && enrollmentStatus[course._id] && (
                <CourseProgress courseId={course._id} />
              )}
              
              
              {enrollmentStatus[course._id] ? (
                <SeeLecturesButton 
                  type="primary" 
                  onClick={() => handleSeeLectures(course._id)}
                >
                  See Lectures
                </SeeLecturesButton>
              ) : (
                <EnrollmentButton 
                  courseId={course._id} 
                  onEnrollSuccess={() => handleEnrollSuccess(course._id)}
                  showLoginModal={() => setLoginModalVisible(true)}
                />
              )}
            </CourseContent>
          </CourseCard>
        )})}
        </CarouselContainer>
      ) : (
        <EmptyState>
          <h3>No courses found</h3>
          <p>There are currently no approved courses available</p>
        </EmptyState>
      )}

      <Modal
        title="Login Required"
        open={loginModalVisible}
        onOk={handleLoginRedirect}
        onCancel={() => setLoginModalVisible(false)}
        okText="Login"
        cancelText="Cancel"
      >
        <p>You need to login to enroll in courses or access lectures.</p>
      </Modal>
    </CoursesWrapper>
  );
}

export default CoursesLectures;

