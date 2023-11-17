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
      const messageStore = useMessageStore()

      try {
        this.socket = new WebSocket("ws://localhost:8001/ws/");

        this.socket.addEventListener("open", () => {
          console.log("WebSocket connection established.");
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
          messageStore.systemMessage = { type: "error", content: "Websocket connection is disconnected" };
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
      console.log("sending message read via WS");
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
        }

        // // observe only if another user's message and belongs to latest selected chat
        // if (
        //   receivedMessage.user_guid !== userGUID &&
        //   receivedMessage.chat_guid === currentChatGUID.value
        // ) {
        //   console.log(currentChatGUID.value, receivedMessage);
        //   // observe incomming message of other user
        //   setTimeout(() => {
        //     const newMessage = document.getElementById(
        //       `${receivedMessage.message_guid}`
        //     );
        //     console.log("FOUND MESSAGE", newMessage);
        //     observer.value.observe(newMessage);
        //   }, 500); // need to wait before new message is inserted
        // }

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

      if (
        receivedMessage.type === "status" &&
        receivedMessage.username == chatStore.friendUserName
      ) {
        chatStore.friendStatus = receivedMessage.status;
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
