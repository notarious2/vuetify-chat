import axios from 'axios';
import { useUserStore } from "@/store/userStore";
import pinia from "@/store";

import router from '@/router'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  // Other default configurations if needed
});


axiosInstance.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.log("ORIGINAL REQUEST URL", originalRequest);
    // if refresh token is invalid
    if (error.response && error.response && originalRequest.url === "/refresh/") {
      const userStore = useUserStore(pinia);
      userStore.isLoggedIn = false;
      router.push("/login/");
    }
    else if (error.response && error.response.status === 401) {
      try {
        // try to get new refresh token
        if (originalRequest.url !=="/refresh/") {
          console.log("TRYING ORIGINAL REQUEST", originalRequest.url === "/refresh/");
          await axiosInstance.post('/refresh/', { withCredentials: true });
        }
        return axios.request(originalRequest);

      } catch (refreshError) {

        throw refreshError;
      }
    }
    // catch a case when there are no http-only cookies (access token)
    // then mark user as logged out
    if (error.response && error.response.status === 422 && error.response.data.detail[0].loc[1] === 'access_token') {
      const userStore = useUserStore(pinia);
      userStore.isLoggedIn = false;
      router.push("/login/");

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
