
import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button, Spin, message } from "antd";
import Footer from "../../Compontents/Footer";
import Header from "../../Compontents/Header";
import UserApi from "../../APIs/UserApi";

const CourseLecture = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [selectedLectureIndex, setSelectedLectureIndex] = useState(0);

  useEffect(() => {
    const fetchCourseLectures = async () => {
      try {
        setLoading(true);
        const response = await UserApi.getCourseLectures(courseId);
        setCourse(response.course);
      } catch (error) {
        message.error("Failed to load course lectures");
        navigate("/user/courses");
      } finally {
        setLoading(false);
      }
    };

    // If location state has lectures (from navigation), use that
    if (location.state?.lectures) {
      setCourse(location.state);
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

  if (!course) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Course not found</h2>
          <Button type="primary" onClick={() => navigate("/user/courses")}>
            Back to Courses
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  const selectedLecture = course.lessons[selectedLectureIndex];

  return (
    <>
      <Header />
      <Wrapper>
        <Sidebar>
          <CourseTitle>{course.title}</CourseTitle>
          <SidebarTitle>Lectures ({course.lessons.length})</SidebarTitle>
          {course.lessons.map((lecture, index) => (
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
            <LectureDuration>Duration: {selectedLecture.duration || 'Not specified'}</LectureDuration>
            <LectureDate>Added: {new Date(selectedLecture.createdAt || Date.now()).toLocaleDateString()}</LectureDate>
          </LectureMeta>

          {selectedLecture.videoUrl && (
            <VideoSection>
              <VideoContainer>
                <iframe
                  src={selectedLecture.videoUrl}
                  title={selectedLecture.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </VideoContainer>
            </VideoSection>
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
            {selectedLectureIndex < course.lessons.length - 1 && (
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
  height: calc(100vh - 120px);
  position: sticky;
  top: 60px;
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

const LectureDuration = styled.span``;
const LectureDate = styled.span``;

const VideoSection = styled.div`
  margin-bottom: 2rem;
`;

const VideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  border-radius: 8px;
  background-color: #000;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;

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