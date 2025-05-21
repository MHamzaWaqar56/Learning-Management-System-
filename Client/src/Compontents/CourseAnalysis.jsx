

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const Wrapper = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
`;

const Heading = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #333;
`;

const CardsContainer = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const Card = styled.div`
  background-color: ${({ color }) => color || '#eee'};
  padding: 1.25rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Label = styled.p`
  font-size: 0.875rem;
  color: #555;
`;

const Value = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111;
`;

const SubHeading = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;
  margin-top: 1rem;
`;

const PieWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 2rem auto;
`;

const COLORS = ['#22c55e', '#ef4444']; // Approved: Green, Disapproved: Red

const CourseAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/admin/analysis/course-analytics', {
          withCredentials: true,
        });
        setAnalytics(data);
      } catch (err) {
        setError('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p>{error}</p>;

  const pieData = [
    { name: 'Approved', value: analytics.summary.approvedCourses },
    { name: 'Disapproved', value: analytics.summary.disapprovedCourses },
  ];

  return (
    <Wrapper>
      <Heading>📊 Course Analytics</Heading>

      <CardsContainer>
        <Card color="#e0f2fe">
          <Label>Total Courses</Label>
          <Value>{analytics.summary.totalCourses}</Value>
        </Card>
        <Card color="#dcfce7">
          <Label>Approved Courses</Label>
          <Value>{analytics.summary.approvedCourses}</Value>
        </Card>
        <Card color="#fee2e2">
          <Label>Disapproved Courses</Label>
          <Value>{analytics.summary.disapprovedCourses}</Value>
        </Card>
      </CardsContainer>

      <SubHeading>📘 Enrollments by Course</SubHeading>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.enrollmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="enrolledStudents" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <SubHeading>✅ Approval Status</SubHeading>
      <PieWrapper>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </PieWrapper>
    </Wrapper>
  );
};

export default CourseAnalytics;
