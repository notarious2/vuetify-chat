<template>
        <div style="height: 580px; overflow: auto" class="bg-teal-lighten-5 rounded-0">
          <v-list class="bg-teal-lighten-5" v-for="directChat in directChats">
            <v-list-item class="px-2" @click="loadChat(directChat)">
              <v-list-item-title class="d-flex align-center py-2 rounded-lg"
                :class="{ 'bg-teal-lighten-1': currentChatGUID === directChat.chat_guid }">
                <v-avatar class="ml-2 mr-5">
                  <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John"></v-img>
                </v-avatar>
                <p>{{ directChat.friend.username }}</p>
                <p v-if="directChat.new_messages_count"
                  class="ml-10 bg-teal-lighten-4 font-weight-regular rounded-circle px-2">
                  {{ directChat.new_messages_count }}
                </p>
                <p class="ml-auto mr-2">
                  {{ formatTimeFromDateString(directChat.updated_at) }}
                </p>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
</template>

<script setup>
import { ref, onMounted, onUpdated, nextTick } from "vue";
import { storeToRefs } from "pinia";
import {formatTimeFromDateString} from "@/utils/dateUtils";
import { useChatStore } from "@/store/chatStore";
import { useObserverStore } from "@/store/observerStore";
import { useMessageStore } from "@/store/messageStore";
import { useUserStore } from "@/store/userStore";
const userStore = useUserStore();


const chatStore = useChatStore();
const observerStore = useObserverStore();
const messageStore = useMessageStore();



const { chatSelected, currentChatGUID, directChats, friendUserName, inputLocked, friendTyping } = storeToRefs(chatStore);
const { currentChatMessages, systemMessage, moreMessagesToLoad } = storeToRefs(messageStore);
const { currentUser } = storeToRefs(userStore);

const loadChat = async (directChat) => {
  const chatGUID = directChat.chat_guid;

  // don't do anything if clicked on currently selected chat
  if (currentChatGUID.value === chatGUID) return;

  chatSelected.value = true; // important
  friendUserName.value = directChat.friend.username;
  moreMessagesToLoad.value = false;
  
  chatStore.removeWindowScrollHandler();

  // clear status, friendIsTyping, last read message
  chatStore.clearFriendStatus();
  friendTyping.value = false;
  messageStore.clearLastReadMessage();

  // Logic related to working with user without Chat
  if (chatGUID === "unassigned") {
    currentChatGUID.value = "unassigned";
    currentChatMessages.value = [];
    return
  }
  // Start observer before messages are loaded
  // disconnect old observer and initialize new
  observerStore.disconnectObserver();
  observerStore.initializeObserver();

  // load messages
  await messageStore.getLastMessages(chatGUID)

  // recalculate new messages count for chat based on newly loaded messages
  directChat.new_messages_count = messageStore.calculateNewMessagesCountForChat();
  
  // chatWindow full of messages is available after messages are loaded
  chatStore.addWindowScrollHandler();

  chatStore.setChatAsActive(chatGUID);

};

onMounted(async () => {
  await chatStore.getDirectChats(currentUser.value.userGUID);

});
</script>