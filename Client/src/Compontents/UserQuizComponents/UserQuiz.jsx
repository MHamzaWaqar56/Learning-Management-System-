

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Radio, Space, Typography, message, Progress, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import quizApi from '../../APIs/QuizApi';
import QuizResultModal from './QuizResultModel';
import certificateApi from '../../APIs/CertificateAPI';

const { Title, Text } = Typography;

const UserQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  console.log("USER QUIZ :", quiz);



  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizApi.getUserQuiz(courseId);

        setQuiz({
            ...response.quiz,
            questions: response.quiz.questions // already limited to 15
        });


        // setQuiz(response.quiz);
        setTimeLeft(response.quiz.timeLimit * 60);
      } catch (error) {
        message.error(error.response?.data?.message || 'Failed to load quiz');

        const msg = error.response?.data?.message;

        if (msg === "Quiz not available" || error.response?.status === 404) {
          // Just don't navigate, and show the message in UI
          setQuiz(null);
        } else {
          message.error(msg || 'Failed to load quiz');
          navigate(`/user/courses`);
        }

      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId, navigate]);

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && !showResult) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && quizStarted) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, showResult]);

  const handleAnswerSelect = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNext = () => {
    if (selectedAnswers[quiz.questions[currentQuestionIndex]._id] === undefined) {
      message.warning('Please select an answer before proceeding');
      return;
    }
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      console.log("Submitting :", submitting);
      // Verify all shown questions are answered
      
      const unansweredQuestions = quiz.questions.filter(
        question => selectedAnswers[question._id] === undefined
      );
      
      if (unansweredQuestions.length > 0) {
        message.error(`Please answer all questions (${unansweredQuestions.length} remaining)`);
        setSubmitting(false);
        return;
      }

      const result = await quizApi.submitQuizResults(
        courseId,
        quiz._id,
        {
          answers: selectedAnswers,
          timeTaken: quiz.timeLimit * 60 - timeLeft
        }
      );


if (result.score >= quiz.passingScore) {
    await certificateApi.generateCertificate(courseId);
  }

      setResultData(result);
      setShowResult(true);
      
    } catch (error) {
      console.error("Submission Error:", error);
      message.error(error.response?.data?.message || 'Failed to submit quiz results');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <Text>Loading quiz...</Text>
      </div>
    );
  }

  if (!quiz || quiz === null || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="danger" strong style={{ fontSize: '18px' }}>
          Quiz is not available
        </Text>
      </div>
    );
  }
  

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {!quizStarted ? (
        <Card title={quiz.title} style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <Title level={4}>Quiz Instructions</Title>
            <Text>
              This quiz contains {quiz.questions.length} questions with a time limit of {quiz.timeLimit} minutes.
              You must score at least {quiz.passingScore}% to pass.
            </Text>
          </div>
          <Button 
            type="primary" 
            size="large"
            onClick={() => setQuizStarted(true)}
          >
            Start Quiz
          </Button>
        </Card>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Text strong>Time Remaining: {formatTime(timeLeft)}</Text>
            <Text>Question {currentQuestionIndex + 1} of {quiz.questions.length}</Text>
            <Text>Answered: {Object.keys(selectedAnswers).length}/{quiz.questions.length}</Text>
          </div>
          
          <Progress percent={progress} status="active" />
          
          <Card style={{ marginTop: '16px' }}>
            <Title level={4}>{currentQuestion.question}</Title>
            
            <Radio.Group
              onChange={(e) => handleAnswerSelect(currentQuestion._id, e.target.value)}
              value={selectedAnswers[currentQuestion._id]}
              style={{ display: 'block', marginTop: '16px' }}
            >
              <Space direction="vertical">
                {currentQuestion.options.map((option, index) => (
                  <Radio key={index} value={index}>
                    {option}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
            
            {selectedAnswers[currentQuestion._id] === undefined && (
              <Text type="warning" style={{ display: 'block', marginTop: 8 }}>
                Please select an answer to continue
              </Text>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <Button onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                Previous
              </Button>
              
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <Button 
                  type="primary" 
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestion._id] === undefined}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  danger
                  onClick={handleSubmit}
                  loading={submitting}
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </Card>
        </>
      )}
      
      {resultData && (
        <QuizResultModal
          visible={showResult}
          score={resultData.score}
          passingScore={quiz.passingScore}
          onClose={() => navigate(`/user/courses`)}
          questions={quiz.questions}
          selectedAnswers={selectedAnswers}
          certificateEarned={resultData.certificateEarned}
        />
      )}
    </div>
  );
};

export default UserQuiz;



