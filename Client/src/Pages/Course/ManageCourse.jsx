

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Layout,
  Button,
  Modal,
  Typography,
  Tag,
  Collapse,
  Divider,
} from "antd";
import CourseForm from "../../Compontents/CourseForm";
import SidebarMenu from "../../Compontents/SidebarMenu";
import Header from "../../Compontents/Header";
import Footer from "../../Compontents/Footer";
import courseApi from "../../APIs/CourseApi";
import quizApi from "../../APIs/QuizApi";
import AddQuestionsModal from "../../Compontents/AddQuestionModel";
import CreateQuizModal from "../ADashboard/CreateQuizModel";
import {
  CaretRightOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import EditQuestionModal from "../../Compontents/EditQuestionModal";
import FormatPrice from "../../Helper/formatPrice";

const { Content, Panel } = Layout;
const { Text, Title } = Typography;
const { Panel: CollapsePanel } = Collapse;

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
`;

const MainContent = styled(Content)`
  margin: 24px;
  min-height: calc(100vh - 48px);
`;

const CourseContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const CourseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const BaseButton = styled(Button)`
  && {
    padding: 0.5rem 1rem;
    border-radius: 5px;
    font-weight: 600;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
`;

const DeleteButton = styled(BaseButton)`
  && {
    background-color: #e53e3e;
    color: white;
    border-color: #e53e3e;

    &:hover {
      background-color: #c53030;
      border-color: #c53030;
    }
  }
`;

const EditButton = styled(BaseButton)`
  background-color: #3182ce;
  color: white;

  &:hover {
    background-color: #2b6cb0;
  }
`;

const QuizButton = styled(BaseButton)`
  background-color: #805ad5;
  color: white;

  &:hover {
    background-color: #6b46c1;
  }
`;

const CancelButton = styled(BaseButton)`
  background-color: #718096;
  color: white;

  &:hover {
    background-color: #4a5568;
  }
`;

const CourseDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ThumbnailContainer = styled.div`
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f7fafc;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
`;

const Placeholder = styled.div`
  padding: 2rem;
  color: #718096;
  font-size: 1.2rem;
`;

const DetailGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.span`
  font-weight: 600;
  color: #4a5568;
  font-size: 1.1rem;
`;

const Detail = styled.span`
  color: #2d3748;
  font-size: 1rem;
  line-height: 1.5;
  padding: 0.75rem;
  background-color: #f7fafc;
  border-radius: 5px;
  white-space: pre-wrap;
`;

const LessonsSection = styled.div`
  margin-top: 1.5rem;
`;

const LessonsHeader = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1rem;
`;

const LessonsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const LessonItem = styled.div`
  padding: 1rem;
  background-color: #edf2f7;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const LessonTitle = styled.h3`
  font-size: 1.1rem;
  color: #2b6cb0;
  margin: 0 0 0.5rem 0;
`;

const LessonContent = styled.p`
  color: #4a5568;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #4a5568;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #e53e3e;
`;

const QuestionContainer = styled.div`
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const QuestionsList = styled.div`
  margin-top: 24px;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
`;

const QuestionItem = styled.div`
  margin-bottom: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const OptionsList = styled.ul`
  margin: 8px 0 0 16px;
  padding: 0;
`;

const OptionItem = styled.li`
  margin-bottom: 4px;
  list-style-type: none;
`;

const CorrectOption = styled.span`
  color: #52c41a;
  font-weight: 500;
`;

const QuestionsSection = styled.div`
  margin-top: 24px;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
`;

const QuestionActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const OptionTag = styled(Tag)`
  margin-bottom: 4px;
  &.correct-option {
    background-color: #f6ffed;
    border-color: #b7eb8f;
    color: #389e0d;
  }
`;

const ManageCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    thumbnail: null,
    lessons: [],
    totalLessons: 0,
    quiz: null,
    discount: {
      amount: 0,
      expiresAt: null
    },
    discountedPrice: 0
  });
  console.log("Discount :", course);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [addQuestionsModalVisible, setAddQuestionsModalVisible] =
    useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [editQuestionModalVisible, setEditQuestionModalVisible] =
    useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const courseData = await courseApi.getCourseById(id);

        if (!courseData) {
          throw new Error("No course data received from server");
        }

        // Only try to fetch quiz if course has quiz reference
        if (courseData.quiz) {
          const quizData = await quizApi.getAdminQuiz(
            id,
            localStorage.getItem("token")
          );
          // Only update if quiz exists
          if (quizData) {
            courseData.quiz = quizData;
            fetchQuizQuestions(); // Fetch questions if quiz exists
          } else {
            // Remove quiz reference if not found
            courseData.quiz = null;
          }
        }

        setCourse(courseData);
        setThumbnailPreview(courseData.thumbnail || null);
      } catch (err) {
        console.error("Failed to fetch course:", err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [
    id,
    editMode,
    showQuizModal,
    addQuestionsModalVisible,
    editQuestionModalVisible,
  ]);

  const handleUpdate = async (updatedData, thumbnailFile) => {
    try {
      setLoading(true);

      // const discount = updatedData.discountAmount !== undefined ? {
      //   amount: Number(updatedData.discountAmount),
      //   ...(updatedData.discountExpiry && { expiresAt: new Date(updatedData.discountExpiry) })
      // } : undefined;

      const updatedCourse = await courseApi.updateCourse(
        id,
        updatedData,
        thumbnailFile
      );


      setCourse(updatedCourse);
      setThumbnailPreview(updatedCourse.thumbnail || null);
      setEditMode(false);
      toast.success("Course updated successfully");
    } catch (err) {
      console.error("Update failed:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // In handleUpdate function

  // const handleUpdate = async (updatedData, thumbnailFile) => {
  //   try {
  //     setLoading(true);
  //     const payload = {
  //       ...updatedData,
  //       price: updatedData.price === "" ? 0 : Number(updatedData.price),
  //     };

  //     console.log("Submitting Payload:", payload);

  //     const response = await courseApi.updateCourse(id, payload, thumbnailFile);
  //     console.log("API Response:", response);

  //     // Add debug log before state update
  //     console.log("Current course state BEFORE update:", course);

  //     setCourse((prev) => {
  //       const updated = {
  //         ...prev,
  //         ...response,
  //         price: response.price, // Explicitly use backend's returned price
  //       };
  //       console.log("New state being set:", updated);
  //       return updated;
  //     });

  //     setThumbnailPreview(response.thumbnail || null);
  //     setEditMode(false);
  //     toast.success("Course updated successfully");
  //   } catch (err) {
  //     console.error("Update failed:", err);
  //     toast.error(err.message || "Failed to update course");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        setLoading(true);
        await courseApi.deleteCourse(id);
        toast.success("Course deleted successfully");
        navigate("/admin/courses");
      } catch (err) {
        console.error("Delete failed:", err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchQuizQuestions = async () => {
    if (!course.quiz) return;

    try {
      setQuestionsLoading(true);
      const token = localStorage.getItem("token");
      const response = await quizApi.getQuizQuestions(course.quiz._id, token);
      console.log("ManageCourse Response :", response);
      setQuizQuestions(response.questions);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      toast.error("Failed to load quiz questions");
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    if (course.quiz && course.quiz._id) {
      fetchQuizQuestions();
    }
  }, [course.quiz]);

  const handleEditQuestion = (question) => {
    setCurrentQuestion(question);
    setEditQuestionModalVisible(true);
  };

  const handleUpdateQuestion = async (updatedQuestion) => {
    try {
      const token = localStorage.getItem("token");
      await quizApi.updateQuizQuestion(
        course.quiz._id,
        currentQuestion._id,
        updatedQuestion,
        token
      );
      toast.success("Question updated successfully");
      setEditQuestionModalVisible(false);
      fetchQuizQuestions();
    } catch (error) {
      toast.error("Failed to update question");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const token = localStorage.getItem("token");
        await quizApi.deleteQuizQuestion(course.quiz._id, questionId, token);
        toast.success("Question deleted successfully");
        fetchQuizQuestions();
      } catch (error) {
        toast.error("Failed to delete question");
      }
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <DashboardContainer>
          <SidebarMenu role="admin" defaultSelectedKey="courses" />
          <MainContent>
            <LoadingContainer>Loading course details...</LoadingContainer>
          </MainContent>
        </DashboardContainer>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <DashboardContainer>
          <SidebarMenu role="admin" defaultSelectedKey="courses" />
          <MainContent>
            <ErrorContainer>{error}</ErrorContainer>
          </MainContent>
        </DashboardContainer>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header />
        <DashboardContainer>
          <SidebarMenu role="admin" defaultSelectedKey="courses" />
          <MainContent>
            <ErrorContainer>Course not found</ErrorContainer>
          </MainContent>
        </DashboardContainer>
        <Footer />
      </>
    );
  }

  const handleQuestionSuccess = (updatedQuiz) => {
    setCourse((prev) => ({ ...prev, quiz: updatedQuiz }));
    setAddQuestionsModalVisible(false);
    fetchQuizQuestions(); // Refresh questions after adding new ones
  };

  return (
    <>
      <Header />
      <DashboardContainer>
        <SidebarMenu role="admin" defaultSelectedKey="courses" />
        <MainContent>
          <CourseContainer>
            <CourseHeader>
              <Title>{editMode ? "Edit Course" : "Manage Course"}</Title>
              <ButtonGroup>
                {!editMode ? (
                  <>
                    <EditButton
                      onClick={() => setEditMode(true)}
                      disabled={loading}
                    >
                      Edit Course
                    </EditButton>
                    <QuizButton
                      onClick={() => setShowQuizModal(true)}
                      disabled={loading}
                    >
                      {course.quiz ? "Edit Quiz" : "Create Quiz"}
                    </QuizButton>
                    <DeleteButton onClick={handleDelete} disabled={loading}>
                      Delete Course
                    </DeleteButton>
                  </>
                ) : (
                  <CancelButton
                    onClick={() => setEditMode(false)}
                    disabled={loading}
                  >
                    Cancel
                  </CancelButton>
                )}
              </ButtonGroup>
            </CourseHeader>

            {editMode ? (
              <CourseForm
                initialData={course}
                onSubmit={handleUpdate}
                thumbnailPreview={thumbnailPreview}
                isLoading={loading}
              />
            ) : (
              <CourseDetails>
                <ThumbnailContainer>
                  {thumbnailPreview ? (
                    typeof thumbnailPreview === "string" ? (
                      <Thumbnail
                        src={thumbnailPreview}
                        alt="Course thumbnail"
                      />
                    ) : (
                      <Thumbnail
                        src={thumbnailPreview.url}
                        alt="Course thumbnail"
                      />
                    )
                  ) : (
                    <Placeholder>No Thumbnail</Placeholder>
                  )}
                </ThumbnailContainer>

                <DetailGroup>
                  <Label>Title:</Label>
                  <Detail>{course.title}</Detail>
                </DetailGroup>

                <DetailGroup>
                  <Label>Description:</Label>
                  <Detail>{course.description}</Detail>
                </DetailGroup>

                <DetailGroup>
                  <Label>Price:</Label>
                  <Detail>
                  {course?.price ?
                  <FormatPrice price={course.price} /> : "NaN"}</Detail>
                </DetailGroup>


                {course.discount && (
                  <>
                    <DetailGroup>
                      <Label>Discount Amount:</Label>
                      <Detail>
                        <FormatPrice price={course.discount.amount} />
                      </Detail>
                    </DetailGroup>
                    <DetailGroup>
                      <Label>Discounted Price:</Label>
                      <Detail>
                        <FormatPrice price={course.discountedPrice} />
                      </Detail>
                    </DetailGroup>
                    {course.discount.expiresAt && (
                      <DetailGroup>
                        <Label>Discount Expires:</Label>
                        <Detail>
                          {new Date(course.discount.expiresAt).toLocaleDateString()}
                        </Detail>
                      </DetailGroup>
                    )}
                  </>
                )}


                <DetailGroup>
                  <Label>Category:</Label>
                  <Detail>{course.category}</Detail>
                </DetailGroup>

                <DetailGroup>
                  <Label>Total Lessons:</Label>
                  <Detail>{course.lessons?.length || 0}</Detail>
                </DetailGroup>

                <DetailGroup>
                  <Label>Quiz Status:</Label>
                  <Detail>
                    {course.quiz ? (
                      <span style={{ color: "green" }}>Active</span>
                    ) : (
                      <span style={{ color: "orange" }}>Not Created</span>
                    )}
                  </Detail>
                </DetailGroup>

                {course.quiz && (
                  <>
                    <DetailGroup>
                      <Label>Quiz Details:</Label>
                      <Detail>
                        <div>
                          <strong>Title:</strong> {course.quiz.title}
                        </div>
                        <div>
                          <strong>Passing Score:</strong>{" "}
                          {course.quiz.passingScore}%
                        </div>
                        <div>
                          <strong>Questions:</strong>{" "}
                          {course.quiz.questions?.length || 0}
                        </div>
                        <div>
                          <strong>Time Limit:</strong> {course.quiz.timeLimit}{" "}
                          minutes
                        </div>
                      </Detail>
                    </DetailGroup>
                    <ButtonGroup>
                      <Button
                        type="primary"
                        onClick={() => setAddQuestionsModalVisible(true)}
                        style={{ marginTop: "1rem" }}
                      >
                        Add Questions
                      </Button>
                      <DeleteButton disabled={quizLoading}>
                        {quizLoading ? "Deleting..." : "Delete Quiz"}
                      </DeleteButton>
                    </ButtonGroup>

                    {/* Quiz Questions Section with Collapse */}
                    <QuestionsList>
                      <Title level={4}>Quiz Questions</Title>
                      {questionsLoading ? (
                        <div>Loading questions...</div>
                      ) : quizQuestions.length === 0 ? (
                        <div>No questions added yet</div>
                      ) : (
                        <Collapse
                          bordered={false}
                          expandIcon={({ isActive }) => (
                            <CaretRightOutlined rotate={isActive ? 90 : 0} />
                          )}
                          className="site-collapse-custom-collapse"
                        >
                          {quizQuestions.map((question, index) => (
                            <CollapsePanel
                              key={question._id}
                              header={`Q${index + 1}: ${question.question}`}
                              className="site-collapse-custom-panel"
                            >
                              <div>
                                <Text strong>Options:</Text>
                                <div style={{ marginTop: 8 }}>
                                  {question.options.map((option, i) => (
                                    <OptionTag
                                      key={i}
                                      className={
                                        i === question.correctAnswer
                                          ? "correct-option"
                                          : ""
                                      }
                                    >
                                      {option}
                                      {i === question.correctAnswer &&
                                        " (Correct)"}
                                    </OptionTag>
                                  ))}
                                </div>
                                {question.explanation && (
                                  <>
                                    <Divider />
                                    <Text strong>Explanation:</Text>
                                    <Text>{question.explanation}</Text>
                                  </>
                                )}
                                <QuestionActions>
                                  <Button
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditQuestion(question)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() =>
                                      handleDeleteQuestion(question._id)
                                    }
                                  >
                                    Delete
                                  </Button>
                                </QuestionActions>
                              </div>
                            </CollapsePanel>
                          ))}
                        </Collapse>
                      )}
                    </QuestionsList>
                  </>
                )}

                {course.lessons?.length > 0 && (
                  <LessonsSection>
                    <LessonsHeader>Lessons</LessonsHeader>
                    <LessonsList>
                      {course.lessons.map((lesson, index) => (
                        <LessonItem key={index}>
                          <LessonTitle>{lesson.title}</LessonTitle>
                          <LessonContent>
                            {lesson.content.substring(0, 100)}
                            {lesson.content.length > 100 && "..."}
                          </LessonContent>
                        </LessonItem>
                      ))}
                    </LessonsList>
                  </LessonsSection>
                )}
              </CourseDetails>
            )}
          </CourseContainer>

          {showQuizModal && (
            <CreateQuizModal
              courseId={id}
              existingQuiz={course.quiz || null}
              onClose={() => setShowQuizModal(false)}
              onSuccess={(quiz) => {
                setCourse((prev) => ({ ...prev, quiz }));
                setShowQuizModal(false);
                fetchQuizQuestions();
              }}
            />
          )}

          {editQuestionModalVisible && currentQuestion && (
            <EditQuestionModal
              visible={editQuestionModalVisible}
              question={currentQuestion}
              onClose={() => setEditQuestionModalVisible(false)}
              onSubmit={handleUpdateQuestion}
            />
          )}

          {addQuestionsModalVisible && (
            <AddQuestionsModal
              quiz={course.quiz}
              visible={addQuestionsModalVisible}
              onClose={() => setAddQuestionsModalVisible(false)}
              onSuccess={handleQuestionSuccess}
            />
          )}
        </MainContent>
      </DashboardContainer>
      <Footer />
    </>
  );
};

export default ManageCourse;
