import { defineStore } from "pinia";
import axios from "@/api/axios";
import { useMessageStore } from "@/store/messageStore";
import { useObserverStore } from "@/store/observerStore";
import { nextTick } from "vue";

export const useChatStore = defineStore("chat", {
  state: () => {
    return {
      directChats: [],
      chatSelected: false,
      currentChatGUID: "",
      currentFriendUserName: "",
      currentFriendFirstName: "",
      currentFriendGUID: "",
      currentFriendImage: "",
      currentFriendImageError: false,
      friendStatus: "offline",
      inputLocked: false,
      friendTyping: false,
      friendTypingTimer: null,
      meTyping: false,
      meTypingTimer: null,
      chatWindow: null,
      isBottom: true,
      totalUnreadMessagesCount: 0,
    };
  },

  actions: {
    setChatWindow(chatWindow) {
      this.chatWindow = chatWindow;
    },

    handleScroll() {
      this.isBottom = this.chatWindow.scrollTop >= -50 ? true : false;
    },

    addWindowScrollHandler() {
      if (this.chatWindow) {
        this.chatWindow.addEventListener("scroll", this.handleScroll);
      } else {
        console.log("No Chat Window", this.chatWindow);
      }
    },

    removeWindowScrollHandler() {
      // Check if the event listener is attached before removing it
      if (this.chatWindow) {
        this.chatWindow.removeEventListener("scroll", this.handleScroll);
      }
    },
    scrollToBottom(behavior) {
      if (this.chatWindow) {
        this.chatWindow.scrollTo({
          top: this.chatWindow.scrollHeight,
          behavior: behavior,
        });
        this.isBottom = true;
      }
    },

    async deleteDirectChatByGUID(chatGUID) {
      this.directChats = this.directChats.filter(chat => chat.chat_guid !== chatGUID);
    },

    async disselectChat(chatGUID) {
      // disselects particular chat if it is currently selected
      if (this.chatSelected && this.currentChatGUID === chatGUID) {
        this.currentChatGUID = "";
        this.currentFriendUserName = "";
        this.currentFriendFirstName = "",
        this.currentFriendGUID = "";
        this.currentFriendImage = "";
        this.currentFriendImageError = false;
        this.friendStatus = "offline";
        this.chatSelected =  false;
      }

    },

    async getDirectChats(userGUID) {
      try {
        const response = await axios.get("/chats/direct/");

        // override current direct chats array
        this.directChats = [];

        const chats = response.data.chats
        this.totalUnreadMessagesCount = response.data.total_unread_messages_count

        chats.forEach((chat) => {
          // leave friend only from chat.users
          const friendInfo = chat.users.find((user) => user.guid !== userGUID);
          // user image error default is false
          friendInfo.imageError = false;

          this.directChats.push({
            chat_guid: chat["chat_guid"],
            created_at: chat["created_at"],
            updated_at: chat["updated_at"],
            friend: friendInfo,
            new_messages_count: chat["new_messages_count"],
          });
        });
      } catch (error) {
        console.error("Error during getting Direct Chats:", error);
        throw error;
      }
    },

    async deleteDirectChat(chatGUID) {
      try {
        const response = await axios.delete(`/chats/direct/${chatGUID}/`);
        // reconstruct directChats not including deleted chat
        await this.deleteDirectChatByGUID(chatGUID);

        return response.status === 204
      } catch (error) {
        console.error("Error during getting Direct Chats:", error);
        throw error;
      }
    },

    async loadChat(directChat) {
      const messageStore = useMessageStore();
      const observerStore = useObserverStore();

      messageStore.loadingMessages = true;
      this.chatSelected = true; // important
      // display loading messages

      this.currentFriendImageError = false;
      // reset isBottom (when switching from another tab)
      this.isBottom = true;


      const chatGUID = directChat.chat_guid;

      this.setChatAsActive(chatGUID);
      messageStore.clearCurrentChatMessages()


      // don't do anything if clicked on currently selected chat
      // if (this.currentChatGUID === chatGUID) return;

      this.currentFriendUserName = directChat.friend.username;
      this.currentFriendFirstName = directChat.friend.first_name;
      this.currentFriendGUID = directChat.friend.guid;
      this.currentFriendImage = directChat.friend.user_image;

      messageStore.clearMoreMessagesToLoad();

      // clear status, friendIsTyping, last read message
      this.clearFriendStatus();
      this.friendTyping = false;
      messageStore.clearLastReadMessage();

      // Logic related to working with user without Chat
      if (chatGUID === "unassigned") {
        this.currentChatGUID = "unassigned";
        messageStore.clearCurrentChatMessages();
        // remove loading messages flag
        messageStore.loadingMessages = false;
        return;
      }

      // Start observer before messages are loaded
      // disconnect old observer and initialize new
      observerStore.disconnectObserver();
      observerStore.initializeObserver();

      // load messages -> means currentChatMessages is updated
      await messageStore.getLastMessages(chatGUID);

      // remove loading messages flag
      messageStore.loadingMessages = false;

      // recalculate new messages count for chat based on newly loaded messages
      directChat.new_messages_count =
        messageStore.calculateNewMessagesCountForChat();


      // traverse through each message to find earliest unread message
      messageStore.setIndexOfEarliestUnreadMessage();

      // scroll to earliest unread message or bottom
      // wait for DOM to update
      nextTick(() => {
        if (messageStore.getEarliestUnreadMessageIndex !== false) {
          const unreadMessageToScroll =
            this.chatWindow.children[messageStore.getEarliestUnreadMessageIndex]
              .lastElementChild;

          unreadMessageToScroll.scrollIntoView({
            behavior: "auto",
            block: "start",
          });
        } else {
          // scroll to bottom if chatWindow is set
          if (this.chatWindow) {
            this.scrollToBottom("instant");
          }
        }
      })
    },
    calculateTotalUnreadMessagesCount() {
      this.totalUnreadMessagesCount = this.directChats.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.new_messages_count;
      }, 0); },


    removeUnassignedChat() {
      if (
        this.directChats.length > 0 &&
        this.directChats[0].chat_guid === "unassigned"
      ) {
        this.directChats.shift();
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

    addNewChat(newChat) {
      if (this.directChatContainsChat(newChat.chat_guid)) {
        return
      }
      this.directChats.push(newChat)
      // new chat is added with a single message
      this.totalUnreadMessagesCount++
    },

    directChatContainsChat(chatGUID) {
      return this.directChats.some(obj => obj.chat_guid === chatGUID);
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
    },
  },
  getters: {
    getChatWindow: (state) => state.chatWindow,
    getUnreadMessagesforChat: (state) => (chatGUID) => {
      const foundChat = state.directChats.find(
        (chat) => chat.chat_guid === chatGUID
      );
      return foundChat ? foundChat.new_messages_count : 0; // Return new_messages_count or a default value if chat is not found
    },
  },
});
