import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1/certificate',
  withCredentials: true
});

const certificateApi = {

 generateCertificate : async (courseId, token) => {
    
    try {

        const response = await api.get(`/courses/${courseId}/certificate`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return response;
        
    } catch (error) {
        console.error('Error generating Certificate:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate Certificate',
      };
    }

  },


  

};



export default certificateApi;



