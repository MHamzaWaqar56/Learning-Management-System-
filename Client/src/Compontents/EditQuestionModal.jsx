import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Modal, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const EditQuestionModal = ({ visible, question, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && question) {
      form.setFieldsValue({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || '',
        points: question.points || 1
      });
    }
  }, [visible, question, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const updatedQuestion = {
        question: values.question,
        options: values.options,
        correctAnswer: values.correctAnswer,
        explanation: values.explanation,
        points: values.points
      };

      onSubmit(updatedQuestion);
    } catch (error) {
      message.error('Please fill all required fields');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Question"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading}
          onClick={handleSubmit}
        >
          Save Changes
        </Button>,
      ]}
      width={700}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="question"
          label="Question Text"
          rules={[{ required: true, message: 'Please enter question text' }]}
        >
          <Input placeholder="Enter the question" />
        </Form.Item>

        <Form.List name="options">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Form.Item
                  {...restField}
                  key={key}
                  name={name}
                  rules={[{ required: true, message: 'Option cannot be empty' }]}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Input 
                      placeholder={`Option ${name + 1}`} 
                      style={{ flex: 1, marginRight: 8 }} 
                    />
                    {fields.length > 2 && (
                      <MinusCircleOutlined 
                        onClick={() => remove(name)} 
                        style={{ color: '#ff4d4f' }}
                      />
                    )}
                  </div>
                </Form.Item>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  style={{ width: '100%' }}
                >
                  Add Option
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item
          name="correctAnswer"
          label="Correct Answer"
          rules={[{ required: true, message: 'Please select correct answer' }]}
        >
          <Select placeholder="Select correct option">
            {form.getFieldValue('options')?.map((_, index) => (
              <Option key={index} value={index}>
                Option {index + 1}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="points"
          label="Points"
          rules={[{ required: true, message: 'Please enter points' }]}
        >
          <Input type="number" min={1} placeholder="Points for this question" />
        </Form.Item>

        <Form.Item
          name="explanation"
          label="Explanation (Optional)"
        >
          <TextArea 
            rows={3} 
            placeholder="Explanation for the correct answer" 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditQuestionModal;