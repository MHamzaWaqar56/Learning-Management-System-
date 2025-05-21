
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import styled from "styled-components";
import { Layout } from "antd";
import SidebarMenu from "../../Compontents/SidebarMenu.jsx";
import { Context } from "../../main.jsx"; // Adjust path as needed

const { Content } = Layout;

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const MainContent = styled(Content)`
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled.div`
  min-height: 90vh;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  width: 100%;
`;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 80vw;
  max-width: 28rem;
  border-radius: 0.5rem;
  background-color: #fff;
  color: #000;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 1rem;
`;

const BackButton = styled.button`
  position: absolute;
  left: 0;
  font-size: 1.5rem;
  color: #22c55e;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  width: 100%;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  resize: none;
  height: 9rem;
  width: 100%;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const UploadWrapper = styled.div`
  height: 12rem;
  border: 2px dashed #ddd;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 1rem;
  text-align: center;

  &:hover {
    border-color: #3b82f6;
    background-color: #f0f7ff;
  }
`;

const UploadLabel = styled.label`
  font-weight: 600;
  cursor: pointer;
  color: #3b82f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const FileInfo = styled.span`
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.5rem;
`;

const SubmitButton = styled.button`
  padding: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;

  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

function AddCourseLectures() {
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const { role } = useParams();
  
  // Determine role - priority: URL param > user context > default to instructor
  const currentRole = role || user?.role || 'instructor';
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lecture: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, lecture: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('lecture', formData.lecture);
      
      // Replace with your actual API call
      // const response = await api.addLecture(formPayload);
      
      // On success
      navigate(`/${currentRole}/courses`);
    } catch (error) {
      console.error('Error adding lecture:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardContainer>
      <SidebarMenu role={currentRole} defaultSelectedKey="courses" />
      
      <MainContent>
        <FormContainer>
          <FormWrapper>
            <Header>
              <BackButton onClick={() => navigate(-1)}>
                <AiOutlineArrowLeft />
              </BackButton>
              <Title>Add New Lecture</Title>
            </Header>
            
            <Form onSubmit={handleSubmit}>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter lecture title"
                required
              />
              
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter lecture description"
                required
              />
              
              <UploadWrapper>
                <input
                  type="file"
                  id="lecture"
                  name="lecture"
                  accept="video/mp4, video/x-mp4, video/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  required
                />
                <UploadLabel htmlFor="lecture">
                  {formData.lecture ? (
                    <>
                      <span>Selected: {formData.lecture.name}</span>
                      <FileInfo>Click to change video file</FileInfo>
                    </>
                  ) : (
                    <>
                      <span>Choose lecture video</span>
                      <FileInfo>MP4 format recommended (Max 500MB)</FileInfo>
                    </>
                  )}
                </UploadLabel>
              </UploadWrapper>
              
              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Lecture'}
              </SubmitButton>
            </Form>
          </FormWrapper>
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
}

export default AddCourseLectures;