import axios from 'axios';
import { toast } from 'react-toastify';


const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1/quizzes',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

const quizApi = {


    // for Admin Side Quiz Installation.....

    createQuiz: async (courseId, quizData) => {
        
        try {
          const response = await api.post(`/${courseId}/createquiz`, 
            quizData // Moved quiz data to request body
          );
          return response.data;
        } catch (error) {
          console.error('Error creating quiz:', error);
          toast.error(error.response?.data?.message || 'Failed to create quiz');
          throw error; // Re-throw the error for component-level handling
        }
      },


    getAdminQuiz: async (courseId, token) => {
        try {
            const response = await api.get(`/${courseId}/getquiz`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.quiz;
        } catch (error) {
            if (error.response?.status === 404) {
                // Quiz not found - return null instead of throwing error
                return null;
            }
            console.error('Error fetching quiz:', error);
            throw error;
        }
    },


      updateQuiz: async (quizId, updateData, token) => {
        try {
          const response = await api.patch(`/quiz/${quizId}`, updateData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          return response.data.quiz;
        } catch (error) {
          console.error('Error updating quiz:', {
            message: error.message,
            response: error.response?.data,
            config: error.config
          });
          throw error;
        }
      },


      addQuestions: async (quizId, questions, token) => {
        try {
          const response = await api.post(`/quiz/${quizId}/questions`, { questions }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          return response.data.quiz;
        } catch (error) {
          console.error('Error adding questions:', error);
          throw error;
        }
      },


      getQuizQuestions : async (quizId, token) => {
        try{
        const response = await api.get(`/quiz/${quizId}/getquestions`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
    }catch(error){
        console.error('Error getting questions:' ,error)
        throw error;
    }
},


updateQuizQuestion: async (quizId , questionId, updateData, token) => {
    try {
      const response = await api.patch(`/quiz/${quizId}/questions/${questionId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.quiz;
    } catch (error) {
      console.error('Error updating quiz question:', {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      throw error;
    }
  }, 
  
  
  deleteQuizQuestion: async (quizId , questionId , token) => {
    try {
      await api.delete(`/quiz/${quizId}/questions/${questionId}`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return true;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },






//   for Student side Quiz Installation  



 getUserQuiz: async (courseId) => {
    try{
        const response = await api.get(`courses/${courseId}/attempt-quiz`, {
          withCredentials: true,
          });
          console.log("Get Quiz :" , response);
        return response.data;

    }catch(error){
        console.error('Error getting user quiz :' ,error)
        throw error;
    }
  },
  
  
  submitQuizResults: async (courseId, quizId, results) => {
    try {
      const response = await api.post(
        `/courses/${courseId}/quiz/${quizId}/submit-quiz`, 
        results,
        {
          withCredentials: true,
        }
      );

      console.log('Submitting quiz with API:', {
              courseId,
              quizId,
              data: results
            });

      return response.data;
    } catch (error) {
      console.error('Error submitting result:', error.response?.data || error.message);
      throw error;
    }
  },







  getQuizResults: async (courseId, quizId ,token) => {
    try {
        const response = await api.get(`/courses/${courseId}/quiz/${quizId}/results`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Get Result :", response);
        return response.data;
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch quiz results');
        throw error;
    }
},

    


}


export default quizApi;