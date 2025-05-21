import styled from "styled-components";
import Footer from "../Compontents/Footer";
import Header from "../Compontents/Header";

const Container = styled.div`
  max-width: 1100px;
  margin: 40px auto;
  padding: 3rem 1rem;
  background-color: #f9fafb;
  color: #1f2937;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Heading = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;

  &::after {
    content: "";
    display: block;
    width: 80px;
    height: 4px;
    background: #facc15;
    margin: 0.5rem auto 0;
    border-radius: 2px;
  }
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SubHeading = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2563eb;
`;

const Paragraph = styled.p`
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 1rem;
  color: #374151;
`;

function PrivacyPolicy() {
  return (

    <>

    <Header />

    <Container>
      <Heading>Privacy Policy</Heading>

      <Section>
        <SubHeading>1. Introduction</SubHeading>
        <Paragraph>
          Welcome to our Learning Management System (LMS). We are committed to protecting
          your personal information and ensuring your online learning experience is secure
          and transparent. This Privacy Policy explains how we collect, use, and protect your
          information when you use our platform.
        </Paragraph>
      </Section>

      <Section>
        <SubHeading>2. Information We Collect</SubHeading>
        <Paragraph>
          When you register and use the LMS, we collect information such as your name, email,
          profile details, enrolled courses, completed lessons, and any feedback or messages
          you share through the platform.
        </Paragraph>
      </Section>

      <Section>
        <SubHeading>3. How We Use Your Information</SubHeading>
        <Paragraph>
          We use your data to personalize your learning journey, track your course progress,
          improve our educational content, send course updates, provide support, and ensure
          system security.
        </Paragraph>
      </Section>

      <Section>
        <SubHeading>4. Data Sharing</SubHeading>
        <Paragraph>
          Your data is never sold. We only share it with trusted service providers (e.g., for
          hosting or analytics) and only when necessary for the platform’s operations, under
          strict confidentiality agreements.
        </Paragraph>
      </Section>

      <Section>
        <SubHeading>5. User Control & Rights</SubHeading>
        <Paragraph>
          You can view, update, or delete your profile information at any time through your
          account settings. You may also request account deletion or data export by contacting
          our support team.
        </Paragraph>
      </Section>

      <Section>
        <SubHeading>6. Cookies & Tracking</SubHeading>
        <Paragraph>
          We use cookies to remember your login, enhance performance, and analyze how users
          interact with our courses. You can manage cookie preferences in your browser settings.
        </Paragraph>
      </Section>

      <Section>
        <SubHeading>7. Data Security</SubHeading>
        <Paragraph>
          We implement strong security measures such as encryption and secure authentication
          protocols to protect your data from unauthorized access, alteration, or disclosure.
        </Paragraph>
      </Section>

      <Section>
        <SubHeading>8. Updates to This Policy</SubHeading>
        <Paragraph>
          We may update this policy to reflect changes in our practices or legal requirements.
          We will notify you of significant updates through email or the LMS dashboard.
        </Paragraph>
      </Section>

      <Section>
        <SubHeading>9. Contact Us</SubHeading>
        <Paragraph>
          If you have any questions about this policy or how your data is handled, feel free
          to contact us at support@lms-platform.com.
        </Paragraph>
      </Section>
    </Container>

    <Footer />
    </>
  );
}

export default PrivacyPolicy;
