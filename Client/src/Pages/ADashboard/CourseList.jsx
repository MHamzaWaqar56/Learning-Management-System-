
import { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Select, Pagination, Layout, Button, Modal, Spin } from 'antd';
import { toast } from 'react-toastify';
import SidebarMenu from '../../Compontents/SidebarMenu';
import { Context } from '../../main';
import Footer from '../../Compontents/Footer';
import Header from '../../Compontents/Header';
import courseApi from '../../APIs/CourseApi';
import approvalApi from '../../APIs/ApprovalApi';
import FormatPrice from '../../Helper/formatPrice';

const { Option } = Select;
const { Content } = Layout;

const CoursesContainer = styled.div`
  padding: 2rem;
  background-color: #1a1a1a;
  min-height: 100vh;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  color: #facc15;
  font-size: 2rem;
  margin: 0;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const StyledSelect = styled(Select)`
  min-width: 200px;
  
  .ant-select-selector {
    background-color: #3a3a3a !important;
    color: white !important;
    border: 1px solid #555 !important;
    border-radius: 0.4rem !important;
  }
  
  .ant-select-arrow {
    color: #aaa !important;
  }
`;

const DiscountBadge = styled.span`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #805ad5;
  color: white;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

// Update the CoursePrice component to show both original and discounted prices
const CoursePriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
`;

const OriginalPrice = styled.span`
  text-decoration: line-through;
  color: #aaa;
  font-size: 0.9rem;
`;

const DiscountedPrice = styled.span`
  color: #f5f5f5;
  font-size: 1.2rem;
  font-weight: bold;
`;


const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const CourseCard = styled(Link)`
  background: #2d2d2d;
    position: relative;
  border-radius: 0.8rem;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  text-decoration: none;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
  }
`;

const Thumbnail = styled.div`
  width: 100%;
  height: 180px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
    
    ${CourseCard}:hover & {
      transform: scale(1.05);
    }
  }
`;

const DiscountPercentageBadge = styled.span`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #ff4d4f; // Red color for percentage badge
  color: white;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const CourseContent = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CourseTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #f5f5f5;
`;

const CoursePrice = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #f5f5f5;
`;

const TitlePrice = styled.div`
  display: flex;
  justify-content: space-between;
`;

const InstructorInfo = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding-top: 1rem;
  border-top: 1px solid #444;
`;

const InstructorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
`;

const InstructorName = styled.span`
  color: #aaa;
  font-size: 0.9rem;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.5rem;
  align-self: flex-start;
  
  ${props => props.status === 'published' && `
    background-color: #4CAF50;
    color: white;
  `}
  
  ${props => props.status === 'pending' && `
    background-color: #FFC107;
    color: black;
  `}
  
  ${props => props.status === 'draft' && `
    background-color: #9E9E9E;
    color: white;
  `}
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;

  .ant-pagination-item {
    background-color: #3a3a3a;
    border-color: #555;
    
    a {
      color: white;
    }
    
    &:hover {
      border-color: #00ffff;
    }
  }
  
  .ant-pagination-item-active {
    border-color: #00ffff;
    background-color: #00ffff;
    
    a {
      color: #1a1a1a;
    }
  }
  
  .ant-pagination-prev, .ant-pagination-next {
    .ant-pagination-item-link {
      background-color: #3a3a3a;
      border-color: #555;
      color: white;
    }
    
    &:hover .ant-pagination-item-link {
      border-color: #00ffff;
      color: #00ffff;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #aaa;
  grid-column: 1 / -1;
`;

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #1a1a1a;
`;

const MainContent = styled(Content)`
  padding: 24px;
  width: 100%;
`;

const CoursesWrapper = styled.div`
  padding: 2rem;
  min-height: 100vh;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

function CourseList() {
  const { role } = useParams();
  const { user } = useContext(Context);
  
  const currentRole = role || user?.role || 'instructor';
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [disapproveModalVisible, setDisapproveModalVisible] = useState(false);


  const fetchCourses = async () => {
    let isMounted = true;
    try {
      setLoading(true);
      const response = await courseApi.getAllCourses({
        page: pagination.current,
        limit: pagination.pageSize
      });
      
      if (isMounted) {
        if (!response || !response.courses) {
          throw new Error('Invalid response format');
        }
        
        setCourses(response.courses);
        setPagination(prev => ({
          ...prev,
          total: response.totalCourses || 0
        }));
      }
    } catch (error) {
      if (isMounted) {
        console.error('Fetch courses error:', error);
        toast.error(error.message || 'Failed to load courses');
        setCourses([]);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  };

  const handleApproveCourse = async () => {
    try {
      setApproveModalVisible(false);
      const result = await approvalApi.approveCourse(selectedCourse._id);
      if (result) {
        toast.success('Course approved successfully');
        fetchCourses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    }
  };

  const handleDisapproveCourse = async () => {
    try {
      setDisapproveModalVisible(false);
      const result = await approvalApi.disapproveCourse(selectedCourse._id);
      if (result) {
        toast.success('Course disapproved successfully');
        fetchCourses();
        // setDisapproveModalVisible(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Disapproval failed');
    }
  };

  const showApproveModal = (course) => {
    setSelectedCourse(course);
    setApproveModalVisible(true);
  };

  const showDisapproveModal = (course) => {
    setSelectedCourse(course);
    setDisapproveModalVisible(true);
  };

  useEffect(() => {
    fetchCourses();
  }, [ pagination.current]);

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      current: page
    }));
  };

  return (
    <>
      <Header />
      <DashboardContainer>
        <SidebarMenu role={currentRole} defaultSelectedKey="courses" />
        
        <MainContent>
          <CoursesWrapper>
            <HeaderSection>
              <Title>All Courses</Title>
              
            </HeaderSection>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Spin size="large" tip="Loading courses..." />
              </div>
            ) : (
              <>
                {courses.length > 0 ? (
                  <>
                    <CoursesGrid>
                      {courses.map((course) => {
                        
                        const discountPercentage = course.discount?.amount > 0 
    ? Math.round((course.discount.amount / course.price) * 100)
    : 0;
                        
                        return(
                        
                        <CourseCard key={course._id} to={`/${currentRole}/course/edit/${course._id}`}>
                          <Thumbnail>
                            {course.thumbnail ? (
                              <img src={course.thumbnail} alt={course.title} />
                            ) : (
                              <img src="https://via.placeholder.com/300x180?text=No+Thumbnail" alt="Placeholder" />
                            )}
                          </Thumbnail>

                          {discountPercentage > 0 && (
                            <DiscountPercentageBadge>
                              {discountPercentage}% OFF
                            </DiscountPercentageBadge>
                          )}
                          
                          <CourseContent>
                          <TitlePrice>
                            <CourseTitle>{course.title}</CourseTitle>
                            
                            <CoursePriceContainer>
          {course.discount?.amount > 0 && (
            <>
              <OriginalPrice>
                <FormatPrice price={course.price} />
              </OriginalPrice>
              <DiscountedPrice>
                <FormatPrice price={course.price - course.discount.amount} />
              </DiscountedPrice>
            </>
          )}
          {(!course.discount || course.discount?.amount <= 0) && (
            <DiscountedPrice>
              <FormatPrice price={course.price} />
            </DiscountedPrice>
          )}
        </CoursePriceContainer>
      </TitlePrice>
      
      {course.discount?.amount > 0 && (
        <DiscountBadge>
          {course.discount.expiresAt 
            ? `Expiry: ${new Date(course.discount.expiresAt).toLocaleDateString()}`
            : 'Special Offer'}
        </DiscountBadge>
      )}
                            

                            <StatusBadge status={course.approved ? 'published' : 'pending'}>
                              {course.approved ? 'Approved' : 'Pending Approval'}
                            </StatusBadge>
                            
                            {currentRole === 'admin' && (
                              <ActionButtons>
                                {!course.approved && (
                                  <Button 
                                    type="primary" 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      showApproveModal(course);
                                    }}
                                  >
                                    Approve
                                  </Button>
                                )}
                                {course.approved && (
                                  <Button 
                                    danger
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      showDisapproveModal(course);
                                    }}
                                  >
                                    Disapprove
                                  </Button>
                                )}
                              </ActionButtons>
                            )}
                            
                            <InstructorInfo>
                              <InstructorAvatar>
                                {course.instructor?.name?.charAt(0) || 'I'}
                              </InstructorAvatar>
                              <InstructorName>
                                {course.instructor?.name || 'Instructor'}
                              </InstructorName>
                            </InstructorInfo>
                          </CourseContent>
                        </CourseCard>
                      )})}
                    </CoursesGrid>

                    <PaginationContainer>
                      <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                      />
                    </PaginationContainer>
                  </>
                ) : (
                  <EmptyState>
                    <h3>No courses found</h3>
                    <p>Try changing your filters or create a new course</p>
                  </EmptyState>
                )}
              </>
            )}
          </CoursesWrapper>
        </MainContent>
      </DashboardContainer>
      <Footer />

      {/* Approve Course Modal */}
      <Modal
        title="Approve Course"
        visible={approveModalVisible}
        onOk={handleApproveCourse}
        onCancel={() => setApproveModalVisible(false)}
        okText="Approve"
        cancelText="Cancel"
      >
        <p>Are you sure you want to approve this course?</p>
        <p><strong>Title:</strong> {selectedCourse?.title}</p>
        <p><strong>Instructor:</strong> {selectedCourse?.instructor?.name}</p>
      </Modal>

      {/* Disapprove Course Modal */}
      <Modal
        title="Disapprove Course"
        visible={disapproveModalVisible}
        onOk={handleDisapproveCourse}
        onCancel={() => setDisapproveModalVisible(false)}
        okText="Disapprove"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to disapprove this course?</p>
        <p><strong>Title:</strong> {selectedCourse?.title}</p>
        <p><strong>Instructor:</strong> {selectedCourse?.instructor?.name}</p>
      </Modal>
    </>
  );
}

export default CourseList;