import { useEffect, useState } from 'react';
import styled from 'styled-components';
import adminApi from '../../APIs/AdminApi.js';
import StatCard from '../../Compontents/StatCard.jsx';
import { Outlet } from 'react-router-dom';
// import { Layout } from 'antd';
import SidebarMenu from '../../Compontents/SidebarMenu.jsx';
import Footer from '../../Compontents/Footer.jsx';
import Header from '../../Compontents/Header.jsx';
import UserAnalysis from '../../Compontents/UserAnalysis.jsx';
import CourseAnalytics from '../../Compontents/CourseAnalysis.jsx';

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const MainContent = styled.div`
  padding: 2rem;
  width: 100%;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Chart = styled.div`

padding : 20px ;

`

const DashboardHeader = styled.h1`
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
`;

const LoadingMessage = styled.div`
  padding: 2rem;
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
`;

const ErrorMessage = styled.div`
  padding: 2rem;
  text-align: center;
  font-size: 1.2rem;
  color: #e74c3c;
  background-color: #fadbd8;
  border-radius: 8px;
  margin: 1rem;
`;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <LoadingMessage>Loading dashboard...</LoadingMessage>;
  if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;

  return (
    <>
    <Header />
    <DashboardContainer>
      <SidebarMenu role="admin" defaultSelectedKey="dashboard" />
      
      <MainContent>
        <DashboardHeader>Admin Dashboard</DashboardHeader>
        <StatsGrid>
          {/* User Statistics */}
          <StatCard 
            title="Total Students" 
            value={stats?.userStats?.totalStudents || 0} 
            icon="users"
            color="#3498db"
          />
          <StatCard 
            title="Total Instructors" 
            value={stats?.userStats?.totalInstructors || 0} 
            icon="chalkboard-teacher"
            color="#9b59b6"
          />
          <StatCard 
            title="New Students (7 days)" 
            value={stats?.userStats?.newStudentsLast7Days || 0} 
            icon="user-plus"
            color="#2ecc71"
          />
          
          {/* Course Statistics */}
          <StatCard 
            title="Total Courses" 
            value={stats?.courseStats?.totalCourses || 0} 
            icon="book"
            color="#e67e22"
          />
          <StatCard 
            title="Pending Courses" 
            value={stats?.courseStats?.pendingCourses || 0} 
            icon="clock"
            color="#f39c12"
          />
          <StatCard 
            title="Active Courses (7 days)" 
            value={stats?.courseStats?.activeCoursesLast7Days || 0} 
            icon="book-open"
            color="#1abc9c"
          />
        </StatsGrid>

        <Chart>
        <UserAnalysis />
        </Chart>

        <Chart>
        <CourseAnalytics />
        </Chart>
        

        <Outlet /> {/* For nested routes */}
      </MainContent>
    </DashboardContainer>
    <Footer />
    </>
  );

};

export default AdminDashboard;