import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button, Spin, message } from "antd";
import Footer from "../Compontents/Footer";
import Header from "../Compontents/Header";
import UserApi from "../APIs/UserApi";
import LessonCompleteButton from "../Compontents/LessonCompleteButton";
import useCourseProgress from "../Compontents/useCourseProgress";

const CourseLecture = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [courseData, setCourseData] = useState({
      title: "",
      lessons: []
    });
    const [selectedLectureIndex, setSelectedLectureIndex] = useState(0);
  

    const { progress , refetch } = useCourseProgress(courseId);

    const handleQuizClick = () => {
      navigate(`/user/courses/${courseId}/attempt-quiz`);
  };

    useEffect(() => {
      const fetchCourseLectures = async () => {
        try {
          setLoading(true);
          const response = await UserApi.getCourseLectures(courseId);
          
          // Handle both API response and proper structure
          if (response.lessons) {
            setCourseData({
              title: response.course?.title || "Course",
              lessons: response.lessons
            });
          } else if (response.course?.lessons) {
            setCourseData({
              title: response.course.title,
              lessons: response.course.lessons
            });
          }
        } catch (error) {
          message.error("Failed to load course lectures");
          navigate("/user/courses");
        } finally {
          setLoading(false);
        }
      };
  
      // If location state has data, use that
      if (location.state?.course?.lessons) {
        setCourseData({
          title: location.state.course.title,
          lessons: location.state.course.lessons
        });
        setLoading(false);
      } else if (location.state?.lessons) {
        setCourseData({
          title: location.state.title || "Course",
          lessons: location.state.lessons
        });
        setLoading(false);
      } else {
        // Otherwise fetch from API
        fetchCourseLectures();
      }
    }, [courseId, location.state, navigate]);
  
    if (loading) {
      return (
        <>
          <Header />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <Spin size="large" />
          </div>
          <Footer />
        </>
      );
    }
  
    if (!courseData.lessons || courseData.lessons.length === 0) {
      return (
        <>
          <Header />
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>No lectures found for this course</h2>
            <Button type="primary" onClick={() => navigate("/user/courses")}>
              Back to Courses
            </Button>
          </div>
          <Footer />
        </>
      );
    }
  
    const selectedLecture = courseData.lessons[selectedLectureIndex];
  
    return (
      <>
        <Header />
        <Wrapper>
          <Sidebar>
            <CourseTitle>{courseData.title}</CourseTitle>
            <SidebarTitle>Lectures ({courseData.lessons.length})</SidebarTitle>
            {courseData.lessons.map((lecture, index) => (
              <SidebarItem
                key={lecture._id || index}
                onClick={() => setSelectedLectureIndex(index)}
                active={selectedLectureIndex === index}
              >
                <LectureNumber>{index + 1}.</LectureNumber>
                <LectureTitle>{lecture.title}</LectureTitle>
              </SidebarItem>
            ))}
          </Sidebar>
  
          <Content>
            <LectureHeader>
              {selectedLecture.title}
            </LectureHeader>

            <LectureMeta>
              <LectureDate>Course Published : {new Date(selectedLecture.createdAt || Date.now()).toLocaleDateString()}</LectureDate>
            </LectureMeta>

            {progress?.canAttemptQuiz && (
              <QuizButton 
                  type="primary"
                  onClick={handleQuizClick}
              >
                  Take Final Quiz
              </QuizButton>
          )}
  
           
  
            <LectureDescription>
              <h3>About this lecture</h3>
              <p>{selectedLecture.content || 'No description available'}</p>
            </LectureDescription>
  
            <NavigationButtons>
              {selectedLectureIndex > 0 && (
                <PrevButton onClick={() => setSelectedLectureIndex(prev => prev - 1)}>
                  Previous Lecture
                </PrevButton>
              )}


              <LessonCompleteButton courseId={courseId} lessonId={selectedLecture._id} onComplete={refetch} />


              {selectedLectureIndex < courseData.lessons.length - 1 && (
                <NextButton 
                  type="primary" 
                  onClick={() => setSelectedLectureIndex(prev => prev + 1)}
                >
                  Next Lecture
                </NextButton>
              )}
            </NavigationButtons>
          </Content>
        </Wrapper>
        <Footer />
      </>
    );
  };

// Styled Components
const Wrapper = styled.div`
  display: flex;
  background-color: #fdfdfd;
  min-height: calc(100vh - 120px);
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 300px;
  background-color: #1e293b;
  color: white;
  padding: 1.5rem;
  overflow-y: auto;
  height: calc(100vh - 50px);
  position: sticky;
  top: 55px;
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    position: relative;
    top: 0;
  }
`;

const CourseTitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: #f8fafc;
  padding-bottom: 1rem;
  border-bottom: 1px solid #334155;
`;

const SidebarTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SidebarItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  background-color: ${(props) => (props.active ? "#3b82f6" : "transparent")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.active ? "#3b82f6" : "#334155")};
  }
`;

const LectureNumber = styled.span`
  font-weight: bold;
  margin-right: 0.5rem;
  color: ${(props) => (props.active ? "white" : "#94a3b8")};
`;

const QuizButton = styled(Button)`
  width: 100%;
  margin-top: 10px;
  background-color: #1890ff;
  color: white;
  border-radius : 4px;
  
  &:hover {
    background-color: #40a9ff;
    color: white;
  }
`;

const LectureTitle = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem 3rem;
  max-width: 900px;
  margin: 0 auto;
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const LectureHeader = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
`;

const LectureMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  color: #64748b;
  font-size: 0.9rem;
`;


const LectureDate = styled.span``;


const LectureDescription = styled.div`
  background-color: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;

  h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: #1e293b;
  }

  p {
    color: #475569;
    line-height: 1.6;
    white-space: pre-line;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const PrevButton = styled(Button)`
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;

  &:hover {
    background-color: #e2e8f0;
    color: #1e293b;
    border-color: #94a3b8;
  }
`;

const NextButton = styled(Button)`
  background-color: #3b82f6;
  color: white;
  border: none;

  &:hover {
    background-color: #2563eb;
    color: white;
  }
`;

export default CourseLecture;
