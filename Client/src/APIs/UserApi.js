
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1/user',
  withCredentials: true
});

const UserApi = {
  getAvailableCourses: async (category = 'all', page = 1, limit = 10) => {
    try {
      const response = await api.get('/courses', {
        params: {
          category,
          page,
          limit
        }
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch courses');
      throw error;
    }
  },

  getCourseLectures: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/lectures`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch course lectures');
      throw error;
    }
  },

  // Optional: Add method to mark lecture as completed
  markLectureCompleted: async (courseId, lectureId) => {
    try {
      const response = await api.post(`/courses/${courseId}/lectures/${lectureId}/complete`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark lecture as completed');
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/profile/edit', profileData);
      console.log("Updated Data: " , response);
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      throw error;
    }
  },

  getProfileData: async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch profile data');
      throw error;
    }
  },



};

export default UserApi;