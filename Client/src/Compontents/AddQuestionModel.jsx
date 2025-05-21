import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Space, Select, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import quizApi from '../APIs/QuizApi';
import styled from 'styled-components';
import FixedModal from './FixedModel';

const { TextArea } = Input;
const { Option } = Select;

// Styled components remain the same...
const ModalContent = styled.div`
  padding: 24px;
  max-height: 80vh;
  overflow-y: auto;
`;

const FormTitle = styled.h2`
  margin-bottom: 24px;
  font-size: 1.5rem;
  color: #343a40;
  font-weight: 600;
`;

const QuestionContainer = styled.div`
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const QuestionTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: #495057;
`;

const RemoveButton = styled(MinusCircleOutlined)`
  color: #dc3545;
  font-size: 16px;
  cursor: pointer;
  
  &:hover {
    color: #c82333;
  }
`;

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 16px;
  
  .ant-form-item-label {
    font-weight: 500;
    padding-bottom: 4px;
  }
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const OptionInput = styled(Input)`
  flex: 1;
`;

const AddOptionButton = styled(Button).attrs({
  type: 'dashed',
  icon: <PlusOutlined />
})`
  width: 100%;
  margin-top: 8px;
`;

const AddQuestionButton = styled(Button).attrs({
  type: 'dashed',
  icon: <PlusOutlined />,
  block: true
})`
  margin-top: 16px;
  margin-bottom: 8px;
`;

const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const CancelButton = styled(Button)`
  min-width: 100px;
`;

const SubmitButton = styled(Button).attrs({
  type: 'primary'
})`
  min-width: 120px;
  background-color: #28a745;
  border-color: #28a745;
  
  &:hover {
    background-color: #218838;
    border-color: #1e7e34;
  }
`;



// Extracted question form
const QuestionFormItem = ({ field, remove, form }) => {
  const options = Form.useWatch(['questions', field.name, 'options'], form);

  return (
    <QuestionContainer key={field.key}>
      <QuestionHeader>
        <QuestionTitle>Question #{field.name + 1}</QuestionTitle>
        <RemoveButton onClick={() => remove(field.name)} />
      </QuestionHeader>

      <StyledFormItem
        name={[field.name, 'question']}
        label="Question Text"
        rules={[{ required: true, message: 'Please enter question text' }]}
      >
        <Input placeholder="Enter the question" />
      </StyledFormItem>

      <StyledFormItem
        label="Options"
        required
      >
        <Form.List name={[field.name, 'options']}>
          {(optionsFields, optionsOperations) => (
            <>
              {optionsFields.map((opt) => (
                <StyledFormItem
                  key={opt.key}
                  name={opt.name}
                  rules={[{ required: true, message: 'Option cannot be empty' }]}
                >
                  <OptionRow>
                    <OptionInput placeholder={`Option ${opt.name + 1}`} />
                    {opt.name >= 2 && (
                      <MinusCircleOutlined
                        onClick={() => optionsOperations.remove(opt.name)}
                        style={{ color: '#dc3545', cursor: 'pointer' }}
                      />
                    )}
                  </OptionRow>
                </StyledFormItem>
              ))}
              <AddOptionButton onClick={() => optionsOperations.add()}>
                Add Option
              </AddOptionButton>
            </>
          )}
        </Form.List>
      </StyledFormItem>

      <StyledFormItem
        name={[field.name, 'correctAnswer']}
        label="Correct Answer"
        rules={[{ required: true, message: 'Please select correct answer' }]}
      >
        <Select placeholder="Select correct option">
          {options?.map((_, index) => (
            <Option key={index} value={index}>
              Option {index + 1}
            </Option>
          ))}
        </Select>
      </StyledFormItem>

      <StyledFormItem
        name={[field.name, 'explanation']}
        label="Explanation (Optional)"
      >
        <TextArea rows={2} placeholder="Explanation for the correct answer" />
      </StyledFormItem>
    </QuestionContainer>
  );
};

const AddQuestionsModal = ({ quiz, visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const token = localStorage.getItem('token');

      const newQuestions = values.questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ''
      }));

      const updatedQuiz = await quizApi.addQuestions(quiz._id, newQuestions, token);

      message.success('Questions added successfully!');
      onSuccess(updatedQuiz);
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to add questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FixedModal visible={visible} onClose={onClose}>
      <ModalContent>
        <FormTitle>Add New Questions</FormTitle>

        <Form form={form} layout="vertical">
          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(field => (
                  <QuestionFormItem
                    key={field.key}
                    field={field}
                    remove={remove}
                    form={form}
                  />
                ))}

                <AddQuestionButton onClick={() => add()}>
                  Add Question
                </AddQuestionButton>
              </>
            )}
          </Form.List>
        </Form>

        <FormFooter>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SubmitButton loading={loading} onClick={handleSubmit}>Add Questions</SubmitButton>
        </FormFooter>
      </ModalContent>
    </FixedModal>
  );
};

export default AddQuestionsModal;

