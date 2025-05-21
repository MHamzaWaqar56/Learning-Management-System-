

import React from 'react';
import { Modal, Typography, Button, List, Tag, Divider } from 'antd';

const { Title, Text } = Typography;

const QuizResultModal = ({ 
  visible, 
  score, 
  passingScore, 
  onClose, 
  questions, 
  selectedAnswers,
  certificateEarned 
}) => {
  const passed = score >= passingScore;
  const correctCount = questions.filter(
    q => selectedAnswers[q._id] === q.correctAnswer
  ).length;

  return (
    <Modal
      title="Quiz Results"
      visible={visible}
      footer={null}
      onCancel={onClose}
      width={800}
      centered
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ color: passed ? '#52c41a' : '#ff4d4f' }}>
          {passed ? 'Congratulations! You passed!' : 'Quiz Failed'}
        </Title>
        <Text strong style={{ fontSize: '18px' }}>
          Your Score: {score.toFixed(2)}% ({correctCount}/{questions.length} correct)
        </Text>
        <br />
        <Text>Passing Score: {passingScore}%</Text>
        {certificateEarned && (
          <div style={{ marginTop: '16px' }}>
            <Tag color="green">Certificate Earned!</Tag>
          </div>
        )}
      </div>
      
      <Divider>Question Review</Divider>
      
      <List
        itemLayout="vertical"
        dataSource={questions}
        renderItem={(question, index) => {
          const userAnswer = selectedAnswers[question._id];
          const isCorrect = userAnswer === question.correctAnswer;

          return (
            <List.Item key={question._id}>
              <List.Item.Meta
                title={`Q${index + 1}: ${question.question}`}
                description={
                  <>
                    <Text>
                      Your answer: <Text strong>{question.options[userAnswer]}</Text>
                    </Text>
                    <br />
                    <Text>
                      Correct answer: <Text strong>{question.options[question.correctAnswer]}</Text>
                    </Text>
                    {question.explanation && (
                      <>
                        <br />
                        <Text type="secondary">Explanation: {question.explanation}</Text>
                      </>
                    )}
                    <div style={{ marginTop: '8px' }}>
                      <Tag color={isCorrect ? 'green' : 'red'}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </Tag>
                    </div>
                  </>
                }
              />
            </List.Item>
          );
        }}
      />
      
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button type="primary" size="large" onClick={onClose}>
          Return to Course
        </Button>
      </div>
    </Modal>
  );
};

export default QuizResultModal;