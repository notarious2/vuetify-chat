<template>
  <v-container>
    <v-row no-gutters>
      <!-- LEFT PANEL START -->
      <v-col cols="4" class="bg-teal-lighten-5 rounded-s-lg">
        <MenuPanel />
        <div v-if="isChat" style="height: 580px; overflow: auto" class="bg-teal-lighten-5 rounded-0">
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
        <ContactList v-if="isSearch" />
      </v-col>
      <!-- LEFT PANEL CHATS END -->

      <!-- RIGHT PANEL START -->
      <v-col v-if="isChat && chatSelected">
        <ChatBoxHeader />
        <!-- MAIN CHAT START -->
        <v-card class="rounded-0" id="message-container">
          <div id="container" ref="chatWindow">
            <div v-if="inputLocked" class="d-flex justify-end mr-10">
              <v-progress-circular indeterminate color="teal"></v-progress-circular>
            </div>
            <div v-for="(message, index) in currentChatMessages" :key="message.message_guid">
              <div v-if="showDateBreak(index)" class="text-center text-black my-2 font-weight-medium">
                {{ formatDate(message.created_at) }}
                <v-divider class="mt-2 mx-auto border-opacity-75" width="200px" color="teal" thickness="2px"></v-divider>
              </div>
              <SpeakerBubble v-if="message.user_guid === userGUID" class="ml-auto mr-2">
                <v-list-item class="py-2 my-3 text-right">
                  <v-list-item-title class="text-wrap">{{ message.content }}</v-list-item-title>

                  <v-list-item-subtitle class="mt-1">
                    {{ formatTimestamp(message.created_at) }}
                    <v-icon v-if="message.user_guid === userGUID"
                      :class="message.is_read ? 'text-blue' : 'text-gray'">mdi-check-all</v-icon>
                  </v-list-item-subtitle>
                </v-list-item>
              </SpeakerBubble>
              <PartnerBubble v-else class="ml-2 partner-msg" :id="message.message_guid" :index="index"
                :observer="observer">
                <v-list-item class="py-2 my-3 ml-2 text-left">
                  <v-list-item-title class="text-wrap">{{ message.content }} </v-list-item-title>
                  <v-list-item-subtitle class="mt-2">
                    {{ formatTimestamp(message.created_at) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </PartnerBubble>

            </div>
            <v-btn v-if="moreMessagesToLoad" @click="loadMoreMessages" class="mt-3 mx-auto"
              style="text-transform: none">Load More</v-btn>
          </div>
          <v-btn v-if="!isBottom" icon class="rounded-circle"
            style="position: absolute; top: 88%; right: 5%; width: 35px; height: 35px;" @click="scrollBottom">
            <v-icon size="x-large" color="teal">mdi-chevron-down</v-icon>
          </v-btn>
        </v-card>
        <!-- MAIN CHAT END -->
        <div style="position: relative;">
          <EmojiPicker v-show="showEmoji" style="position: absolute; bottom: 80%;" @select="onSelectEmoji" />
        </div>

        <!-- SEND BUTTON COMPONENT START -->
        <v-card class="rounded-0 rounded-be-lg">
          <v-row align="center" justify="center" no-gutters>

            <v-icon class="ml-2" size="x-large" color="teal" style="transform: rotate(10deg)">mdi-paperclip</v-icon>
            <v-icon class="ml-2 mr-2" size="x-large" color="teal-lighten-2" :class="{ activeEmoji: showEmoji }"
              @click="toggleEmoji">mdi-emoticon-happy-outline</v-icon>
            <!-- @keydown.enter.exact.prevent -> Prevents next line on clicking ENTER -->
            <!-- We should be able to add a new line by pressing SHIFT+ENTER -->
            <v-textarea ref="textInput" hide-details label="Type your text" rows="1" v-model="messageToSend" auto-grow
              variant="solo" @keydown.enter.exact.prevent @keyup.enter.exact.prevent="sendMessage"
              @input="websocketStore.handleUserTyping()" :readonly="inputLocked"></v-textarea>

            <v-btn @click="sendMessage" icon="mdi-send" variant="plain" color="teal" size="x-large" class="ml-2 mb-3"
              style="font-size: 30px; transform: rotate(-5deg)">
            </v-btn>
          </v-row>

          <v-row v-show="friendTyping" class="mb-3 mt-0 ml-5 text-teal-darken-3">typing
            <ThreeDots class="ml-n3" />
          </v-row>
          <v-row v-show="!friendTyping" class="mb-3 mt-0 ml-5">&nbsp;</v-row>
        </v-card>
        <!-- SEND BUTTON COMPONENT END -->
      </v-col>

      <EmptyChatWindow v-else-if="isChat && !chatSelected" />
      <SearchWindow v-else-if="isSearch" />
      <EmptyGroupWindow v-else-if="isGroup" />


      <!-- RIGHT PANEL END -->
    </v-row>
  </v-container>
  <v-alert v-if="Object.keys(systemMessage).length > 0" width="500px" height="70px" :color="systemMessage.type === 'error'
    ? 'pink-accent-2'
    : systemMessage.type === 'system'
      ? 'blue-grey-lighten-2'
      : 'indigo-lighten-2'
    " theme="dark" :icon="systemMessage.type === 'success' ? 'mdi-power-plug' : 'mdi-power-plug-off'"
    class="text-center text-h6 font-weight-bold mx-auto rounded-xl">{{ systemMessage.content }}</v-alert>
</template>

<script setup>
import { ref, watch, onMounted, onUpdated, nextTick, computed } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { useChatStore } from "@/store/chatStore";
import { useMessageStore } from "@/store/messageStore";
import { useMainStore } from "@/store/mainStore";
import { useWebsocketStore } from "@/store/websocketStore";


import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

import {
  formatTimestamp,
  formatDate,
  formatTimeFromDateString,
} from "@/utils/dateUtils";

import PartnerBubble from "@/components/PartnerBubble.vue";
import SpeakerBubble from "@/components/SpeakerBubble.vue";
import ThreeDots from "@/components/ThreeDots.vue";
import EmptyChatWindow from "@/components/EmptyChatWindow.vue";
import EmptyGroupWindow from "@/components/EmptyGroupWindow.vue";
import SearchWindow from "@/components/SearchWindow.vue";
import ContactList from "@/components/ContactList.vue";
import MenuPanel from "@/components/MenuPanel.vue";
import ChatBoxHeader from "@/components/ChatBoxHeader.vue";


const userStore = useUserStore();
const chatStore = useChatStore();
const messageStore = useMessageStore();
const mainStore = useMainStore();
const websocketStore = useWebsocketStore();

const { currentUser } = storeToRefs(userStore);
const { chatSelected, currentChatGUID, directChats, friendUserName, friendStatus, inputLocked, friendTyping } = storeToRefs(chatStore);
const { currentChatMessages, systemMessage } = storeToRefs(messageStore);
const { isSearch, isChat, isGroup } = storeToRefs(mainStore);
const { socket } = storeToRefs(websocketStore);



const showEmoji = ref(false);

const toggleEmoji = () => {
  if (!showEmoji.value) {
    textInput.value.focus()
  }
  showEmoji.value = !showEmoji.value
}

const onSelectEmoji = (emoji) => {
  const cursorPosition = textInput.value.selectionStart;
  // Split the existing message into two parts
  const start = messageToSend.value.slice(0, cursorPosition);
  const end = messageToSend.value.slice(cursorPosition);

  // Insert the selected emoji in between
  messageToSend.value = start + emoji.i + end;

  // must wait for DOM to be updated
  nextTick(() => {
    // Update the cursor position to be at the end of the inserted emoji
    textInput.value.selectionStart = cursorPosition + emoji.i.length;
    textInput.value.selectionEnd = cursorPosition + emoji.i.length;
    // Place focus at the updated cursor position
    textInput.value.focus();
  })
}

// Chat box setup, Messages and Chat Functions
const messageToSend = ref("");
const textInput = ref(null);
const chatWindow = ref(null);
const moreMessagesToLoad = ref(false);


// User Information
const userGUID = currentUser.value.userGUID;


// display scroll to bottom

const isBottom = ref(true)



const sendMessage = async () => {
  if (socket.value.readyState === 1 && messageToSend.value.trim() !== "") {
    await websocketStore.sendMessage(messageToSend.value)
    // Clear the input field
    messageToSend.value = "";
    // make input not editable before receive own message via websocket
    inputLocked.value = true;
  }
}




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


// Functions for Chat Loading
const loadChat = async (directChat) => {

  const chatGUID = directChat.chat_guid;
  chatSelected.value = true;
  friendUserName.value = directChat.friend.username;
  moreMessagesToLoad.value = false;

  messageStore.clearLastReadMessage();

  // Logic related to working with user without Chat
  console.log("CHAT GUID", directChat);
  if (directChat.chat_guid === "unassigned") {
    console.log("HERE");
    currentChatGUID.value = "unassigned";
    currentChatMessages.value = [];
    moreMessagesToLoad.value = false;
    return
  }

  try {
    const getLastMessagesResponse = await messageStore.getLastMessages(
      chatGUID
    );
    console.log("getMessages", getLastMessagesResponse);

    currentChatMessages.value = getLastMessagesResponse.messages;
    moreMessagesToLoad.value = getLastMessagesResponse.has_more_messages;

    // recalculate new messages count from newly loaded messages

    directChat.new_messages_count = calculateNewMessagesCountForChat(
      getLastMessagesResponse.messages,
      userGUID
    );

    if (getLastMessagesResponse.last_read_message) {
      messageStore.setLastReadMessage(getLastMessagesResponse.last_read_message);
    } else {
      messageStore.clearLastReadMessage();
    }
  } catch (error) {
    console.log("Error in loadChat", error);
  }
  chatWindow.value.removeEventListener("scroll", handleScroll)
  chatWindow.value.addEventListener('scroll', handleScroll);

  // do not clear status, friendIsTyping if clicked the same chat
  // clear if friend was typing in previous chat
  console.log("SWITCHED TABS, GUID", currentChatGUID.value === directChat.chat_guid);
  if (currentChatGUID.value !== chatGUID) {
    chatStore.clearFriendStatus();
    friendTyping.value = false;
  }
  chatStore.setChatAsActive(chatGUID);

  // disconnect observer if there is any from the previous chat
  if (observer.value) {
    observer.value.disconnect();
  }
  initializeObserver();
};


const initializeObserver = () => {
  observer.value = new IntersectionObserver(onElementObserved, {
    root: chatWindow.value,
    threshold: 1.0,
  });
};

const activeTab = ref(true);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    activeTab.value = false;
  } else {
    activeTab.value = true;
  }
});


/**
 * Marks a message as read and updates the last read message information.
 * Assumes the message is not read and is from another user
 * @param {Object} message - The message to mark as read.
 */
const markMessageAsRead = async (message) => {
  // Check if there is no previous last read message or if the current message is newer
  const isCurrentMessageNewer = messageStore.lastReadMessage.length === 0 ||
    new Date(message.created_at) >= messageStore.lastReadMessage.created_at;

  // If the message is newer or no previous last read message,
  // mark it as read and update last read information
  if (isCurrentMessageNewer) {
    // Send a WebSocket message indicating that the message has been read
    await websocketStore.sendMessageRead(message);

    // Update the last read message information
    messageStore.lastReadMessage = {
      guid: message.message_guid,
      created_at: new Date(message.created_at),
    };
    message.is_read = true;
  }
};


const calculateNewMessagesCountForChat = (messages, userGUID) => {
  // Use reduce to count unread messages for the specified user
  // ignore read status of own messages

  return messages.reduce((count, message) => {
    if (message.user_guid !== userGUID && !message.is_read) {
      return count + 1;
    } else {
      return count;
    }
  }, 0);
};

const onElementObserved = async (entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) {
      continue;
    }
    observer.value.unobserve(entry.target);

    const messageIndex = entry.target.getAttribute("index");
    const message = currentChatMessages.value[messageIndex];

    if (message.is_read) {
      console.log("Already read message:", message.content);
    } else {
      await markMessageAsRead(message);
      console.log("Marking message as read...");

      // find chat and decrement read_messages count by 1
      const foundChatIndex = directChats.value.findIndex(
        (chat) => chat.chat_guid === message.chat_guid
      );

      if (foundChatIndex !== -1) {
        directChats.value[foundChatIndex].new_messages_count--;
      }
    }
  }
};




onMounted(async () => {
  directChats.value = await chatStore.getDirectChats(
    currentUser.value.userGUID
  );
  await websocketStore.connectWebsocket()
  systemMessage.value = { type: "success", content: "Websocket connection is established" };
  // Set a timeout to clear the systemMessage after 2 seconds
  setTimeout(() => {
    systemMessage.value = {};
  }, 3000);

});

const observer = ref(null);

onUpdated(() => {
  console.log("Updated");
});


const scrollBottom = () => {
  chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
}

const handleScroll = () => {
  if (chatWindow.value.scrollTop >= -50) {
    isBottom.value = true;
  } else {
    isBottom.value = false;
  }
}


</script>

<style scoped>
#container {
  height: 500px;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
}


.activeEmoji {
  color: #009688 !important;
}
</style>
