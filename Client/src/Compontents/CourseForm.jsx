

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CourseForm = ({ initialData, onSubmit, thumbnailPreview, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    lessons: [],
    discountAmount: 0,
    discountExpiry: '',
    ...initialData
  });

  
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [preview, setPreview] = useState(thumbnailPreview);

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Allow empty string (for clearing) or valid numbers
    if (value === '' || !isNaN(value)) {
      setFormData(prev => ({
        ...prev,
        price: value === '' ? '' : parseFloat(value) // Use parseFloat for decimals if needed
      }));
    }
  };


  const handleDiscountChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : (name === 'discountAmount' ? parseFloat(value) : value)
    }));
  };

  // Update form data when initialData changes
  // useEffect(() => {
  //   if (initialData) {
  //     setFormData(prev => ({
  //       ...prev,
  //       ...initialData,
  //       price: initialData.price !== undefined ? initialData.price : 0, 
  //       lessons: initialData.lessons ? [...initialData.lessons] : []
  //     }));
  //     setPreview(thumbnailPreview);
  //   }
  // }, [initialData, thumbnailPreview]);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        price: initialData.price !== undefined ? initialData.price : 0,
        discountAmount: initialData.discount?.amount || 0,
        discountExpiry: initialData.discount?.expiresAt 
          ? new Date(initialData.discount.expiresAt).toISOString().split('T')[0]
          : '',
        lessons: initialData.lessons ? [...initialData.lessons] : []
      }));
      setPreview(thumbnailPreview);
    }
  }, [initialData, thumbnailPreview]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Handle Change Value :", value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons[index][field] = value;
    setFormData(prev => ({ ...prev, lessons: updatedLessons }));
  };

  const handleAddLesson = () => {
    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, { title: '', content: '' }]
    }));
  };

  const handleRemoveLesson = (index) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons.splice(index, 1);
    setFormData(prev => ({ ...prev, lessons: updatedLessons }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   onSubmit(formData, thumbnailFile);
  // };

  // In handleSubmit function
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Ensure price is a number before submission
  const submissionData = {
    ...formData,
    price: Number(formData.price) || 0,
    discountAmount: formData.discountAmount ? Number(formData.discountAmount) : undefined,
    discountExpiry: formData.discountExpiry || undefined
   
  };
  
  onSubmit(submissionData, thumbnailFile);
};

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="description">Description</Label>
        <TextArea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows="5"
          required
          disabled={isLoading}
        />
      </FormGroup>


      <FormGroup>
        <Label htmlFor="price">Price</Label>
        <Input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handlePriceChange}
          min="0"
          step="1"
          required
          disabled={isLoading}
        />
      </FormGroup>


      <FormGroup>
        <Label htmlFor="category">Category</Label>
        <Input
          type="text"
          id="category"
          name="category"
          value={formData.category || ''}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="discountAmount">Discount Amount (PKR)</Label>
        <Input
          type="number"
          id="discountAmount"
          name="discountAmount"
          value={formData.discountAmount}
          onChange={handleDiscountChange}
          min="0"
          step="1"
          disabled={isLoading}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="discountExpiry">Discount Expiry Date</Label>
        <Input
          type="date"
          id="discountExpiry"
          name="discountExpiry"
          value={formData.discountExpiry}
          onChange={handleDiscountChange}
          disabled={isLoading}
        />
      </FormGroup>

      <FormGroup>
        <Label>Thumbnail</Label>
        <ThumbnailPreview>
          {preview ? (
            <PreviewImage 
              src={typeof preview === 'string' ? preview : preview.url} 
              alt="Thumbnail preview" 
            />
          ) : (
            <PreviewPlaceholder>No thumbnail selected</PreviewPlaceholder>
          )}
        </ThumbnailPreview>
        <FileInput
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
          disabled={isLoading}
        />
      </FormGroup>

      <LessonsHeader>
        Lessons
        <AddLessonButton 
          type="button" 
          onClick={handleAddLesson}
          disabled={isLoading}
        >
          Add Lesson
        </AddLessonButton>
      </LessonsHeader>

      {formData.lessons?.map((lesson, index) => (
        <LessonGroup key={index}>
          <LessonHeader>
            Lesson {index + 1}
            <RemoveLessonButton 
              type="button" 
              onClick={() => handleRemoveLesson(index)}
              disabled={isLoading}
            >
              Remove
            </RemoveLessonButton>
          </LessonHeader>
          
          <FormGroup>
            <Label htmlFor={`lesson-title-${index}`}>Title</Label>
            <Input
              type="text"
              id={`lesson-title-${index}`}
              value={lesson.title || ''}
              onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
              required
              disabled={isLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor={`lesson-content-${index}`}>Content</Label>
            <TextArea
              id={`lesson-content-${index}`}
              value={lesson.content || ''}
              onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
              rows="5"
              required
              disabled={isLoading}
            />
          </FormGroup>
        </LessonGroup>
      ))}

      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </SubmitButton>
    </Form>
  );
};

// Styled Components
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3182ce;
    outline: none;
  }

  &:disabled {
    background-color: #f7fafc;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  resize: vertical;

  &:focus {
    border-color: #3182ce;
    outline: none;
  }

  &:disabled {
    background-color: #f7fafc;
    cursor: not-allowed;
  }
`;

const ThumbnailPreview = styled.div`
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f7fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
`;

const PreviewPlaceholder = styled.div`
  padding: 2rem;
  color: #718096;
  font-size: 1rem;
`;

const FileInput = styled.input`
  padding: 0.5rem;
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const LessonsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 0 1rem;
  font-size: 1.25rem;
  color: #2d3748;
`;

const AddLessonButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #38a169;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #2f855a;
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const LessonGroup = styled.div`
  padding: 1.5rem;
  background-color: #f7fafc;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const LessonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #4a5568;
`;

const RemoveLessonButton = styled.button`
  padding: 0.25rem 0.75rem;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #c53030;
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
  align-self: flex-start;

  &:hover {
    background-color: #2c5282;
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: #2d3748;
`;

export default CourseForm;