import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Card = styled.div`
  color: white;
  width: 20rem;
  height: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  overflow: hidden;
  background-color: black;
  transition: transform 0.3s ease-in-out;
`;

const ImageContainer = styled.div`
  overflow: hidden;
`;

const Image = styled.img`
  height: 12rem;
  width: 100%;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  transition: transform 0.3s ease-in-out;

  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const Content = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #facc15; /* Tailwind yellow-500 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Paragraph = styled.p`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BoldText = styled.p`
  font-weight: 600;
  span {
    font-weight: bold;
    color: #facc15;
  }
`;

function CourseCard({ data }) {
  const navigate = useNavigate();

  return (
    <Card onClick={() => navigate("/course/description/", { state: { ...data } })}>
      <ImageContainer>
        <Image src={data.thumbnail} alt="course thumbnail" />
      </ImageContainer>
      <Content>
        <Title>{data.title}</Title>
        <Paragraph>
          {data.description}
        </Paragraph>
        <BoldText>
          <span>Category :</span> {data.category}
        </BoldText>
        <BoldText>
          <span>Instructor :</span> {data.instructor}
        </BoldText>
      </Content>
    </Card>
  );
}

export default CourseCard;
