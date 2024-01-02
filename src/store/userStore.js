import { defineStore } from "pinia";
import axios from "@/api/axios";
import { useWebsocketStore } from "@/store/websocketStore";

export const useUserStore = defineStore("user", {
  state: () => {
    return {
      currentUser: {},
      isLoggedIn: false,
      users: [],
      friendStatuses: {},
      currentTheme: 'midnight',
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

        // set theme from settings
        if (userInfo.settings.theme) {
          this.currentTheme =  userInfo.settings.theme
        }

        this.currentUser = {
          userGUID: userInfo.user_guid,
          email: userInfo.email,
          username: userInfo.username,
          firstName: userInfo.first_name,
          lastName: userInfo.last_name,
          userImage: userInfo.user_image,
        };
        this.isLoggedIn = true;

        return this.currentUser

      } catch (error) {
        console.log("Error during Login", error);
        throw error;
      }
    },

    async register(userData) {
      try {
        const formData = new FormData();
        formData.append("username", userData.username);
        formData.append("password", userData.password);
        formData.append("email", userData.email);
        formData.append("first_name", userData.first_name);
        formData.append("last_name", userData.last_name);
        formData.append("uploaded_image", userData.uploaded_image);

        const response = await axios.post("/register/", userData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (error) {
        console.log("Error during Registration", error);
        throw error;
      }
    },
    googleAuthenticate() {
      let clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID
      let authEndpoint = 'https://accounts.google.com/o/oauth2/auth'
      let scope = 'openid profile email'
      let responseType = 'token'
      let redirectURI = `${window.location.origin}/callback`

      const authUrl = `${authEndpoint}?client_id=${clientID}&redirect_uri=${redirectURI}&scope=${scope}&response_type=${responseType}`;
      // Calculate the center position
      const left = window.screen.width / 2 - 300; // Adjust 300 to half of the pop-up window width
      const top = window.screen.height / 2 - 300; // Adjust 300 to half of the pop-up window height

      // Open the URL in a new pop-up window
      const popupWindow = window.open(authUrl, "_blank", `width=600,height=600,left=${left},top=${top}`);

      // Optional: Focus on the new window
      if (popupWindow) {
        popupWindow.focus();
      }
    },
    async loginWithGoogle(accessToken) {
      try {
        const googleLoginURL = "/google-login/";
        const response = await axios.post(googleLoginURL, {
          access_token: accessToken,
        });

        let userInfo = response.data;
        // Handle user profile photo
        this.currentUser = {
          userGUID: userInfo.user_guid,
          email: userInfo.email,
          username: userInfo.username,
          firstName: userInfo.first_name,
          lastName: userInfo.last_name,
          userImage: userInfo.user_image,
        };
        this.isLoggedIn = true;
        return true;
      } catch (error) {
        console.log("Error while authenticating with Google", error);
        throw error;
      }
    },
    async setUserTheme(theme) {
      const response = await axios.post("/user/settings/theme/", {theme: theme})
      this.currentTheme = theme
      console.log("Set theme response", response);
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
      const websocketStore = useWebsocketStore();
      try {
        this.isLoggedIn = false;
        await axios.get("/logout/");
        await websocketStore.disconnectWebsocket("logout");
      } catch (error) {
        console.error("Error during log out:", error);
        throw error;
      }
    },

    setEmptyFriendStatuses() {
      if (!Array.isArray(this.users)) {
        return;
      }
      if (this.users === undefined || this.users.length == 0) {
        return;
      }
      this.friendStatuses = this.users.reduce((result, item) => {
        result[item.guid] = "offline";
        return result;
      }, {});
    },

    updateFriendStatus(friendGUID, status) {
      this.friendStatuses[friendGUID] = status;
    },
  },
  persist: true,
});
