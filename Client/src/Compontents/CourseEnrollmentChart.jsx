
// components/CourseEnrollmentChart.js
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import axios from "axios";
import styled from "styled-components";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Styled Components

const ChartContainer = styled.div`
  width: 80%;
  margin: 20px auto;
  padding: 20px;
  background-color: #f4f4f9;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TitleStyled = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
`;

const LoadingText = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  color: #007bff;
  text-align: center;
  margin-top: 50px;
`;

const CourseEnrollmentChart = () => {
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await axios.get(
        "http://localhost:5000/api/v1/admin/analysis/course-enrollment",
        { withCredentials: true }
      );
      console.log("Response chart 1:", response.data);
      const data = response.data;
      setAnalyticsData(data);
    };

    fetchAnalytics();
  }, []);

  if (!analyticsData) return <LoadingText>Loading...</LoadingText>;

  const { enrollmentsOverTime } = analyticsData;
  const dates = Object.keys(enrollmentsOverTime);
  const enrollments = Object.values(enrollmentsOverTime);

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Enrollments Over Time",
        data: enrollments,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
    ],
  };

  return (
    <ChartContainer>
      <TitleStyled>Course Enrollments Over Time</TitleStyled>
      <Line data={data} />
    </ChartContainer>
  );
};

export default CourseEnrollmentChart;
