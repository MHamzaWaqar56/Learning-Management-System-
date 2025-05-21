import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// Styled Components
const Main = styled.main`
  height: 100vh;
  width: 100%;
  background-color: #1a2238;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const ErrorText = styled.h1`
  font-size: 9rem;
  font-weight: 800;
  color: white;
  letter-spacing: 0.1em;
  z-index: 1;
`;

const Badge = styled.div`
  background-color: black;
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  transform: rotate(12deg);
  position: absolute;
`;

const Button = styled.button`
  margin-top: 1.25rem;

  span {
    position: relative;
    display: block;
    padding: 0.75rem 2rem;
    background-color: #83773db6;
    color: white;
    border: 1px solid white;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: #a39259;
    }
  }
`;

function Denied() {
  const Navigate = useNavigate();

  return (
    <Main>
      <ErrorText>403</ErrorText>
      <Badge>Access denied</Badge>
      <Button onClick={() => Navigate(-1)}>
        <span>Go Back</span>
      </Button>
    </Main>
  );
}

export default Denied;
