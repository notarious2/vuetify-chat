import axios from 'axios';
import { useUserStore } from "@/store/userStore";
import pinia from "@/store";
import { useRouter } from "vue-router";

const router = useRouter();


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
    // catch a case when there are no http-only cookies (access token)
    // then mark user as logged out
    if (error.response && error.response.status === 422 && error.response.data.detail[0].loc[1] === 'access_token') {
      const userStore = useUserStore(pinia);
      userStore.isLoggedIn = false;
      router.push("/login/")
      
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
