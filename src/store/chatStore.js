import { defineStore } from "pinia";
import axios from "@/api/axios";

export const useChatStore = defineStore("chat", {
  state: () => {
    return {
      directChats: [],
    };
  },

  actions: {
    async getDirectChats(userGUID) {
      try {
        // clear previously fetched direct chat
        if (this.directChats.length) {
          this.directChats = []
        }
        const response = await axios.get(`/chats/direct/`);

        response.data.forEach(chat => {
          // leave friend only from chat.users
          const friendInfo = chat.users.find(user => user.guid !== userGUID);

          this.directChats.push({
            chat_guid: chat["chat_guid"],
            created_at: chat["created_at"],
            updated_at: chat["updated_at"],
            friend: friendInfo,
            has_new_messages: chat["has_new_messages"],
            new_messages_count: chat["new_messages_count"]
          })

        });
        return this.directChats;

      } catch (error) {
        console.error("Error during getting Direct Chats:", error);
        throw error;
      }
    },
  },
  persist: true,
});
