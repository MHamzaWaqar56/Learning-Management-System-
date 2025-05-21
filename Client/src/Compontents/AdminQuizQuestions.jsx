// components/QuizQuestions.jsx
import React from 'react';
import { Card, List, Typography, Tag } from 'antd';

const { Title, Text } = Typography;

const AdminQuizQuestions = ({ questions }) => {
  return (
    <Card title={<Title level={4}>Quiz Questions ({questions.length})</Title>}>
      <List
        itemLayout="vertical"
        dataSource={questions}
        renderItem={(question, index) => (
          <List.Item key={question._id}>
            <List.Item.Meta
              title={`Q${index + 1}: ${question.question}`}
              description={
                <>
                  <div style={{ margin: '12px 0' }}>
                    <Text strong>Options:</Text>
                    <div style={{ marginTop: 8 }}>
                      {question.options.map((option, i) => (
                        <div key={i} style={{ marginBottom: 4 }}>
                          {i === question.correctAnswer ? (
                            <Tag color="green">{option} (Correct Answer)</Tag>
                          ) : (
                            <Text>{option}</Text>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {question.explanation && (
                    <div style={{ marginTop: 8 }}>
                      <Text strong>Explanation: </Text>
                      <Text>{question.explanation}</Text>
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Points: </Text>
                    <Text>{question.points}</Text>
                  </div>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default AdminQuizQuestions;