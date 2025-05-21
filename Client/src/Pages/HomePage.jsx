
import styled from "styled-components";
import Header from "../Compontents/Header";
import Footer from "../Compontents/Footer";
import Slider from "../Compontents/Slider";
import ContactComponent from "../Compontents/ContactComponent";
import CoursesLectures from "../Compontents/CoursesLectures";
import HeroSection from "../Compontents/HeroSection";

// Styled Components

const Heading = styled.h1`
  font-size: 2.25rem;
  font-weight: 600;
  color: black;

  @media (min-width: 640px) {
    font-size: 3rem;
  }

  span {
    color: #facc15;
    font-weight: 700;
  }
`;



const CourseListWrapper = styled.div`
  min-height: 90vh;
  padding-top: 3rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  color: white;
`;

function HomePage() {
  return (
    <>
    <Header />

      <HeroSection />

      <CourseListWrapper style={{ backgroundColor: "#f5f5f5"}}>

      <Heading style={{textAlign: "center"}}>
                Explore the course made by <span>Industry experts</span>
              </Heading>
      
              <CoursesLectures />

        </CourseListWrapper>        
  
        <Slider />
        <ContactComponent />
        <Footer />
      </>

  );
}

export default HomePage;
