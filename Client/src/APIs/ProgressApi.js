import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1/progress',
  withCredentials: true
});

const progressApi = {

 getCourseProgress : async (courseId, token) => {
    try {
      const response = await api.get(`/courses/${courseId}/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      return {
        success: true,
        data: response.data.progress,
      };
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch progress',
      };
    }
  },


  completeLesson : async (courseId, lessonId) => {
    try {
      const response = await api.put(`/courses/${courseId}/lessons/${lessonId}/complete`,
        {}, // Empty body
        
      );
  
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error completing lesson:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to complete lesson',
      };
    }
  }


};



export default progressApi;