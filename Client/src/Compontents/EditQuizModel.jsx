import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import quizApi from '../APIs/QuizApi';

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModalHeader = styled.h2`
  color: #2d3748;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const PrimaryButton = styled.button`
  background-color: #4299e1;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  flex: 1;

  &:hover {
    background-color: #3182ce;
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background-color: white;
  color: #4a5568;
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;

  &:hover {
    background-color: #f7fafc;
    border-color: #cbd5e0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

function EditQuizModal({ quiz, onSuccess, onClose }) {
  const token = localStorage.getItem('token');
  const [quizData, setQuizData] = useState({
    title: quiz.title,
    description: quiz.description,
    passingScore: quiz.passingScore,
    timeLimit: quiz.timeLimit,
    shuffleQuestions: quiz.shuffleQuestions,
    shuffleOptions: quiz.shuffleOptions,
    showCorrectAnswers: quiz.showCorrectAnswers
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData({
      ...quizData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedQuiz = await quizApi.updateQuiz(quiz._id, quizData, token);
      toast.success("Quiz updated successfully!");
      onSuccess(updatedQuiz);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>Edit Quiz</ModalHeader>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={quizData.title}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              value={quizData.description}
              onChange={handleChange}
            />
          </InputGroup>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <InputGroup style={{ flex: 1 }}>
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                type="number"
                id="passingScore"
                name="passingScore"
                value={quizData.passingScore}
                onChange={handleChange}
                min="1"
                max="100"
                required
              />
            </InputGroup>

            <InputGroup style={{ flex: 1 }}>
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                type="number"
                id="timeLimit"
                name="timeLimit"
                value={quizData.timeLimit}
                onChange={handleChange}
                min="1"
                required
              />
            </InputGroup>
          </div>

          <InputGroup>
            <Label>
              <input
                type="checkbox"
                name="shuffleQuestions"
                checked={quizData.shuffleQuestions}
                onChange={handleChange}
              /> Shuffle Questions
            </Label>
          </InputGroup>

          <InputGroup>
            <Label>
              <input
                type="checkbox"
                name="shuffleOptions"
                checked={quizData.shuffleOptions}
                onChange={handleChange}
              /> Shuffle Options
            </Label>
          </InputGroup>

          <InputGroup>
            <Label>
              <input
                type="checkbox"
                name="showCorrectAnswers"
                checked={quizData.showCorrectAnswers}
                onChange={handleChange}
              /> Show Correct Answers
            </Label>
          </InputGroup>

          <ButtonGroup>
            <SecondaryButton type="button" onClick={onClose}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Quiz'}
            </PrimaryButton>
          </ButtonGroup>
        </Form>
      </ModalContainer>
    </ModalOverlay>
  );
}

export default EditQuizModal;