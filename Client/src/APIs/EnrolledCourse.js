import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1/enrollment',
  withCredentials: true
});

const enrollmentApi = {


    enrollUser: async (courseId) => {
        try {
          const { data } = await api.post(`/courses/${courseId}/enroll`);
          console.log("Enrollment Data:", data);
          toast.success(data.message || 'Enrolled successfully');
          return {
            course: data.course,
            progress: data.progress || 0
          };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to enroll';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },
    
      // Optional: Add method to check enrollment status
      checkEnrollment: async (courseId) => {
        try {
          const { data } = await api.get(`/courses/${courseId}/enrollment-status`);
        //   console.log("Enrollment Status :", data);
          return data.isEnrolled;
        } catch (error) {
          console.error('Error checking enrollment:', error);
          return false;
        }
      }


}

export default enrollmentApi;