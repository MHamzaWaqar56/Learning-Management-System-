
import { useState, useContext } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Select, Layout } from "antd";
import { toast } from "react-toastify";
import SidebarMenu from '../../Compontents/SidebarMenu';
import {Context} from "../../main";
import Header from "../../Compontents/Header";
import Footer from "../../Compontents/Footer";
import courseApi from "../../APIs/CourseApi";

const { Option } = Select;
const { Content } = Layout;

// Styled Components (keep all your existing styles)

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

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #1a1a1a;
`;

const MainContent = styled(Content)`
  padding: 24px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const PriceContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const DiscountExpiryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const DateInput = styled.input`
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



function CreateCourse() {
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const currentRole = user?.role;
  console.log("CurrentRole :", currentRole);
  
  const [loading, setLoading] = useState(false);
  const [showExpiryDate, setShowExpiryDate] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: 0,
    discount: 0,
    discountExpiry: "",
    learningOutcomes: [],
    lessons: [],
    status: "pending"
  });
    
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === "discount") {
      setShowExpiryDate(value > 0);
      if (value <= 0) {
        setFormData(prev => ({
          ...prev,
          discountExpiry: ""
        }));
      }
    }


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
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price);
      // formDataToSend.append("discount", formData.discount);

       // Convert percentage to actual amount before sending
    const discountAmount = (formData.price * formData.discount) / 100;
    formDataToSend.append("discountAmount", discountAmount);
    

      if (formData.discount > 0) {
        formDataToSend.append("discountExpiry", formData.discountExpiry);
      }
      // formDataToSend.append("learningOutcomes", JSON.stringify(formData.learningOutcomes));
      formDataToSend.append("lessons", JSON.stringify(formData.lessons));
      formDataToSend.append("status", formData.status);
      
      if (document.getElementById("image_uploads").files[0]) {
        formDataToSend.append("thumbnail", document.getElementById("image_uploads").files[0]);
      }

      console.log("Form Data being sent:", {
        title: formData.title,
        price: formData.price,
        discount: formData.discount,
        discountAmount,
        discountExpiry: formData.discountExpiry
      });

      const { data } = await courseApi.createCourse(formDataToSend);
      console.log("Course Data :", data)
      toast.success("Course created successfully!");
      navigate(`/${currentRole}/courses`);
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(error.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header/>
      <DashboardContainer>
        <SidebarMenu role={currentRole} defaultSelectedKey="courses" />
        
        <MainContent>
          <FormContainer>
            <StyledForm onSubmit={handleSubmit}>
              <BackLink to={`/${currentRole}/courses`}>
                <AiOutlineArrowLeft />
              </BackLink>

              <Heading>Create New Course</Heading>

              <MainGrid>
                <UploadContainer>
                  <UploadLabel htmlFor="image_uploads">
                    <UploadBox>
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Thumbnail preview" />
                      ) : (
                        <UploadText>Upload your course thumbnail (Max 1MB)</UploadText>
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

                  <PriceContainer>
                    <FieldGroup>
                      <Label htmlFor="price">Price (PKR)*</Label>
                      <Input
                        required
                        type="number"
                        name="price"
                        id="price"
                        placeholder="Enter course price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </FieldGroup>

                    <FieldGroup>
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        type="number"
                        name="discount"
                        id="discount"
                        placeholder="Enter discount percentage"
                        value={formData.discount}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                      />
                    </FieldGroup>

                    {showExpiryDate && (
                      <DiscountExpiryContainer>
                        <Label htmlFor="discountExpiry">Discount Expiry Date</Label>
                        <DateInput
                          type="date"
                          name="discountExpiry"
                          id="discountExpiry"
                          value={formData.discountExpiry}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]} // Set min date to today
                        />
                      </DiscountExpiryContainer>
                    )}


                  </PriceContainer>
                </UploadContainer>

                <FlexColumn>
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

                  <LessonsContainer>
                    <Label>Course Lessons</Label>
                    {formData.lessons.map((lesson, index) => (
                      <div key={index} style={{ border: '1px solid #555', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
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
                        <FieldGroup>
                          <Label>Lesson {index + 1} Sequence Number</Label>
                          <Input
                            type="number"
                            placeholder="Sequence number"
                            value={lesson.sequence || ""}
                            onChange={(e) => handleLessonChange(index, "sequence", e.target.value)}
                          />
                        </FieldGroup>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveLesson(index)}
                          style={{ 
                            background: '#ff4d4f', 
                            color: 'white', 
                            border: 'none', 
                            padding: '0.3rem 0.6rem', 
                            borderRadius: '0.3rem',
                            cursor: 'pointer',
                            marginTop: '0.5rem'
                          }}
                        >
                          Remove Lesson
                        </button>
                      </div>
                    ))}
                    <AddLessonButton type="button" onClick={handleAddLesson}>
                      + Add Lesson
                    </AddLessonButton>
                  </LessonsContainer>
                </FlexColumn>
              </MainGrid>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Course"}
              </SubmitButton>
            </StyledForm>
          </FormContainer>
        </MainContent>
      </DashboardContainer>
      <Footer/>
    </>
  );
}

export default CreateCourse;