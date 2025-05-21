
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1/courses',
  withCredentials: true
});

const courseApi = {

// ==================== COURSE MANAGEMENT ====================
  
getAllCourses: async (status = 'all', page = 1, limit = 10) => {
    try {
      const { data } = await api.get('/getcourses', {
        params: { status, page, limit }
      });
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch courses');
      throw error;
    }
  },



  getCourseById: async (courseId) => {
    try {
      const response = await api.get(`/course/${courseId}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Invalid course data received');
      }
      return response.data.data; // Returns the course data directly
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         'Failed to get course details';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },
  


  createCourse: async (courseData) => {
    try {
      const { data } = await api.post('/create-courses', courseData);
      toast.success('Course created successfully');
      return data.course;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
      throw error;
    }
  },




  updateCourse: async (courseId, courseData, thumbnailFile) => {
    try {
      if (!courseId) {
        throw new Error('Course ID is required');
      }
  
      const formData = new FormData();
      
      // Append text fields
      if (courseData.title) formData.append('title', courseData.title);
      if (courseData.description) formData.append('description', courseData.description);
      if (courseData.category) formData.append('category', courseData.category);
      if (courseData.price) formData.append('price', courseData.price);

      if (courseData.discountAmount !== undefined) {
        formData.append('discountAmount', courseData.discountAmount);
      }
      if (courseData.discountExpiry) {
        formData.append('discountExpiry', courseData.discountExpiry);
      } else if (courseData.discountExpiry === '') {
        // Explicitly clear expiry if empty string is passed
        formData.append('discountExpiry', '');
      }
      
      // Append lessons
      if (courseData.lessons) {
        formData.append('lessons', JSON.stringify(courseData.lessons));
      }
      
      // Append thumbnail
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
  
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };
  
      const response = await api.patch(`/course/${courseId}`, formData, config);
      
      if (!response.data.success || !response.data.course) {
        throw new Error('Invalid response received from server');
      }
  
      return response.data.course;
    } catch (error) {
      console.error('Update error:', error);
      
      let errorMessage = 'Failed to update course';
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'No response from server';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },




  deleteCourse: async (courseId) => {
    try {
      await api.delete(`/course/${courseId}`);
      toast.success('Course deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
      throw error;
    }
  },


  instructorEnrolledUser : async (instructorId) =>{
    try {
       const  response  = await api.get(`/${instructorId}/enrolled-users`);
      
       console.log("Response :", response.data);
       return response.data

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get students');
      throw error;
    }
  }


}

export default courseApi