import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8001',
  // Other default configurations if needed
});


axiosInstance.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401) {
      try {
        // try to get ne refresh token
        await axiosInstance.post('/refresh/', { withCredentials: true });
        return axios.request(originalRequest);

      } catch (refreshError) {
        // Handle errors that occur during token refresh
        // Need to redirect to the login page or handle this differently
        throw refreshError;
      }
    }
    // For other error cases, re-throw the error
    throw error;
  }
);


axiosInstance.interceptors.request.use((config) => {
config.withCredentials = true;
  return config;
});

export default axiosInstance;
