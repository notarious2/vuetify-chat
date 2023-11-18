import { defineStore } from "pinia";
import axios from "@/api/axios";
import { useUserStore } from "@/store/userStore";
import { useWebsocketStore } from "@/store/websocketStore";

export const useMessageStore = defineStore("messages", {
  state: () => {
    return {
      currentChatMessages: [],
      lastReadMessage: {},
      systemMessage: {},
      moreMessagesToLoad: false,
    };
  },
  actions: {
    async getLastMessages(chatGUID) {
      
      try {
        const response = await axios.get(`/chat/${chatGUID}/messages/`, {
          withCredentials: true,
        });
        let messagesInfo = response.data;
        this.currentChatMessages = messagesInfo.messages;
        this.moreMessagesToLoad = messagesInfo.has_more_messages;
        
        if (messagesInfo.last_read_message) {
          this.setLastReadMessage(messagesInfo.last_read_message);
        } else {
          this.clearLastReadMessage();
        }

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

    clearMoreMessagesToLoad() {
      this.moreMessagesToLoad = false;
    },

    clearCurrentChatMessages() {
      this.currentChatMessages = [];
    },

    updateMessagesReadStatus(lastReadMessageDate) {
      const userStore = useUserStore();
      const currentDate = new Date(lastReadMessageDate);

      // Check if the message is older than or equal to the lastReadMessageDate,
      // belongs to the specified user
      for (let i = 0; i < this.currentChatMessages.length; i++) {
        const message = this.currentChatMessages[i];
        const messageDate = new Date(message.created_at);

        if (
          messageDate <= currentDate &&
          message.user_guid === userStore.currentUser.userGUID
        ) {
          // Exit the loop if the message is already read
          if (message.is_read) break;

          // Marking message read with 0.5 second delay
          setTimeout(() => {
            this.currentChatMessages[i].is_read = true;
          }, 500);
        }
      }
    },

    /**
     * Marks a message as read and updates the last read message information.
     * Assumes the message is not read and is from another user
     * @param {Object} message - The message to mark as read.
     */
    async markMessageAsRead(message) {
      const websocketStore = useWebsocketStore();
      // Check if there is no previous last read message or if the current message is newer
      const isCurrentMessageNewer =
      Object.keys(this.lastReadMessage).length === 0 ||
        new Date(message.created_at) >= this.lastReadMessage.created_at;

      // If the message is newer or no previous last read message,
      // mark it as read and update last read information
      if (isCurrentMessageNewer) {
        // Send a WebSocket message indicating that the message has been read
        await websocketStore.sendMessageRead(message);

        // Update the last read message information
        this.lastReadMessage = {
          guid: message.message_guid,
          created_at: new Date(message.created_at),
        };
        message.is_read = true;
      }
    },

    calculateNewMessagesCountForChat () {
      // Use reduce to count unread messages for the specified user
      // ignore read status of own messages
      const userStore = useUserStore();

      return this.currentChatMessages.reduce((count, message) => {
        if (message.user_guid !== userStore.currentUser.userGUID && !message.is_read) {
          return count + 1;
        } else {
          return count;
        }
      }, 0);
    },
  },
});
