import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spin, Alert, Card, Divider, Typography } from "antd";
import { ArrowLeftOutlined, CheckOutlined, LockOutlined } from "@ant-design/icons";
import styled from "styled-components";
import courseApi from "../../APIs/CourseApi";
// import paymentApi from "../../APIs/paymentApi";
import FormatPrice from "../../Helper/FormatPrice";
import paymentApi from "../../APIs/paymentApi";

const { Title, Text } = Typography;

// Styled Components
const CheckoutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 80vh;
`;

const BackButton = styled(Button)`
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CheckoutTitle = styled(Title)`
  text-align: center;
  margin-bottom: 2rem !important;
  color: #2c3e50 !important;
`;

const CheckoutContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: none;
`;

const CourseTitle = styled(Title)`
  margin-bottom: 0.5rem !important;
  color: #34495e !important;
`;

const CourseCategory = styled(Text)`
  display: inline-block;
  background: #f8f9fa;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #7f8c8d;
`;

const PriceSection = styled.div`
  margin: 1.5rem 0;
`;

const OriginalPrice = styled(Text)`
  font-size: 1rem;
  margin-right: 0.75rem;
  color: #95a5a6 !important;
`;

const DiscountAmount = styled(Text)`
  font-size: 1rem;
  color: #e74c3c !important;
  font-weight: 500;
`;

const FinalPrice = styled(Title)`
  color: #3498db !important;
  margin: 1rem 0 !important;
`;

const DiscountExpiry = styled(Text)`
  display: block;
  font-size: 0.8rem;
  color: #95a5a6;
  margin-top: 0.5rem;
`;

const PayNowButton = styled(Button)`
  width: 100%;
  height: 50px;
  font-size: 1rem;
  margin-bottom: 1rem;
  background-color: #3498db;
  border: none;
  transition: all 0.3s;

  &:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
  }
`;

const SecurePaymentNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const CheckoutFooter = styled.div`
  margin-top: 3rem;
  text-align: center;
  padding: 1.5rem;
  border-top: 1px solid #ecf0f1;
  color: #95a5a6;
  font-size: 0.9rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
`;

function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseApi.getCourseById(courseId);
        setCourse(res);
      } catch (err) {
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handlePayment = async () => {
    setProcessingPayment(true);
    setError(null);
    
    try {
      const { url } = await paymentApi.initiatePayment(courseId);
      window.location.href = url;
    } catch (err) {
      setError(err.message || "Payment initiation failed");
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spin size="large" />
        <Text>Loading course details...</Text>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <CheckoutContainer>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button 
              type="primary" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        />
      </CheckoutContainer>
    );
  }

  if (!course) {
    return (
      <CheckoutContainer>
        <Alert
          message="Course not found"
          description="The requested course could not be loaded."
          type="warning"
          showIcon
        />
      </CheckoutContainer>
    );
  }

  const hasDiscount = course.discount?.amount > 0 && 
    (!course.discount.expiresAt || new Date(course.discount.expiresAt) > new Date());

  const finalPrice = hasDiscount 
    ? course.price - course.discount.amount
    : course.price;

  return (
    <CheckoutContainer>
      <BackButton 
        type="text" 
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
      >
        Back to Course
      </BackButton>

      <CheckoutTitle level={2}>Checkout</CheckoutTitle>
      
      <CheckoutContent>
        <StyledCard>
          <CourseTitle level={4}>{course.title}</CourseTitle>
          <CourseCategory>{course.category}</CourseCategory>
          
          <Divider />
          
          <PriceSection>
            {hasDiscount && (
              <>
                <OriginalPrice delete>
                  <FormatPrice price={course.price} />
                </OriginalPrice>
                <DiscountAmount strong>
                  - <FormatPrice price={course.discount.amount} />
                </DiscountAmount>
              </>
            )}
            <FinalPrice level={3}>
              <FormatPrice price={finalPrice} />
            </FinalPrice>
            {hasDiscount && course.discount.expiresAt && (
              <DiscountExpiry type="secondary">
                Offer ends: {new Date(course.discount.expiresAt).toLocaleDateString()}
              </DiscountExpiry>
            )}
          </PriceSection>
        </StyledCard>

        <StyledCard>
          <Title level={4}>Payment Method</Title>
          <Divider />
          
          <div>
            <PayNowButton 
              type="primary" 
              size="large" 
              icon={<CheckOutlined />}
              onClick={handlePayment}
              loading={processingPayment}
            >
              {processingPayment ? 'Processing...' : 'Pay Now'}
            </PayNowButton>
            
            <SecurePaymentNote>
              <LockOutlined />
              All payments are secure and encrypted
            </SecurePaymentNote>
          </div>
        </StyledCard>
      </CheckoutContent>

      <CheckoutFooter>
        By completing your purchase, you agree to our Terms of Service and Privacy Policy.
      </CheckoutFooter>
    </CheckoutContainer>
  );
}

export default Checkout;