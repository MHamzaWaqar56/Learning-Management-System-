import styled from "styled-components";
import { useState } from "react";
import axios from "axios";

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  backdrop-filter: blur(12px);
  background-color: rgba(0, 0, 0, 0.65);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 500px;
  color: #fff;
  transition: all 0.3s ease;

  h1 {
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1rem;
    color: #facc15;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 1rem;
    font-weight: 600;
    color: #facc15;
  }

  input,
  textarea {
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: none;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    outline: none;
    transition: 0.3s;

    &::placeholder {
      color: #ccc;
    }

    &:focus {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0 0 0 2px #facc15;
    }
  }

  textarea {
    resize: none;
    min-height: 150px;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #ca8a04;
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #facc15;
    color: black;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

function ContactComponent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMsg("");

    try {
      const response = await axios.post("http://localhost:5000/api/v1/contact/email", formData, {
        withCredentials: true
      });
      setResponseMsg("Email sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending email:", error);
      setResponseMsg("Failed to send email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <StyledForm noValidate onSubmit={handleSubmit}>
        <h1>Contact Us</h1>

        <InputGroup>
          <label htmlFor="name">Your Name</label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Enter your name..."
            value={formData.name}
            onChange={handleChange}
            required
          />
        </InputGroup>

        <InputGroup>
          <label htmlFor="email">Your Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email..."
            value={formData.email}
            onChange={handleChange}
            required
          />
        </InputGroup>

        <InputGroup>
          <label htmlFor="message">Your Message</label>
          <textarea
            name="message"
            id="message"
            placeholder="Enter your message..."
            value={formData.message}
            onChange={handleChange}
            required
          />
        </InputGroup>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? "Sending..." : "Submit"}
        </SubmitButton>

        {responseMsg && (
          <p
            style={{
              color: responseMsg.includes("success") ? "lime" : "red",
              textAlign: "center",
              fontWeight: "bold"
            }}
          >
            {responseMsg}
          </p>
        )}
      </StyledForm>
    </Wrapper>
  );
}

export default ContactComponent;


