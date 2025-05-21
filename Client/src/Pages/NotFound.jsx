import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1a2238;
  flex-direction: column;
`;

const Heading = styled.h1`
  font-size: 9rem;
  font-weight: 800;
  color: white;
  letter-spacing: 0.2rem;
`;

const Message = styled.div`
  background-color: black;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  position: absolute;
  transform: rotate(-12deg);
  border-radius: 0.25rem;
`;

const ButtonWrapper = styled.button`
  margin-top: 1.25rem;
`;

const GoBackButton = styled.span`
  display: block;
  padding: 0.75rem 2rem;
  background-color: #1a2238;
  color: #ff6a3d;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid currentColor;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background-color: #ff6a3d;
    color: white;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 106, 61, 0.5);
  }
`;

function NotFound() {
  const navigate = useNavigate();

  return (
    <Container>
      <Heading>404</Heading>
      <Message>Page not found ...</Message>
      <ButtonWrapper>
        <GoBackButton onClick={() => navigate(-1)}>Go Back</GoBackButton>
      </ButtonWrapper>
    </Container>
  );
}

export default NotFound;
