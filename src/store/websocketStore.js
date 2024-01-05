import { defineStore } from "pinia";
import { useChatStore } from "@/store/chatStore";
import { useMessageStore } from "@/store/messageStore";
import { useUserStore } from "@/store/userStore";

export const useWebsocketStore = defineStore("websocket", {
  state: () => {
    return {
      socket: null,
      reconnectAttempted: false,
    };
  },

  actions: {
    async connectWebsocket() {
      let websocketURL = import.meta.env.VITE_WEBSOCKET_URL;
      const messageStore = useMessageStore();

      try {
        this.socket = new WebSocket(websocketURL);

        this.socket.addEventListener("open", () => {
          // display message for reconnection
          if (this.reconnectAttempted) {
            this.reconnectAttempted = false;
            messageStore.displaySystemMessage(
              "success",
              "Websocket connection re-established",
              2000
            );
          }
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
          if (!this.reconnectAttempted && event.reason !== "User logout") {
            messageStore.displaySystemMessage(
              "error",
              "Websocket disconnected"
            );

            // Attempt to reconnect only once
            // after 1 second
            setTimeout(() => {
              messageStore.displaySystemMessage(
                "success",
                "Reconnecting to websocket"
              );
              this.connectWebsocket(); // Reconnect
              this.reconnectAttempted = true;
            }, 1000);
          } else {
            // nullify socket variable
            this.socket = null;
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
        // find friend guid -> cannot assume that it is the first element in array!
        const friendGUID = chatStore.currentFriendGUID;
        const newChat = await chatStore.createDirectChat(friendGUID);
        // find unassigned chat from directChats and update unassigned chat based on new chat data
        const unassignedChat = chatStore.directChats.find(
          (chat) => chat.chat_guid === "unassigned"
        );
        if (unassignedChat) {
          unassignedChat.chat_guid = newChat.guid;
          unassignedChat.created_at = newChat.created_at;
          unassignedChat.updated_at = newChat.updated_at;
          chatStore.currentChatGUID = newChat.guid;
        } else {
          console.log("No unassigned Chat found");
        }
      }
      // Must check that WebSocket connection exists and the message is not empty before calling
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
          
          // Change data in temporary message
          // assumes can hold only 1 temporary chat
          // hence, replaces the first element
          if (isMessageFromCurrentUser) {
            // if own message has message.guid => message sent by current WS connection
            // TODO: should we check if first message being retrieved belongs to the current user?
            if (!messageStore.currentChatMessages[0].message_guid) {
              messageStore.currentChatMessages[0].is_sending = false;
              messageStore.currentChatMessages[0].message_guid =
                receivedMessage.message_guid;
              messageStore.currentChatMessages[0].created_at =
                receivedMessage.created_at;
            } else {
              // it is own message sent from other WS connection => append whole message
              messageStore.currentChatMessages.unshift(receivedMessage)
            }
          } else {
            messageStore.currentChatMessages.unshift(receivedMessage);
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
      // it also sends back data to backend to subscribe user to chat and add guid/id to chats

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
    socketExists: (state) => state.socket,
  },
});
