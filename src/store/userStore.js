import { defineStore } from "pinia";
import axios from '@/api/axios';

export const useUserStore = defineStore("user", {
  state: () => {
    return {
      currentUser: {},
    };
  },

  actions: {
    async login(userData) {
      try {
        const formData = new FormData();
        formData.append("username", userData.username);
        formData.append("password", userData.password);
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        };

        const response = await axios.post(
          "/login/",
          formData,
          { headers: headers, withCredentials: true }
        );

        let userInfo = response.data

        this.currentUser = {
            userGUID: userInfo.user_guid,
            email: userInfo.email,
            username: userInfo.username,
            firstName: userInfo.first_name,
            lastName: userInfo.last_name,
        }

      } catch (error) {
        console.log("Error during Login", error);
        throw error
      }
    },
  },
  persist: true,
});
