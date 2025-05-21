import styled from "styled-components";
import aboutMainImage from "../Assets/Images/aboutMainImage.png";
import Slider from "../Compontents/Slider";
import Header from "../Compontents/Header";
import Footer from "../Compontents/Footer";

// Styled Components
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 90vh;
  color: white;
  padding-left: 0;
  
  
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin: 0 2.5rem;
  align-items: center;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const TextSection = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;

  @media (min-width: 1024px) {
    width: 50%;
  }
`;

const Heading = styled.h1`
  font-size: 3rem;
  color: #eab308;
  font-weight: 600;
`;

const Paragraph = styled.p`
  font-size: 1.25rem;
  color: black;
`;

const ImageWrapper = styled.div`
  width: 100%;

  @media (min-width: 1024px) {
    width: 50%;
  }

  img {
    width: 100%;
    filter: drop-shadow(0px 10px 10px rgb(0, 0, 0));
  }
`;

const CarouselWrapper = styled.div`
  width: 80vw;
  margin: 4rem auto 4rem auto;

  @media (min-width: 1024px) {
    width: 50%;
  }
`;

function AboutUs() {
  return (
    
      <Wrapper>
      <Header />
        <TopSection>
          <TextSection>
            <Heading>Affordable and quality education</Heading>
            <Paragraph>
              Our goal is to provide affordable quality education to the world. We are
              providing the platform for the aspiring teachers and students to share
              their skills, creativity, and knowledge to empower and contribute to the
              growth and wellness of mankind.
            </Paragraph>
          </TextSection>

          <ImageWrapper>
            <img
              id="test1"
              src={aboutMainImage}
              alt="about main image"
            />
          </ImageWrapper>
        </TopSection>

        <Slider />
        <Footer />
      </Wrapper>
  );
}

export default AboutUs;
