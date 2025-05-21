

import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Layout } from 'antd';
import { toast } from 'react-toastify';
import adminApi from '../../APIs/AdminApi.js';
import SidebarMenu from '../../Compontents/SidebarMenu';
import { Context } from '../../main';
import Footer from '../../Compontents/Footer.jsx';
import Header from '../../Compontents/Header.jsx';

const { Content } = Layout;

// Styled Components (keep all your existing styles)
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


const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const PageHeader = styled.h1`
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  font-weight: 600;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
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

const ActionCell = styled(TableCell)`
  // display: flex;
  gap: 0.5rem;
`;

const RoleSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const DeleteButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #c0392b;
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
    opacity: 0.7;
  }
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #7f8c8d;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem 0;
  gap: 1rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 80px;

  &:hover:not(:disabled) {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const PageInfo = styled.span`
  color: #7f8c8d;
  margin: 0 1rem;
`;




const UserManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(Context);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 1
  });

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      toast.error('You do not have permission to access this page');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { users, totalUsers, totalPages, currentPage } = await adminApi.getAllUsers(
        pagination.page,
        pagination.limit,
        searchTerm
      );
      setUsers(users);
      setPagination(prev => ({
        ...prev,
        totalUsers,
        totalPages,
        page: Math.max(1, Math.min(currentPage, totalPages))
      }));
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Failed to load users. Please try again.');
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      const timer = setTimeout(() => {
        fetchUsers();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm, pagination.page, pagination.limit, user]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updatedUser = await adminApi.promoteOrDemoteUser(userId, newRole);
      setUsers(users.map(user => 
        user._id === userId ? updatedUser : user
      ));
      toast.success(`User ${newRole === 'instructor' ? 'promoted' : 'demoted'} successfully`);
    } catch (err) {
      console.error('Role change failed:', err);
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      if (window.confirm('Are you sure you want to delete this user?')) {
        await adminApi.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh the list
      }
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ 
      ...prev, 
      page: Math.max(1, Math.min(newPage, prev.totalPages))
    }));
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // Or you could return a redirect component
  }

  return (
    <>
    <Header />

    <DashboardContainer>
      <SidebarMenu role="admin" defaultSelectedKey="user-management" />
      
      <MainContent>
        <StyledContainer>
          <PageHeader>User Management</PageHeader>
          
          <Toolbar>
            <SearchInput
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            />
          </Toolbar>
          
          {error && <ErrorText>{error}</ErrorText>}
          
          {loading ? (
            <StatusContainer>
              <LoadingText>Loading users...</LoadingText>
            </StatusContainer>
          ) : (
            <>
              <TableContainer>
                <StyledTable>
                  <TableHeader>
                    <tr>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                      <TableHeaderCell>Role</TableHeaderCell>
                      <TableHeaderCell>Change Role</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </tr>
                  </TableHeader>
                  <tbody>
                    {users.length > 0 ? (
                      users.map(user => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.role === 'user' ? 'Student' : 
                             user.role === 'instructor' ? 'Instructor' : 'Admin'}
                          </TableCell>
                          <ActionCell>
                            <RoleSelect 
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              disabled={user.role === 'admin'}
                            >
                              <option value="user">Student</option>
                              <option value="instructor">Instructor</option>
                            </RoleSelect>
                          </ActionCell>
                          <ActionCell>
                            <DeleteButton 
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={user.role === 'admin'}
                            >
                              Delete
                            </DeleteButton>
                          </ActionCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="5">
                          <EmptyState>
                            No users found
                          </EmptyState>
                        </TableCell>
                      </TableRow>
                    )}
                  </tbody>
                </StyledTable>
              </TableContainer>

              {users.length > 0 && (
                <PaginationContainer>
                  <PaginationButton
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </PaginationButton>
                  
                  <PageInfo>
                    Page {pagination.page} of {pagination.totalPages} ({pagination.totalUsers} users)
                  </PageInfo>
                  
                  <PaginationButton
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </PaginationButton>
                </PaginationContainer>
              )}
            </>
          )}
        </StyledContainer>
      </MainContent>
    </DashboardContainer>
    <Footer />

    </>
  );
};

export default UserManagement;