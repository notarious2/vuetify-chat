import { defineStore } from "pinia";
import { useChatStore } from "@/store/chatStore";
import { useMessageStore } from "@/store/messageStore";
import { useUserStore } from "@/store/userStore";

export const useWebsocketStore = defineStore("websocket", {
  state: () => {
    return {
      socket: null,
    };
  },

  actions: {
    async connectWebsocket() {
      const messageStore = useMessageStore();

      try {
        this.socket = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);

        this.socket.addEventListener("open", () => {
          console.log("WebSocket connected");
        });

        this.socket.addEventListener("message", (event) => {
          const receivedMessage = JSON.parse(event.data);
          this.handleNewMessage(receivedMessage);
          this.handleFriendTyping(receivedMessage);
          this.handleStatusMessage(receivedMessage);
          this.handleMessageRead(receivedMessage);
        });

        this.socket.addEventListener("close", (event) => {
          console.log("WebSocket connection closed.", event);
          messageStore.systemMessage = {
            type: "error",
            content: "Websocket disconnected",
          };
        });
      } catch (error) {
        console.log("Error during connecting to Websocket", error);
        throw error;
      }
    },

    async sendMessage(message) {
      const chatStore = useChatStore();
      const userStore = useUserStore();
      // Must first create a chat for unassigned chat
      if (chatStore.currentChatGUID === "unassigned") {
        const friendGUID = chatStore.directChats[0].friend.guid;
        const newChat = await chatStore.createDirectChat(friendGUID);
        // update unassigned chat based on new chat data
        chatStore.directChats[0].chat_guid = newChat.guid;
        chatStore.directChats[0].created_at = newChat.created_at;
        chatStore.directChats[0].updated_at = newChat.updated_at;
        chatStore.currentChatGUID = newChat.guid;
      }

      // Must check that WebSocket connection exists and the message is not empty before calling
      console.log("Sending message via WS", message);

      await this.socket.send(
        JSON.stringify({
          type: "new_message",
          user_guid: userStore.currentUser.userGUID,
          chat_guid: chatStore.currentChatGUID,
          content: message,
        })
      );
    },

    async sendMessageRead(message) {
      console.log("Sending Message Read via Websocket");
      await this.socket.send(
        JSON.stringify({
          type: "message_read",
          chat_guid: message.chat_guid,
          message_guid: message.message_guid,
        })
      );
    },

    handleNewMessage(receivedMessage) {
      const chatStore = useChatStore();
      const messageStore = useMessageStore();
      const userStore = useUserStore();

      if (receivedMessage.type === "new") {
        // release input lock
        chatStore.inputLocked = false;

        // change date on left panel (users)
        const foundChat = chatStore.directChats.find(
          (directChat) => directChat.chat_guid === receivedMessage.chat_guid
        );

        if (foundChat) {
          foundChat.updated_at = receivedMessage.created_at;
        }

        // append new message to the open chat
        if (receivedMessage.chat_guid === chatStore.currentChatGUID) {
          messageStore.currentChatMessages.unshift(receivedMessage);
          // scroll to bottom if own message
          if (receivedMessage.user_guid === userStore.currentUser.userGUID) {
            chatStore.scrollToBottom();
          }

        }

        if (receivedMessage.user_guid !== userStore.currentUser.userGUID) {
          // find chat and increment new_message_count for chat by +1
          const foundChat = chatStore.directChats.find(
            (obj) => obj.chat_guid === receivedMessage.chat_guid
          );
          if (foundChat) {
            foundChat.new_messages_count++;
          }
          // set friend is typing to false
          chatStore.friendTyping = false;
        }
      }
    },

    async handleUserTyping() {
      const chatStore = useChatStore();
      const userStore = useUserStore();

      // should not send for not yet created chat
      if (chatStore.currentChatGUID === "unassigned") {
        return;
      }
      // ignore if meTyping, else send message and change meTyping to false after timeout
      if (chatStore.meTyping === false) {
        chatStore.meTyping = true;

        await this.socket.send(
          JSON.stringify({
            type: "user_typing",
            user_guid: userStore.currentUser.userGUID,
            chat_guid: chatStore.currentChatGUID,
          })
        );

        chatStore.timeoutMeTyping();
      }
    },

    async handleFriendTyping(receivedMessage) {
      const chatStore = useChatStore();
      const userStore = useUserStore();
      //
      if (
        receivedMessage.type === "user_typing" &&
        receivedMessage.user_guid !== userStore.currentUser.userGUID &&
        receivedMessage.chat_guid === chatStore.currentChatGUID
      ) {
        // avoid setting friendIsTyping to false if new message was received
        chatStore.stopTimeoutFriendTyping();
        chatStore.friendTyping = true;
        chatStore.timeoutFriendTyping();
      }
    },

    handleStatusMessage(receivedMessage) {
      const chatStore = useChatStore();
      const userStore = useUserStore();

      if (receivedMessage.type === "status") {

        // TODO: Probably not needed anymore
        if (receivedMessage.username === chatStore.currentFriendUserName) {
          chatStore.friendStatus = receivedMessage.status;
        }

        if (receivedMessage.user_guid !== userStore.currentUser.userGUID) {
          userStore.updateFriendStatus(receivedMessage.user_guid, receivedMessage.status)
        }

      }
    },

    handleMessageRead(receivedMessage) {
      // function is used to update read status of own messages read by another user
      const userStore = useUserStore();
      const messageStore = useMessageStore();
      if (
        receivedMessage.type === "message_read" &&
        receivedMessage.user_guid !== userStore.currentUser.userGUID
      ) {
        messageStore.updateMessagesReadStatus(
          receivedMessage.last_read_message_created_at
        );
      }
    },
  },
});
