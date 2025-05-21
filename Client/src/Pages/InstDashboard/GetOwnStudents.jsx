
import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import SidebarMenu from '../../Compontents/SidebarMenu';
import Footer from '../../Compontents/Footer';
import Header from '../../Compontents/Header';
import { Context } from '../../main';
import courseApi from '../../APIs/CourseApi';

const { Content } = Layout;

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
`;

const MainContent = styled(Content)`
  padding: 24px;
  width: 100%;
`;

const StyledContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: calc(100vh - 48px);
  border-radius: 8px;
`;

const PageHeader = styled.h1`
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  font-weight: 600;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`;

const TableHeader = styled.thead`
  background-color: #3498db;
  color: white;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 500;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #333;
`;

const StatusContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const LoadingText = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
`;

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
`;

function GetOwnStudents() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(Context);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log("Students :", students);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'instructor') {
      toast.error('Unauthorized access');
      return navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await courseApi.instructorEnrolledUser(user._id); 
      setStudents(response.data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'instructor') {
      fetchStudents();
    }
  }, [user]);

  return (
    <>
      <Header />
      <DashboardContainer>
        <SidebarMenu role="instructor" defaultSelectedKey="my-students" />
        <MainContent>
          <StyledContainer>
            <PageHeader>Your Students</PageHeader>

            {error && <ErrorText>{error}</ErrorText>}
            {loading ? (
              <StatusContainer>
                <LoadingText>Loading students...</LoadingText>
              </StatusContainer>
            ) : (
              <>
                {students.length === 0 ? (
                  <EmptyState>No students found.</EmptyState>
                ) : (
                  <TableContainer>
                    <StyledTable>
                      <TableHeader>
                        <tr>
                          <TableHeaderCell>Name</TableHeaderCell>
                          <TableHeaderCell>Email</TableHeaderCell>
                          <TableHeaderCell>Status</TableHeaderCell>
                          <TableHeaderCell>Role</TableHeaderCell>
                        </tr>
                      </TableHeader>
                      <tbody>
                        {students.map((student) => (
                          <TableRow key={student.user._id}>
                            <TableCell>{student.user.name}</TableCell>
                            <TableCell>{student.user.email}</TableCell>
                            <TableCell>
                              {student.status || 'Enrolled'}
                            </TableCell>
                            <TableCell>{student.user.role}</TableCell>
                          </TableRow>
                        ))}
                      </tbody>
                    </StyledTable>
                  </TableContainer>
                )}
              </>
            )}
          </StyledContainer>
        </MainContent>
      </DashboardContainer>
      <Footer />
    </>
  );
}

export default GetOwnStudents;
