

// components/StudentProgressChart.js
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";
import styled from "styled-components";

ChartJS.register(ArcElement, Tooltip, Legend);

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

const StudentProgressChart = () => {
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await axios.get(
        "http://localhost:5000/api/v1/admin/analysis/student-progress",
        { withCredentials: true }
      );
      const data = response.data;
      console.log("Response Chart 2:", data);
      setAnalyticsData(data);
    };

    fetchAnalytics();
  }, []);

  if (!analyticsData) return <LoadingText>Loading...</LoadingText>;

  const { dropOffStats } = analyticsData;

  const data = {
    labels: ["0-25%", "25-50%", "50-75%", "75-99%", "100%"],
    datasets: [
      {
        data: [
          dropOffStats["0-25"],
          dropOffStats["25-50"],
          dropOffStats["50-75"],
          dropOffStats["75-99"],
          dropOffStats["100"],
        ],
        backgroundColor: [
          "#ff5733", "#ffbd33", "#75a3a3", "#33cc33", "#3385ff",
        ],
      },
    ],
  };

  return (
    <ChartContainer>
      <TitleStyled>Student Progress Distribution</TitleStyled>
      <Pie data={data} />
    </ChartContainer>
  );
};

export default StudentProgressChart;
