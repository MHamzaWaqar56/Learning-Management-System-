
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Context } from "../../main";
import EnrollChart from "../../Compontents/EnrollChart";
import styled from "styled-components";
import Header from "../../Compontents/Header";
import Footer from "../../Compontents/Footer";
import SidebarMenu from "../../Compontents/SidebarMenu";

const Container = styled.div`
  padding: 2rem;
  width : 100%;
`;

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background-color: ${(props) => props.bg || "#f0f0f0"};
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const CardValue = styled.p`
  font-size: 2rem;
  font-weight: bold;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const InstructorDashboard = () => {
  const { user } = useContext(Context);
  const [dashboardData, setDashboardData] = useState({
    totalCourses: 0,
    totalStudents: 0,
    enrollChart: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/v1/instructor/dashboard/${user._id}`,{
            withCredentials : true
          });
          
        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      }
    };

    fetchDashboardData();
  }, [user._id]);

  return (

    <>
    <Header />
    <DashboardContainer>
    <SidebarMenu role="instructor" defaultSelectedKey="dashboard" />

    <Container>
      <Title>Instructor Dashboard</Title>

      <CardsGrid>
        <Card bg="#dbeafe">
          <CardTitle>Total Courses</CardTitle>
          <CardValue>{dashboardData.totalCourses}</CardValue>
        </Card>
        <Card bg="#bbf7d0">
          <CardTitle>Total Students</CardTitle>
          <CardValue>{dashboardData.totalStudents}</CardValue>
        </Card>
      </CardsGrid>

      <SectionTitle>Weekly Enrollments</SectionTitle>
      <EnrollChart data={dashboardData.enrollChart} />
    </Container>
    </DashboardContainer>

    <Footer />

    </>
  );
};

export default InstructorDashboard;
