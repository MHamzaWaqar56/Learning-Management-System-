// import React from 'react';

// const PaymentSuccess = () => {
//   return (
//     <div style={{ textAlign : "center" }}>
//       <h1>Payment Successful!</h1>
//       <p>Thank you for your payment..</p>
//     </div>
//   );
// };

// export default PaymentSuccess;




///////////////////////////////////////////

// pages/PaymentSuccess.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import paymentApi from '../../APIs/paymentApi';
import styled from 'styled-components';

const Container = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  min-height: 100vh;
  background: linear-gradient(to right, #fdfcfb, #e2d1c3);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatusMessage = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  animation: fadeIn 0.8s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment');
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your payment...');

  console.log("payment id :", paymentId);

  useEffect(() => {
    const confirm = async () => {
      try {
        const result = await paymentApi.handleSuccessRedirect(paymentId);
        if (result.success) {
          setStatus('✅ Payment Successful! Redirecting to your course...');
          setTimeout(() => {
            navigate(`/user/course/${result.courseId}`);
          }, 3000);
        } else {
          setStatus(`⚠️ Payment status: ${result.status}`);
        }
      } catch (err) {
        setStatus('❌ Something went wrong while confirming payment');
      }
    };

    if (paymentId) {
      confirm();
    } else {
      setStatus('❌ Missing paymentId');
    }
  }, [paymentId, navigate]);

  return (
    <Container>
    <StatusMessage>Payment Successful...</StatusMessage>
      <StatusMessage>{status}</StatusMessage>
    </Container>
  );
};

export default PaymentSuccess;
