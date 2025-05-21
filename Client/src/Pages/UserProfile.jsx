import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import UserApi from '../APIs/UserApi';
import Footer from '../Compontents/Footer';
import Header from '../Compontents/Header';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #4299e1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin-right: 2rem;
`;

const ProfileTitle = styled.h1`
  font-size: 1.75rem;
  color: #2d3748;
  margin: 0;
`;

const ProfileSubtitle = styled.p`
  color: #718096;
  margin: 0.5rem 0 0;
`;

const ProfileSection = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const InfoItem = styled.div`
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #4299e1;
`;

const InfoLabel = styled.p`
  font-size: 0.875rem;
  color: #718096;
  margin: 0 0 0.5rem;
`;

const InfoValue = styled.p`
  font-size: 1rem;
  color: #2d3748;
  margin: 0;
  font-weight: 500;
`;

const ActionButton = styled.button`
  background: #4299e1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 1rem;
  
  &:hover {
    background: #3182ce;
  }
  
  &:last-child {
    margin-right: 0;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: #e2e8f0;
  color: #2d3748;
  
  &:hover {
    background: #cbd5e0;
  }
`;

const UserProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await UserApi.getProfileData({
          withCredentials: true
        });
        setProfileData(response.user);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load profile');
        if (error.response?.status === 401) {
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleEditProfile = () => {
    navigate('/profile/update');
  };

 

  if (loading) {
    return <ProfileContainer>Loading profile...</ProfileContainer>;
  }

  if (!profileData) {
    return <ProfileContainer>No profile data available</ProfileContainer>;
  }

  return (
    <>
    <Header />
    <ProfileContainer>
      <ProfileHeader>
        <Avatar>
          {profileData.name.charAt(0).toUpperCase()}
        </Avatar>
        <div>
          <ProfileTitle>{profileData.name}</ProfileTitle>
          <ProfileSubtitle>{profileData.email}</ProfileSubtitle>
          <ProfileSubtitle>{profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)} Account</ProfileSubtitle>
        </div>
      </ProfileHeader>

      <ProfileSection>
        <SectionTitle>Personal Information</SectionTitle>
        <InfoGrid>
          <InfoItem>
            <InfoLabel>Full Name</InfoLabel>
            <InfoValue>{profileData.name}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Email Address</InfoLabel>
            <InfoValue>{profileData.email}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Phone Number</InfoLabel>
            <InfoValue>{profileData.phone || 'Not provided'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Account Type</InfoLabel>
            <InfoValue>{profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Member Since</InfoLabel>
            <InfoValue>{new Date(profileData.createdAt).toLocaleDateString()}</InfoValue>
          </InfoItem>
        </InfoGrid>
      </ProfileSection>

      <ProfileSection>
        <SectionTitle>Actions</SectionTitle>
        <div>
          <ActionButton onClick={handleEditProfile}>Edit Profile</ActionButton>
        </div>
      </ProfileSection>
    </ProfileContainer>
    <Footer />

    </>
  );
};

export default UserProfile;