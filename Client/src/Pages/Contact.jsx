import styled from "styled-components";
import Header from "../Compontents/Header";
import Footer from "../Compontents/Footer";
import ContactComponent from "../Compontents/ContactComponent";

// Styled Components
const Wrapper = styled.div`
  height: 100%;

  @media (min-width: 768px) {
    height: 100%;
  }
`;


function Contact() {
  
  return (
    <><Header />
      <Wrapper>
      
       <ContactComponent />
        
      </Wrapper>
      <Footer />
      </>
  );
}

export default Contact;
