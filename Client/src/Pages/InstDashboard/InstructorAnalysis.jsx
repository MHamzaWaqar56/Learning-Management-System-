

import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Context } from '../../main';
import axios from 'axios';
import Footer from '../../Compontents/Footer';
import Header from '../../Compontents/Header';
import SidebarMenu from '../../Compontents/SidebarMenu';

const Container = styled.div`
  padding: 2rem;
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 2.5rem;
`;

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  margin-top: 1rem;
  width: fit-content;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
`;

const ChartWrapper = styled.div`
  width: 100%;
  max-width: 700px;
`;

const COLORS = ['#00C49F', '#FF8042', '#FF4D4D'];

const InstructorAnalysis = () => {
  const { user } = useContext(Context);

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  // Step 1: Load instructor courses
  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/instructor/courses/${user._id}`, {
        withCredentials: true,
      });
      const result = res.data.courses;
      setCourses(result);

      if (result.length > 0) {
        setSelectedCourseId(result[0]._id); // default selection
      }
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  // Step 2: Fetch analysis when course changes
  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseAnalysis(selectedCourseId);
    }
  }, [selectedCourseId]);

  const fetchCourseAnalysis = async (courseId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/v1/instructor/course/${courseId}/analysis`, {
        withCredentials: true,
      });
      setAnalysisData(response.data);
    } catch (error) {
      console.error("Error fetching analysis data", error);
    }
  };

  // 🟡 Handle case where no course exists
  if (courses.length === 0) {
    return (
      <>
        <Header />
        <DashboardContainer>
          <SidebarMenu role="instructor" defaultSelectedKey="dashboard" />
          <Container>
            <Title>📊 Course Analysis</Title>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>⚠️ No any course found.</p>
          </Container>
        </DashboardContainer>
        <Footer />
      </>
    );
  }

  if (!analysisData) return <p>Loading analysis...</p>;

  return (
    <>
      <Header />
      <DashboardContainer>
        <SidebarMenu role="instructor" defaultSelectedKey="dashboard" />
        <Container>
          <Title>📊 Course Analysis</Title>

          {/* Dropdown: Select Course */}
          <div>
            <label htmlFor="course-select">Select Course : </label>
            <Select
              id="course-select"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </Select>
          </div>

          {/* Stats */}
          <CardGrid>
            <Card>
              <p>Total Students: <strong>{analysisData.totalStudents}</strong></p>
              <p>Average Progress: <strong>{analysisData.averageProgress}%</strong></p>
            </Card>
            <Card>
              <p>Quiz Attempts: <strong>{analysisData.totalQuizAttempts}</strong></p>
              <p>Average Score: <strong>{analysisData.avgQuizScore}%</strong></p>
            </Card>
          </CardGrid>

          {/* Pie Chart */}
          <ChartWrapper>
            <SectionTitle>Quiz Pass vs Fail</SectionTitle>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Passed', value: Number(analysisData.quizPassRate) },
                    { name: 'Failed', value: Number(analysisData.quizFailRate) }
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>

          {/* Bar Chart */}
          <div>
            <SectionTitle>Lesson Completion Rates</SectionTitle>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analysisData.lessonCompletion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lessonTitle" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completionRate" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Container>
      </DashboardContainer>
      <Footer />
    </>
  );
};

export default InstructorAnalysis;
