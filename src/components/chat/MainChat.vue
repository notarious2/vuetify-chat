<template>
  <v-card class="rounded-0" id="message-container">
    <div id="container" ref="chatWindow">
      <div v-if="inputLocked" class="d-flex justify-end mr-10">
        <v-progress-circular indeterminate color="teal"></v-progress-circular>
      </div>
      <div
        v-for="(message, index) in currentChatMessages"
        :key="message.message_guid"
      >
        <div
          v-show="showDateBreak(index)"
          class="text-center text-black my-2 font-weight-medium"
        >
          {{ formatDate(message.created_at) }}
          <v-divider
            class="mt-2 mx-auto border-opacity-75"
            width="200px"
            color="teal"
            thickness="2px"
          ></v-divider>
        </div>

        <div v-show="earliestUnreadMessageIndex === index" class="bg-teal-lighten-5 text-center py-2"><p class="text-teal font-weight-medium">Unread messages</p></div>
        <SpeakerBubble
          v-if="message.user_guid === currentUser.userGUID"
          class="ml-auto mr-2"
        >
          <v-list-item class="py-2 my-3 text-right">
            <v-list-item-title class="text-wrap">{{
              message.content
            }}</v-list-item-title>

            <v-list-item-subtitle class="mt-1">
              {{ formatTimestamp(message.created_at) }}
              <v-icon
                v-if="message.user_guid === currentUser.userGUID"
                :class="message.is_read ? 'text-blue' : 'text-gray'"
                >mdi-check-all</v-icon
              >
            </v-list-item-subtitle>
          </v-list-item>
        </SpeakerBubble>
        <!-- to scroll to unread messages label: scroll-margin: 50px; -->
        <PartnerBubble
          v-else
          style="scroll-margin: 50px;"
          class="ml-2 partner-msg"
          :id="message.message_guid"
          :index="index"
        >
          <v-list-item class="py-2 my-3 ml-2 text-left">
            <v-list-item-title class="text-wrap"
              >{{ message.content }}
            </v-list-item-title>
            <v-list-item-subtitle class="mt-2">
              {{ formatTimestamp(message.created_at) }}
            </v-list-item-subtitle>
          </v-list-item>
        </PartnerBubble>
      </div>
      <v-btn
        v-if="moreMessagesToLoad"
        @click="loadMoreMessages"
        class="mt-3 mx-auto"
        style="text-transform: none"
        >Load More</v-btn
      >
    </div>
    <v-btn
      v-show="!isBottom"
      icon
      class="rounded-circle"
      style="position: absolute; top: 88%; right: 5%; width: 35px; height: 35px"
      @click="chatStore.scrollToBottom"
    >
      <v-icon size="x-large" color="teal">mdi-chevron-down</v-icon>
    </v-btn>
  </v-card>
</template>


<script setup>
import { onMounted, ref } from "vue";

import PartnerBubble from "@/components/chat/PartnerBubble.vue";
import SpeakerBubble from "@/components/chat/SpeakerBubble.vue";

import { storeToRefs } from "pinia";

import { useUserStore } from "@/store/userStore";
import { useChatStore } from "@/store/chatStore";
import { useMessageStore } from "@/store/messageStore";
import { useObserverStore } from "@/store/observerStore";


const userStore = useUserStore();
const chatStore = useChatStore();
const messageStore = useMessageStore();
const observerStore = useObserverStore();


const { currentUser } = storeToRefs(userStore);
const { currentChatGUID, isBottom, inputLocked } = storeToRefs(chatStore);
const { currentChatMessages, moreMessagesToLoad, earliestUnreadMessageIndex } = storeToRefs(messageStore);

import {
  formatTimestamp,
  formatDate,
} from "@/utils/dateUtils";


const chatWindow = ref(null);

const showDateBreak = (index) => {
  const messages = currentChatMessages.value;
  if (index === messages.length - 1) {
    // Always show a date break for the first message
    return true;
  }
  // Compare the date of the current message with the previous message
  const currentDate = new Date(
    currentChatMessages.value[index].created_at
  ).toDateString();
  const nextDate = new Date(
    currentChatMessages.value[index + 1].created_at
  ).toDateString();

  return currentDate !== nextDate;
};


// Function for Loading older messages
const loadMoreMessages = async () => {
  try {
    const lastMessageGUID =
      currentChatMessages.value[currentChatMessages.value.length - 1]["message_guid"];

    const getHistoricalMessagesResponse =
      await messageStore.getHistoricalMessages(
        currentChatGUID.value,
        lastMessageGUID
      );
    // append existing allMessages
    const oldMessages = getHistoricalMessagesResponse.messages;
    oldMessages.forEach((oldMessage) => {
      currentChatMessages.value.push(oldMessage);
    });
    moreMessagesToLoad.value = getHistoricalMessagesResponse.has_more_messages;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};


onMounted(() => {
  // remove old scroll listener and observer
  chatStore.removeWindowScrollHandler();
  chatStore.setChatWindow(chatWindow.value);
  observerStore.disconnectObserver();
  
  // add new scroll listener and observer
  chatStore.addWindowScrollHandler();
  observerStore.initializeObserver();
});
</script>


<style scoped>
#container {
  height: 500px;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
}

/* Styling the scrollbar */
#container::-webkit-scrollbar {
  width: 19px; /* Width of the entire scrollbar */
}

#container::-webkit-scrollbar-track {
  background: #b2e6e1; /* Color of the track (the area behind the thumb) */

}

#container::-webkit-scrollbar-thumb {
  background-color: teal; /* Color of the thumb (the draggable part) */
  border-radius: 6px; /* Roundness of the thumb */
}
</style>