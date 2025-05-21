
import styled from 'styled-components';
import { Progress, Button } from 'antd';
import useCourseProgress from '../Compontents/useCourseProgress';
import { useNavigate } from 'react-router-dom';
import CertificateDownloadButton from '../Compontents/CertificateButton';

const ProgressContainer = styled.div`
  background: #fff;
  margin-top : 10px;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ProgressHeader = styled.h3`
  margin-bottom: 15px;
  color: #333;
`;

const ProgressBarContainer = styled.div`
  margin-bottom: 15px;
`;

const ProgressDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
`;

const CompleteButton = styled(Button)`
  width: 100%;
  margin-top: 10px;
`;

const QuizButton = styled(Button)`
  width: 100%;
  margin-top: 10px;
  background-color: #1890ff;
  color: white;
  border-radius : 4px;
  
  &:hover {
    background-color: #40a9ff;
    color: white;
  }
`;

const CertificateBadge = styled.div`
  width: 100%;
  margin-top: 10px;
  cursor: pointer;
  padding: 8px;
  background-color: #52c41a;
  color: white;
  text-align: center;
  border-radius: 4px;
  font-weight: bold;
`;

const CourseProgress = ({ courseId }) => {
  
    const { progress, loading, error } = useCourseProgress(courseId);
    const navigate = useNavigate();

    const handleQuizClick = () => {
        navigate(`/user/courses/${courseId}/attempt-quiz`);
    };

  const certificateId = progress?.certificate?.certificateId;

    if (loading) return <div>Loading progress...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!progress) return null;

    return (
        <ProgressContainer>
            <ProgressHeader>Your Progress</ProgressHeader>
            
            <ProgressBarContainer>
                <Progress 
                    percent={progress.completionPercentage} 
                    status="active" 
                    strokeColor="#52c41a"
                />
            </ProgressBarContainer>
            
            <ProgressDetails>
                <span>{progress.completedLessons} of {progress.totalLessons} lessons completed</span>
                <span>{progress.completionPercentage}%</span>
            </ProgressDetails>

            {progress.canAttemptQuiz &&  !progress?.certificate?.issued && (
                <QuizButton 
                    type="primary"
                    onClick={handleQuizClick}
                >
                    Take Final Quiz
                </QuizButton>
            )}
            {progress?.passedQuiz &&(
            <CertificateDownloadButton certificateId={certificateId} />
    )}
        </ProgressContainer>
    );
};

export default CourseProgress;


