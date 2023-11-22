import { defineStore } from "pinia";
import axios from "@/api/axios";
import { useMessageStore } from "@/store/messageStore";
import { useObserverStore } from "@/store/observerStore";

export const useChatStore = defineStore("chat", {
  state: () => {
    return {
      directChats: [],
      chatSelected: false,
      currentChatGUID: "",
      currentFriendUserName: "",
      currentFriendGUID: "",
      friendStatus: "offline",
      inputLocked: false,
      friendTyping: false,
      friendTypingTimer: null,
      meTyping: false,
      meTypingTimer: null,
      chatWindow: null,
      isBottom: true,
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
      this.chatWindow.addEventListener("scroll", this.handleScroll);
    },

    removeWindowScrollHandler() {
      // Check if the event listener is attached before removing it
      if (this.chatWindow) {
        this.chatWindow.removeEventListener("scroll", this.handleScroll);
      }
    },
    scrollToBottom() {
      this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
      this.isBottom = true;
    },

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

    async loadChat(directChat) {
      const messageStore = useMessageStore();
      const observerStore = useObserverStore();

      const chatGUID = directChat.chat_guid;

      // don't do anything if clicked on currently selected chat
      if (this.currentChatGUID === chatGUID) return;

      this.chatSelected = true; // important
      this.currentFriendUserName = directChat.friend.username;
      this.currentFriendGUID = directChat.friend.guid;

      messageStore.clearMoreMessagesToLoad();

      this.removeWindowScrollHandler();

      // clear status, friendIsTyping, last read message
      this.clearFriendStatus();
      this.friendTyping = false;
      messageStore.clearLastReadMessage();

      // Logic related to working with user without Chat
      if (chatGUID === "unassigned") {
        this.currentChatGUID = "unassigned";
        messageStore.clearCurrentChatMessages();
        return;
      }
      // Start observer before messages are loaded
      // disconnect old observer and initialize new
      observerStore.disconnectObserver();
      observerStore.initializeObserver();

      // load messages -> means currentChatMessages is updated
      await messageStore.getLastMessages(chatGUID);

      // recalculate new messages count for chat based on newly loaded messages
      directChat.new_messages_count =
        messageStore.calculateNewMessagesCountForChat();

      // chatWindow full of messages is available after messages are loaded
      this.addWindowScrollHandler();

      this.setChatAsActive(chatGUID);

      // traverse through each message to find earliest unread message
      messageStore.setIndexOfEarliestUnreadMessage();

      // scroll to earliest unread message or bottom
      if (messageStore.getEarliestUnreadMessageIndex !== false) {
        const unreadMessageToScroll =
        this.chatWindow.children[messageStore.getEarliestUnreadMessageIndex].lastElementChild;

        unreadMessageToScroll.scrollIntoView({ behavior: 'auto', block: 'start' });

      } else {
        // scroll to bottom if chatWindow is set
        if (this.chatWindow) {
          this.scrollToBottom();
        }
      }
    },

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
  },
});
