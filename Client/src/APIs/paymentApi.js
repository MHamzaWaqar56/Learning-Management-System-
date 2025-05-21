import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1/payment',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
       'Accept': 'application/json'
    }
  });

  const paymentApi = {

    initiatePayment: async (courseId) => {
        try {
          const response = await api.post(`/initiate/${courseId}`);
          return response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || 'Payment initiation failed');
        }
      },
    
      // 2. Verify Payment Status
      verifyPayment: async (paymentId) => {
        try {
          const response = await api.get(`/verify/${paymentId}`);
          return response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || 'Payment verification failed');
        }
      },
    
      // 3. Poll Payment Status (for frontend)
      pollPaymentStatus: async (paymentId, interval = 2000, timeout = 60000) => {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          
          const checkStatus = async () => {
            try {
              const { paymentStatus } = await paymentApi.verifyPayment(paymentId);
              
              if (paymentStatus === 'Success') {
                resolve({ status: 'success' });
              } else if (paymentStatus === 'Failed') {
                resolve({ status: 'failed' });
              } else if (Date.now() - startTime > timeout) {
                reject(new Error('Payment verification timeout'));
              } else {
                setTimeout(checkStatus, interval);
              }
            } catch (error) {
              reject(error);
            }
          };
    
          checkStatus();
        });
      },
    
      // 4. Handle Payment Success (for redirects)
      handleSuccessRedirect: async (paymentId) => {
        try {
          const { paymentStatus, payment } = await paymentApi.verifyPayment(paymentId);
          if (paymentStatus === 'Success') {
            return { 
              success: true,
              courseId: payment.course 
            };
          }
          
          return { success: false, status: paymentStatus };
        } catch (error) {
            console.log("handleSuccessRedirect :",error);
          throw error;
        }
      },

  };



export default paymentApi;


