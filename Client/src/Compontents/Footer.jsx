import styled from "styled-components";
import { BsFacebook, BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";
import { Link, NavLink } from "react-router-dom";
import { SiGoogletagmanager } from "react-icons/si";

const FooterContainer = styled.footer`
  background-color: black;
  color: white;
  padding: 2rem 1rem;
  text-align: center;
`;

const FooterHeading = styled.h4`
  font-size: 1.2rem;
  font-weight: bold;
`;

const FooterLinks = styled.div`
  margin-top: 1rem;
  a {
    color: #facc15; /* Tailwind yellow-500 */
    margin: 0 0.5rem;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const SocialIconsWrapper = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
`;

const IconLink = styled.a`
  color: white;
  font-size: 1.5rem;

  &:hover {
    color: #facc15;
  }
`;

const Copyright = styled.div`
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #d1d5db; /* Tailwind gray-300 */
`;

function Footer() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();

  return (
    <FooterContainer>
    <div style={{ display: "flex", paddingBottom : "10px" , justifyContent: "center" }}>  
    <NavLink
        style={{
          display: "flex",
          fontWeight: "600",
          justifyContent: "space-between",
          width: "160px",
        }}
        className="navbar-brand"
        to="/"
      >
      <div style={{ display: "flex", alignItems: "center" }}>
        <SiGoogletagmanager style={{ fontSize: "32px", color : "#facc15" }} />
        </div>
        <p style={{fontSize : "30px", margin : "0px"}}>FineTech</p>
      </NavLink>
      </div>
      <FooterHeading>All Rights Reserved {year} &copy; LMS</FooterHeading>

      <FooterLinks>
        <Link to="/about">About</Link>|<Link to="/contact">Contact</Link>|
        <Link to="/policy">Privacy Policy</Link>
      </FooterLinks>

      <SocialIconsWrapper>
        <IconLink
          href="#"
          target="_blank"
          rel="noreferrer"
        >
          <BsFacebook />
        </IconLink>
        <IconLink
          href="#"
          target="_blank"
          rel="noreferrer"
        >
          <BsInstagram />
        </IconLink>
        <IconLink
          href="#"
          target="_blank"
          rel="noreferrer"
        >
          <BsLinkedin />
        </IconLink>
        <IconLink href="#" target="_blank" rel="noreferrer">
          <BsTwitter />
        </IconLink>
      </SocialIconsWrapper>
    </FooterContainer>
  );
}

export default Footer;
