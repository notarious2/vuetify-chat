import { defineStore } from "pinia";
import { useMessageStore } from "@/store/messageStore";
import { useChatStore } from "@/store/chatStore";

export const useObserverStore = defineStore("observer", {
  state: () => {
    return {
      observer: null,
    };
  },
  actions: {
    initializeObserver() {
      const chatStore = useChatStore();

      this.observer = new IntersectionObserver(this.onElementObserved, {
        root: chatStore.chatWindow,
        threshold: 1.0,
      });
    },

    disconnectObserver() {
      if (this.observer) {
        this.observer.disconnect();
      }
    },

    async onElementObserved(entries) {
      const messageStore = useMessageStore();
      const chatStore = useChatStore();

      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        this.observer.unobserve(entry.target);

        const messageIndex = entry.target.getAttribute("index");
        const message = messageStore.currentChatMessages[messageIndex];

        if (message.is_read) {
          console.log("Already read message:", message.content);
        } else {
          await messageStore.markMessageAsRead(message);
          console.log("Marking message as read:", message.content);

          // find chat and decrement read_messages count by 1
          const foundChatIndex = chatStore.directChats.findIndex(
            (chat) => chat.chat_guid === message.chat_guid
          );

          if (foundChatIndex !== -1) {
            chatStore.directChats[foundChatIndex].new_messages_count--;
          }
        }
      }
    },
  },
});
