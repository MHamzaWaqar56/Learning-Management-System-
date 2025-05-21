import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1/courseapproval',
  withCredentials: true
});

const approvalApi = {


  approveCourse: async (courseId) => {
    try {
      const { data } = await api.patch(`/${courseId}/approve`);
      toast.success('Course approved successfully');
      return data.course;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve course');
      throw error;
    }
  },


  disapproveCourse: async (courseId) => {
    try {
      const { data } = await api.patch(`/${courseId}/disapprove`);
      toast.success('Course approved successfully');
      return data.course;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve course');
      throw error;
    }
  },


getAllApprovedCourses: async (page = 1, limit = 10) => {
    try {
        
      const response = await api.get('/getcourses', {params: {  page, limit }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message ||  'Failed to fetch approved courses';
      toast.error(errorMessage);
      throw error;
    }
  },



}

export default approvalApi