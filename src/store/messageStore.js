import { defineStore } from "pinia";
import axios from "@/api/axios";
import { useUserStore } from "@/store/userStore";




export const useMessageStore = defineStore("messages", {
  state: () => {
    return {
      currentChatMessages: [],
      lastReadMessage: {},
      systemMessage: {},
    };
  },
  actions: {
    async getLastMessages(chatGUID) {
      try {
        const response = await axios.get(`/chat/${chatGUID}/messages/`, {
          withCredentials: true,
        });
        return response.data;
      } catch (error) {
        console.error("Error during Get Messages", error);
        throw error;
      }
    },
    async getHistoricalMessages(chatGUID, lastMessageGUID) {
      try {
        const response = await axios.get(
          `/chat/${chatGUID}/messages/old/${lastMessageGUID}/`
        );
        console.log("get old messages response", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching old messages:", error);
        throw error;
      }
    },

    setLastReadMessage(lastReadMessageData) {
      this.lastReadMessage.guid = lastReadMessageData.guid;
      this.lastReadMessage.created_at = new Date(
        lastReadMessageData.created_at
      );
    },

    clearLastReadMessage() {
      this.lastReadMessage = {};
    },

    updateMessagesReadStatus (lastReadMessageDate) {
      const userStore = useUserStore()
      const currentDate = new Date(lastReadMessageDate);

      // Check if the message is older than or equal to the lastReadMessageDate,
      // belongs to the specified user
      for (let i = 0; i < this.currentChatMessages.length; i++) {
        const message = this.currentChatMessages[i];
        const messageDate = new Date(message.created_at);

        if (messageDate <= currentDate && message.user_guid === userStore.currentUser.userGUID) {
          // Exit the loop if the message is already read
          if (message.is_read) break;

          // Marking message read with 0.5 second delay
          setTimeout(() => {
            this.currentChatMessages[i].is_read = true;
          }, 500);
        }
      }
    },


  },
});
