// src/components/HeroSection.jsx

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import homeimg from '../assets/Images/homePageMainImage.png'; // Update path as per your project
// import { YellowButton, OutlineButton } from './Buttons'; // Assuming you already have these

const Container = styled.section`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 4rem 6%;
  background-color: #fefefe;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 3rem 5%;
  }
`;

const OutlineButton = styled.button`
  padding: 0.75rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1.125rem;
  cursor: pointer;
  border: 1px solid #facc15;
  color: black;
  background-color: transparent;
  transition: all 0.3s ease-in-out;

  &:hover {
    background-color: #facc15;
    color: white;
  }
`;

const YellowButton = styled.button`
  background-color: #facc15;
  padding: 0.75rem 1.25rem;
  border-radius: 0.375rem;
  color : white;
  border-color:  #facc15; 
  font-weight: 600;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    background-color: #eab308;
  }
`;

const TextSection = styled.div`
  flex: 1;
  max-width: 600px;
`;

const Heading = styled.h1`
  font-size: 3rem;
  line-height: 1.2;
  font-weight: 800;
  color: #222;

  span {
    color: #ffb400;
  }

  @media (max-width: 768px) {
    font-size: 2.25rem;
  }
`;

const Paragraph = styled.p`
  font-size: 1.125rem;
  color: #555;
  margin: 1.5rem 0;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;

  img {
    max-width: 100%;
    height: auto;
  }

  @media (max-width: 768px) {
    margin-top: 2rem;
  }
`;

const HeroSection = () => {
  return (
    <Container>
      <TextSection>
        <Heading>
          Find out best <span>Online Courses</span>
        </Heading>
        <Paragraph>
          We have a large library of courses taught by highly skilled and qualified faculties at a very affordable rate.
        </Paragraph>
        <ButtonGroup>
          <Link to="/user/courses">
            <YellowButton>Explore courses</YellowButton>
          </Link>
          <Link to="/contact">
            <OutlineButton>Contact Us</OutlineButton>
          </Link>
        </ButtonGroup>
      </TextSection>

      <ImageContainer>
        <img src={homeimg} alt="homepage" />
      </ImageContainer>
    </Container>
  );
};

export default HeroSection;
