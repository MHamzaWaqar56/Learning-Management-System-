
import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Container = styled.div`
  padding: 24px;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
`;

const GridWrapper = styled.div`
  display: grid;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const SummaryGrid = styled.div`
  display: grid;
  gap: 16px;
  text-align: center;
  padding-top: 30px;
  grid-template-columns: repeat(2, 1fr);

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const Box = styled.div`
  padding: 16px;
  border-radius: 0.75rem;
  background-color: ${(props) => props.bg || "#f0f0f0"};
`;

const BoxTitle = styled.h4`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const BoxValue = styled.p`
  font-size: 1.25rem;
  font-weight: 500;
`;

const UserAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAnalysis = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/v1/admin/analysis/users", {
          withCredentials: true,
        });
        setAnalysis(data.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user analysis", error);
      }
    };

    fetchUserAnalysis();
  }, []);

  if (loading || !analysis) return <div>Loading...</div>;

  const pieData = [
    { name: "Admins", value: analysis.totalAdmins },
    { name: "Instructors", value: analysis.totalInstructors },
    { name: "Students", value: analysis.totalStudents },
  ];


  const weeklyData = analysis.weeklyRegistrations.map((item) => ({
    week: item.week,
    registrations: item.registrations
  }));


  return (
    <Container>
      <Title>User Analysis</Title>

      <GridWrapper>
        {/* Pie Chart - Role Wise Distribution */}
        <ChartContainer>
          <ChartTitle>User Roles</ChartTitle>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Bar Chart - Monthly Registrations */}
        <ChartContainer>
          <ChartTitle>Weekly Registrations</ChartTitle>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="registrations" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

      </GridWrapper>

      {/* Verified/Unverified Summary */}
      <SummaryGrid>
        <Box bg="#d1fae5">
          <BoxTitle>Total</BoxTitle>
          <BoxValue>{analysis.totalUsers}</BoxValue>
        </Box>
        <Box bg="#bfdbfe">
          <BoxTitle>Verified</BoxTitle>
          <BoxValue>{analysis.verifiedUsers}</BoxValue>
        </Box>
        <Box bg="#fef3c7">
          <BoxTitle>Unverified</BoxTitle>
          <BoxValue>{analysis.unverifiedUsers}</BoxValue>
        </Box>
        <Box bg="#e9d5ff">
          <BoxTitle>Admins</BoxTitle>
          <BoxValue>{analysis.totalAdmins}</BoxValue>
        </Box>
      </SummaryGrid>
    </Container>
  );
};

export default UserAnalysis;
