import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Layout, Spin } from 'antd';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import SidebarMenu from '../../Compontents/SidebarMenu';
import { Context } from '../../main';
import CourseEnrollmentChart from '../../Compontents/CourseEnrollmentChart.jsx';
import StudentProgressChart from '../../Compontents/StudentProgressChart.jsx';
import Footer from '../../Compontents/Footer.jsx';
import Header from '../../Compontents/Header.jsx';

const { Content } = Layout;

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
`;

const MainContent = styled(Content)`
  padding: 24px;
  width: 100%;
  overflow: auto;
`;

const AnalysisContainer = styled.div`
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const GroupChart = styled.div`
  // display: flex;
`

const Chart = styled.div`
 
  padding: 20px;
`

const Headers = styled.h1`
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;


const AdminAnalysis = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(Context);

  // console.log("USER :", user);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      toast.error('You do not have permission to access this page');
      navigate('/');
    } 
  }, [isAuthenticated, user, navigate]);



  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (

    <>
    <Header />

    <DashboardContainer>
      <SidebarMenu role="admin" defaultSelectedKey="analysis" />
      
      <MainContent>
        <AnalysisContainer>
          <Headers>Admin Dashboard Analysis</Headers>
          
          <GroupChart>
          <Chart>
          <CourseEnrollmentChart />
          </Chart>

          <Chart>
          <StudentProgressChart />
          </Chart>
          </GroupChart>
        </AnalysisContainer>
      </MainContent>
    </DashboardContainer>
    <Footer />
    </>
  );
};

export default AdminAnalysis;

