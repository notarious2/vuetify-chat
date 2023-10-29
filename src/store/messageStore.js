import { defineStore } from "pinia";
import axios from "@/api/axios";

export const useMessageStore = defineStore("messages", {
  actions: {
    async getLastMessages(chatGUID) {
      try {
        const response = await axios.get(`/chat/${chatGUID}/messages/`, { withCredentials: true });
        return response.data;
      } catch (error) {
        console.error("Error during Get Messages", error);
        throw error;
      }
    },
    async getHistoricalMessages(chatGUID, lastMessageGUID) {
      try {
        const response = await axios.get(`/chat/${chatGUID}/messages/old/${lastMessageGUID}/`);
        console.log("get old messages response", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching old messages:", error);
        throw error;
      }
    },
  },
});

