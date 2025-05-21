
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import enrollmentApi from '../APIs/EnrolledCourse';
import { Modal } from 'antd';

// Animation for the loading spinner
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled components
const EnrollButton = styled.button`
  position: relative;
  padding: 12px 24px;
  background-color: ${props => 
    props.$isEnrolled ? '#3b82f6' : 
    props.disabled ? '#94d3a2' : '#10b981'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  overflow: hidden;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top : 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${props => 
      props.$isEnrolled ? '#2563eb' : 
      props.disabled ? '#94d3a2' : '#059669'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 6px 8px rgba(0, 0, 0, 0.15)'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 1s ease-in-out infinite;
`;

const ButtonText = styled.span`
  position: relative;
  z-index: 1;
`;

const EnrollmentButton = ({ courseId, onEnrollSuccess, showLoginModal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  // Check enrollment status when component mounts
  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const status = await enrollmentApi.checkEnrollment(courseId);
        setIsEnrolled(status);
        if (status && onEnrollSuccess) {
          onEnrollSuccess();
        }
      } catch (error) {
        console.error('Error checking enrollment:', error);
      }
    };
    checkEnrollment();
  }, [courseId, onEnrollSuccess]);

  const handleEnroll = async () => {
    if (isEnrolled) return;
    
    setIsLoading(true);
    try {
      await enrollmentApi.enrollUser(courseId);
      setIsEnrolled(true);
      if (onEnrollSuccess) {
        onEnrollSuccess();
      }
    } catch (error) {
        console.log('Enrollment Error Details :', error.message);
      if (error.message === "User is not authenticated." || 
        (error.response && error.response.status === 401)) {
        // Unauthorized - show login modal
        if (showLoginModal) {
          showLoginModal();
        } else {
          setLoginModalVisible(true);
        }
      } else {
        console.error('Enrollment failed:', error);
        // Handle other errors if needed
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    setLoginModalVisible(false);
    // You can add navigation to login page here if needed
  };

  return (
    <>
      <EnrollButton 
        onClick={handleEnroll}
        disabled={isLoading || isEnrolled}
        aria-busy={isLoading}
        $isEnrolled={isEnrolled}
      >
        {isLoading ? (
          <>
            <Spinner />
            <ButtonText>Enrolling</ButtonText>
          </>
        ) : isEnrolled ? (
          <ButtonText>✓ Enrolled</ButtonText>
        ) : (
          <ButtonText>Enroll Now</ButtonText>
        )}
      </EnrollButton>

      <Modal
        title="Login Required"
        visible={loginModalVisible}
        onOk={handleLoginRedirect}
        onCancel={() => setLoginModalVisible(false)}
        okText="Login"
        cancelText="Cancel"
      >
        <p>You need to login first to enroll in this course.</p>
      </Modal>
    </>
  );
};

export default EnrollmentButton;
