import { defineStore } from "pinia";
import { useChatStore } from "@/store/chatStore";
import { useMessageStore } from "@/store/messageStore";
import { useUserStore } from "@/store/userStore";
import { nextTick  } from 'vue';


export const useWebsocketStore = defineStore("websocket", {
  state: () => {
    return {
      socket: null,
    };
  },

  actions: {
    async connectWebsocket() {
      let websocketURL = import.meta.env.VITE_WEBSOCKET_URL;
      const messageStore = useMessageStore();

      try {
        this.socket = new WebSocket(websocketURL);

        this.socket.addEventListener("open", () => {
          console.log("WebSocket connected");
        });

        this.socket.addEventListener("message", (event) => {
          const receivedMessage = JSON.parse(event.data);
          this.handleNewMessage(receivedMessage);
          this.handleFriendTyping(receivedMessage);
          this.handleStatusMessage(receivedMessage);
          this.handleMessageRead(receivedMessage);
          this.handleNewChatCreated(receivedMessage);
        });

        this.socket.addEventListener("close", (event) => {
          console.log("WebSocket connection closed.", event);
          if (event.reason !== "User logout") {
            messageStore.systemMessage = {
              type: "error",
              content: "Websocket disconnected",
            };
          }
        });
      } catch (error) {
        console.log("Error during connecting to Websocket", error);
        throw error;
      }
    },

    async disconnectWebsocket(reason) {
      if (this.socket && reason === "logout") {
        this.socket.close(1000, "User logout");
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
        const isMessageFromCurrentUser =
          receivedMessage.user_guid === userStore.currentUser.userGUID;

        const foundChatIndex = chatStore.directChats.findIndex(
          (directChat) => directChat.chat_guid === receivedMessage.chat_guid
        );
        // check if index is found
        if (foundChatIndex !== -1) {
          const foundChat = chatStore.directChats[foundChatIndex];
          // update updated_at (for chats list on left panel)
          foundChat.updated_at = receivedMessage.created_at;
          // increment new message count for chat and all chats if not own message
          if (!isMessageFromCurrentUser) {
            foundChat.new_messages_count++;
            chatStore.totalUnreadMessagesCount++;
            chatStore.friendTyping = false;
          }

          // Unshift the found chat to the beginning of the array
          // if it is not already on top
          if (foundChatIndex !== 0) {
            // Remove the found chat from its current position
            chatStore.directChats.splice(foundChatIndex, 1);
            chatStore.directChats.unshift(foundChat);
          }
        }

        // append new message to the open chat if new message belongs to current chat
        if (receivedMessage.chat_guid === chatStore.currentChatGUID) {
          messageStore.currentChatMessages.unshift(receivedMessage);
          // scroll to bottom if own message
          if (isMessageFromCurrentUser) {
            // wait for DOM to update
            nextTick(() => {
              chatStore.scrollToBottom("smooth");
            })
          }
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
      const userStore = useUserStore();

      if (receivedMessage.type === "status") {
        // ignore own messages
        if (userStore.currentUser.userGUID === receivedMessage.user_guid) {
          return;
        }
        userStore.updateFriendStatus(
          receivedMessage.user_guid,
          receivedMessage.status
        );
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

    async handleNewChatCreated(receivedMessage) {
      // function is used to add new direct chat initiated by another user
      // while current user still have not refreshed direct chats
      // it also send back data to backend to subscribe user to chat and add guid/id to chats

      const chatStore = useChatStore();
      const userStore = useUserStore();
      if (receivedMessage.type === "new_chat_created") {
        delete receivedMessage.type;
        // needed to send data backend [add guid/id pair to chats]
        const chatGUID = receivedMessage.chat_guid;
        const chatID = receivedMessage.chat_id;
        delete receivedMessage.chat_id; // remove to not show in frontend
        await this.socket.send(
          JSON.stringify({
            type: "add_user_to_chat",
            chat_id: chatID,
            chat_guid: chatGUID,
          })
        );
        // make friend's status online
        userStore.updateFriendStatus(receivedMessage.friend.guid, "online");
        // add chat
        chatStore.addNewChat(receivedMessage);
      }
    },
  },
  getters: {
    socketExists: (state) => state.socket
  }
});
