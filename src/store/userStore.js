import { defineStore } from "pinia";
import axios from "@/api/axios";

export const useUserStore = defineStore("user", {
  state: () => {
    return {
      currentUser: {},
      isLoggedIn: false,
      users: [],
      friendStatuses: {},
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

        const response = await axios.post("/login/", formData, {
          headers: headers,
          withCredentials: true,
        });

        let userInfo = response.data;

        this.currentUser = {
          userGUID: userInfo.user_guid,
          email: userInfo.email,
          username: userInfo.username,
          firstName: userInfo.first_name,
          lastName: userInfo.last_name,
        };
      } catch (error) {
        console.log("Error during Login", error);
        throw error;
      }
    },

    async register(userData) {
      try {
        const response = await axios.post("/register/", userData);
      } catch (error) {
        console.log("Error during Registration", error);
        throw error;
      }
    },

    async getUsers() {
      try {
        const response = await axios.get("/users/");
        this.users = response.data;
      } catch (error) {
        console.error("Error during getting Users:", error);
        throw error;
      }
    },

    async logout() {
      try {
        await axios.get("/logout/");
        this.isLoggedIn = false;
      } catch (error) {
        console.error("Error during log out:", error);
        throw error;
      }
    },

    setEmptyFriendStatuses() {
      this.friendStatuses = this.users.reduce((result, item) => {
        result[item.guid] = "offline";
        return result;
      }, {});
    },

    updateFriendStatus(friendGUID, status) {
      this.friendStatuses[friendGUID] = status
    },

  },
  persist: true,
});
