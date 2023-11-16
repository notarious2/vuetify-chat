import { defineStore } from "pinia";
import axios from "@/api/axios";

export const useChatStore = defineStore("chat", {
  state: () => {
    return {
      directChats: [],
      chatSelected: false,
      currentChatGUID: "",
      friendUserName: "",
      friendStatus: "offline",
      inputLocked: false,
      friendTyping: false,
      friendTypingTimer: null,
      meTyping: false,
      meTypingTimer: null,

    };
  },

  actions: {
    async getDirectChats(userGUID) {
      try {
        const response = await axios.get("/chats/direct/");

        // override current direct chats array
        this.directChats = [];

        response.data.forEach((chat) => {
          // leave friend only from chat.users
          const friendInfo = chat.users.find((user) => user.guid !== userGUID);

          this.directChats.push({
            chat_guid: chat["chat_guid"],
            created_at: chat["created_at"],
            updated_at: chat["updated_at"],
            friend: friendInfo,
            has_new_messages: chat["has_new_messages"],
            new_messages_count: chat["new_messages_count"],
          });
        });
      } catch (error) {
        console.error("Error during getting Direct Chats:", error);
        throw error;
      }
    },

    setChatAsActive(chatGUID) {
      this.currentChatGUID = chatGUID;
    },

    clearFriendStatus() {
      this.friendStatus = "offline";
    },
    async createDirectChat(friendGUID) {
      try {
        const response = await axios.post("/chat/direct/", {
          recipient_user_guid: friendGUID,
        });
        return response.data;
      } catch (error) {
        console.error("Error during creating Direct Chat:", error);
      }
    },

    timeoutMeTyping() {
      this.meTypingTimer = setTimeout(() => {
        this.meTyping = false;
      }, 1000);
    },

    stopTimeoutMeTyping() {
      clearTimeout(this.meTypingTimer);
    },

    timeoutFriendTyping() {
      this.friendTypingTimer = setTimeout(() => {
        this.friendTyping = false;
      }, 2000);
    },

    stopTimeoutFriendTyping() {
      clearTimeout(this.friendTypingTimer);
    }

  },
});
