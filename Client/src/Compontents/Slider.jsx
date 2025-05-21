
import { useState } from "react";
import styled from "styled-components";

import aqk from '../assets/Images/aqk.jpeg';
import BA from '../assets/Images/BA.jpeg';
import abse from '../assets/Images/abse.jpeg';
import abs from '../assets/Images/abs.jpeg';
import Jk from '../assets/Images/Jk.jpeg';

const SliderContainer = styled.div`
  background-color: #000;
  padding: 4rem 2rem;
  border-radius: 20px;
  max-width: 1100px;
  margin: 3rem auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
`;

const SlideWrapper = styled.div`
  text-align: center;
  padding: 2rem 1rem;
`;

const SlideImage = styled.img`
  width: 250px;
  height: 250px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 2rem;
  border: 5px solid #facc15;
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const SlideTitle = styled.h2`
  font-size: 2.2rem;
  color: #fff;
  margin-bottom: 1rem;
`;

const SlideContent = styled.p`
  font-size: 1.25rem;
  color: #e0e0e0;
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.7;
`;

const NavButton = styled.button`
  color: #facc15;
  border: 2px solid transparent;
  background-color: transparent;
  font-size: 2.5rem;
  padding: 0.2rem 1rem;
  margin: 0 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    color: #fff;
    background-color: #facc15;
    border-color: #facc15;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    padding: 0.2rem 0.8rem;
  }
`;

const NavigationWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  padding: 0 2rem;
  transform: translateY(-50%);
`;

const Slider = () => {
  const slides = [
    {
      title: "Dr Abdul Salam",
      content: "Nobel Prize-winning physicist (the first Pakistani to win a Nobel Prize in Science).",
      image: abs,
    },
    {
      title: "Dr Abdul Qadeer Khan",
      content: "You have to dream before your dreams can come true.",
      image: aqk,
    },
    {
      title: "Abdul Sattar Edhi",
      content: "Legendary philanthropist and humanitarian (founder of Edhi Foundation).",
      image: abse,
    },
    {
      title: "Jahangir Khan",
      content: "Squash legend, considered one of the greatest players of all time.",
      image: Jk,
    },
    {
      title: "Babar Azam",
      content: "Modern cricket legend, one of the world’s top batters.",
      image: BA,
    },
  ];

  const [index, setIndex] = useState(0);

  const prevSlide = () => {
    setIndex((index - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setIndex((index + 1) % slides.length);
  };

  return (
    <SliderContainer>
      <NavigationWrapper>
        <NavButton onClick={prevSlide}>⟨</NavButton>
        <NavButton onClick={nextSlide}>⟩</NavButton>
      </NavigationWrapper>

      <SlideWrapper>
        <SlideImage src={slides[index].image} alt={slides[index].title} />
        <SlideTitle>{slides[index].title}</SlideTitle>
        <SlideContent>{slides[index].content}</SlideContent>
      </SlideWrapper>
    </SliderContainer>
  );
};

export default Slider;
