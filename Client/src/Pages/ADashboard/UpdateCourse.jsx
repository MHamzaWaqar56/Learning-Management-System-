import { useState, useEffect } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { Select } from "antd";
import { toast } from "react-toastify";
import courseApi from '../../APIs/CourseApi';

const { Option } = Select;

// Styled Components
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 0;
  background-color: #1a1a1a;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem;
  margin-top: 1.25rem;
  position: relative;
  color: white;
  width: 90vw;
  max-width: 800px;
  background-color: #2d2d2d;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  border-radius: 0.8rem;

  @media (min-width: 768px) {
    gap: 1.75rem;
    padding: 2.5rem;
  }
`;

const BackLink = styled(Link)`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  font-size: 1.5rem;
  color: #00ffff;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const Heading = styled.h1`
  text-align: center;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #facc15;
`;

const MainGrid = styled.main`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    column-gap: 3rem;
  }
`;

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const UploadLabel = styled.label`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const UploadBox = styled.div`
  width: 100%;
  height: 200px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc;
  border-radius: 0.5rem;
  transition: all 0.3s;
  overflow: hidden;
  position: relative;

  &:hover {
    border-color: #00ffff;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UploadText = styled.span`
  font-weight: bold;
  font-size: 1.1rem;
  text-align: center;
  padding: 0 1rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1.1rem;
  font-weight: 600;
  color: #f5f5f5;
`;

const Input = styled.input`
  background: #3a3a3a;
  color: white;
  padding: 0.75rem;
  border: 1px solid #555;
  border-radius: 0.4rem;
  font-size: 1rem;
  transition: border 0.3s;

  &:focus {
    outline: none;
    border-color: #00ffff;
  }

  &::placeholder {
    color: #aaa;
  }
`;

const TextArea = styled.textarea`
  background: #3a3a3a;
  color: white;
  padding: 0.75rem;
  height: 120px;
  resize: none;
  border: 1px solid #555;
  border-radius: 0.4rem;
  font-size: 1rem;
  transition: border 0.3s;

  &:focus {
    outline: none;
    border-color: #00ffff;
  }

  &::placeholder {
    color: #aaa;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background-color: #ca8a04;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.8rem;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;

  &:hover {
    background-color: #facc15;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LessonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AddLessonButton = styled.button`
  background-color: #3a3a3a;
  color: white;
  border: 1px solid #555;
  padding: 0.5rem;
  border-radius: 0.3rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #555;
  }
`;

const StyledSelect = styled(Select)`
  .ant-select-selector {
    background-color: #3a3a3a !important;
    color: white !important;
    border: 1px solid #555 !important;
    border-radius: 0.4rem !important;
  }
  
  .ant-select-arrow {
    color: #aaa !important;
  }
`;

const OutcomeItem = styled.li`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  padding: 0.3rem;
  background: #3a3a3a;
  border-radius: 0.3rem;

  button {
    background: none;
    border: none;
    color: #ff4d4f;
    cursor: pointer;
    margin-left: 0.5rem;
    font-weight: bold;
  }
`;

const LessonCard = styled.div`
  border: 1px solid #555;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background: #3a3a3a;
`;

const RemoveButton = styled.button`
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 0.3rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #ff7875;
  }
`;

function UpdateCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [learningOutcome, setLearningOutcome] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    instructor: "",
    learningOutcomes: [],
    lessons: [],
    status: "pending"
  });

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch instructors list
        const instructorsResponse = await courseApi.getAllInstructors();
        setInstructors(instructorsResponse.data.instructors);

        // Fetch course data
        const courseResponse = await courseApi.getCourse(courseId);
        const course = courseResponse.data.course;
        
        setFormData({
          title: course.title,
          description: course.description,
          price : course.price,
          category: course.category,
          instructor: course.instructor?._id || "",
          learningOutcomes: course.learningOutcomes || [],
          lessons: course.lessons || [],
          status: course.status
        });

        if (course.thumbnail) {
          setThumbnailPreview(course.thumbnail);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load course data");
      } finally {
        setFetching(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLearningOutcome = () => {
    if (learningOutcome.trim() && !formData.learningOutcomes.includes(learningOutcome)) {
      setFormData({
        ...formData,
        learningOutcomes: [...formData.learningOutcomes, learningOutcome]
      });
      setLearningOutcome("");
    }
  };

  const handleRemoveLearningOutcome = (index) => {
    const updatedOutcomes = [...formData.learningOutcomes];
    updatedOutcomes.splice(index, 1);
    setFormData({
      ...formData,
      learningOutcomes: updatedOutcomes
    });
  };

  const handleAddLesson = () => {
    setFormData({
      ...formData,
      lessons: [...formData.lessons, { title: "", content: "" }]
    });
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons[index][field] = value;
    setFormData({
      ...formData,
      lessons: updatedLessons
    });
  };

  const handleRemoveLesson = (index) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons.splice(index, 1);
    setFormData({
      ...formData,
      lessons: updatedLessons
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        price : course.price,
        category: formData.category,
        instructor: formData.instructor,
        learningOutcomes: formData.learningOutcomes,
        lessons: formData.lessons,
        status: formData.status
      };

      // If there's a new thumbnail, we need to handle it differently
      const formDataToSend = new FormData();
      if (document.getElementById("image_uploads").files[0]) {
        formDataToSend.append("thumbnail", document.getElementById("image_uploads").files[0]);
      }
      
      // Append other updates
      Object.entries(updates).forEach(([key, value]) => {
        if (Array.isArray(value) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value);
        }
      });

      const { data } = await courseApi.updateCourse(courseId, formDataToSend);
      toast.success("Course updated successfully!");
      navigate("/courses");
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(error.response?.data?.message || "Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <Container>Loading course data...</Container>;
  }

  return (
    <Container>
      <StyledForm onSubmit={handleSubmit}>
        <BackLink to={"/courses"}>
          <AiOutlineArrowLeft />
        </BackLink>

        <Heading>Update Course</Heading>

        <MainGrid>
          <UploadContainer>
            <UploadLabel htmlFor="image_uploads">
              <UploadBox>
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumbnail preview" />
                ) : (
                  <UploadText>Upload new thumbnail (Max 1MB)</UploadText>
                )}
              </UploadBox>
            </UploadLabel>
            <HiddenInput
              type="file"
              id="image_uploads"
              accept=".jpg,.jpeg,.png"
              onChange={handleThumbnailChange}
            />

            <FieldGroup>
              <Label htmlFor="title">Course title*</Label>
              <Input
                required
                type="text"
                name="title"
                id="title"
                placeholder="Enter course title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="category">Course category*</Label>
              <Input
                required
                type="text"
                name="category"
                id="category"
                placeholder="Enter course category"
                value={formData.category}
                onChange={handleInputChange}
              />
            </FieldGroup>
          </UploadContainer>

          <FlexColumn>
            <FieldGroup>
              <Label htmlFor="instructor">Course instructor*</Label>
              <StyledSelect
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                value={formData.instructor || undefined}
                onChange={(value) => setFormData({...formData, instructor: value})}
                placeholder="Select instructor"
              >
                {instructors.map((instructor) => (
                  <Option key={instructor._id} value={instructor._id}>
                    {instructor.name}
                  </Option>
                ))}
              </StyledSelect>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="description">Course description*</Label>
              <TextArea
                required
                name="description"
                id="description"
                placeholder="Enter course description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </FieldGroup>

            <FieldGroup>
              <Label>Learning Outcomes</Label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Input
                  type="text"
                  value={learningOutcome}
                  onChange={(e) => setLearningOutcome(e.target.value)}
                  placeholder="Enter learning outcome"
                />
                <AddLessonButton type="button" onClick={handleAddLearningOutcome}>
                  Add
                </AddLessonButton>
              </div>
              <ul style={{ marginTop: '0.5rem' }}>
                {formData.learningOutcomes.map((outcome, index) => (
                  <OutcomeItem key={index}>
                    {outcome}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveLearningOutcome(index)}
                    >
                      ×
                    </button>
                  </OutcomeItem>
                ))}
              </ul>
            </FieldGroup>

            <LessonsContainer>
              <Label>Course Lessons</Label>
              {formData.lessons.map((lesson, index) => (
                <LessonCard key={index}>
                  <FieldGroup>
                    <Label>Lesson {index + 1} Title</Label>
                    <Input
                      type="text"
                      placeholder="Lesson title"
                      value={lesson.title}
                      onChange={(e) => handleLessonChange(index, "title", e.target.value)}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Lesson {index + 1} Content</Label>
                    <TextArea
                      placeholder="Lesson content"
                      value={lesson.content}
                      onChange={(e) => handleLessonChange(index, "content", e.target.value)}
                    />
                  </FieldGroup>
                  <RemoveButton 
                    type="button" 
                    onClick={() => handleRemoveLesson(index)}
                  >
                    Remove Lesson
                  </RemoveButton>
                </LessonCard>
              ))}
              <AddLessonButton type="button" onClick={handleAddLesson}>
                + Add Lesson
              </AddLessonButton>
            </LessonsContainer>
          </FlexColumn>
        </MainGrid>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Course"}
        </SubmitButton>
      </StyledForm>
    </Container>
  );
}

export default UpdateCourse;