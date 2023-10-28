<template>
  <v-container>
    <v-row no-gutters>
      <!-- LEFT PANEL START -->
      <v-col cols="4" class="bg-teal-lighten-5 rounded-s-lg">
        <!-- MENU PANEL START -->
        <v-card class="bg-teal-lighten-4 rounded-0 rounded-ts-lg">
          <div class="mt-5 mb-3 d-flex justify-space-around">
            <v-icon
              class="flex-grow-1"
              id="icon-search"
              color="teal-lighten-3"
              :class="{ searchTab: isSearch }"
              @click="toggleSearch"
              >mdi-magnify</v-icon
            >
            <v-icon
              class="flex-grow-1"
              id="icon-chats"
              color="teal-lighten-3"
              :class="{ chatsTab: isChat }"
              @click="toggleChat"
              >mdi-chat</v-icon
            >
            <v-icon
              class="flex-grow-1"
              id="icon-groups"
              color="teal-lighten-3"
              :class="{ groupsTab: isGroup }"
              @click="toggleGroup"
              >mdi-account-group</v-icon
            >
          </div>
          <v-divider />
        </v-card>
        <!-- MENU PANEL END -->
        <!-- LEFT PANEL START -->
        <div
          style="height: 580px; overflow: auto"
          class="bg-teal-lighten-5 rounded-0"
        >
          <v-list class="bg-teal-lighten-5" v-for="directChat in directChats">
            <v-list-item class="px-2" @click="loadChat(directChat)">
              <v-list-item-title class="d-flex align-center py-2 rounded-lg" :class="{'bg-teal-lighten-1': currentChatGUID === directChat.chat_guid}">
                <v-avatar class="ml-2 mr-5">
                  <v-img
                    src="https://cdn.vuetifyjs.com/images/john.jpg"
                    alt="John"
                  ></v-img>
                </v-avatar>

                <p>{{ directChat.friend.username }}</p>
                <p
                  v-if="directChat.new_messages_count"
                  class="ml-10 bg-teal-lighten-4 font-weight-regular rounded-circle px-2"
                >
                  {{ directChat.new_messages_count }}
                </p>
                <p class="ml-auto mr-2">
                  {{ formatTimeFromDateString(directChat.updated_at) }}
                </p>

              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </v-col>
      <!-- LEFT PANEL END -->

      <!-- RIGHT PANEL START -->
      <v-col>
        <!-- MESSAGE BOX HEADING START -->
        <v-card class="rounded-0 rounded-te-lg bg-teal-lighten-3">
          <v-card-title
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <div>
              <v-avatar class="ml-auto">
                <v-img
                  src="https://cdn.vuetifyjs.com/images/john.jpg"
                  alt="John"
                ></v-img>
              </v-avatar>
              <v-icon
                v-if="friendStatus === 'online'"
                size="xs"
                class="mt-5 ml-n1 mb-n2"
                color="success"
                >mdi-checkbox-blank-circle</v-icon
              >
              <v-icon
                v-else-if="friendStatus === 'inactive'"
                size="xs"
                class="mt-5 ml-n1 mb-n2"
                color="orange-lighten-2"
                >mdi-checkbox-blank-circle</v-icon
              >
              <v-icon v-else size="xs" class="mt-5 ml-n1 mb-n2" color="gray"
                >mdi-checkbox-blank-circle-outline</v-icon
              >

              <span class="ml-3">{{ friendUserName }}</span>
            </div>
            <v-icon color="teal">mdi-dots-vertical</v-icon>
          </v-card-title>
        </v-card>
        <!-- MESSAGE BOX HEADING END -->

        <!-- MESSAGES CONTAINER START -->
        <v-card class="rounded-0" id="message-container">
          <div id="container" ref="chatWindow">
            <div
              v-for="(message, index) in allMessages"
              :key="message.message_guid"
            >
              <div
                v-if="showDateBreak(index)"
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
              <speaker-bubble
                v-if="message.user_guid === userGUID"
                class="ml-auto mr-2"
              >
                <v-list-item class="py-2 my-5 text-right">
                  <v-list-item-title class="text-wrap">{{ message.content }}</v-list-item-title>

                  <v-list-item-subtitle class="mt-2">
                    {{ formatTimestamp(message.created_at) }}
                    <v-icon
                      v-if="message.user_guid === userGUID"
                      :class="message.is_read ? 'text-blue' : 'text-gray'"
                      >mdi-check-all</v-icon
                    >
                  </v-list-item-subtitle>
                </v-list-item>
              </speaker-bubble>
              <partner-bubble
                v-else
                class="ml-2 partner-msg"
                :id="message.message_guid"
                :index="index"
                :observer="observer"
              >
                <v-list-item class="py-2 my-5 ml-2 text-left">
                  <v-list-item-title class="text-wrap">{{ message.content }} </v-list-item-title>
                  <v-list-item-subtitle class="mt-2">
                    {{ formatTimestamp(message.created_at) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </partner-bubble>
            </div>
            <v-btn
              v-if="moreMessagesToLoad"
              @click="loadMoreMessages"
              class="mt-3 mx-auto"
              style="text-transform: none"
              >Load More</v-btn
            >
          </div>
          <v-btn v-if="!isBottom" icon class="rounded-circle" style="position: absolute; top: 88%; right: 5%; width: 35px; height: 35px;" @click="scrollBottom">
            <v-icon size="x-large" color="teal">mdi-chevron-down</v-icon>
          </v-btn>
        </v-card>
        <!-- MESSAGES CONTAINER END -->
        <div style="position: relative;">
          <EmojiPicker v-show="showEmoji" style="position: absolute; bottom: 80%;" @select="onSelectEmoji" />
        </div>

        <!-- SEND BUTTON COMPONENT START -->
        <v-card class="rounded-0 rounded-be-lg">

          <v-row align="center" justify="center" no-gutters>

            <v-icon
              class="ml-2"
              size="x-large"
              color="teal"
              style="transform: rotate(10deg)"
              >mdi-paperclip</v-icon
            >
            <v-icon class="ml-2 mr-2" size="x-large" color="teal-lighten-2" :class="{ activeEmoji: showEmoji }" @click="toggleEmoji">mdi-emoticon-happy-outline</v-icon>
            <!-- @keydown.enter.exact.prevent -> Prevents next line on clicking ENTER -->
            <!-- We should be able to add a new line by pressing SHIFT+ENTER -->
            <v-textarea
              ref="textInput"
              hide-details
              label="Type your text"
              rows="1"
              v-model="messageToSend"
              auto-grow
              variant="solo"
              @keydown.enter.exact.prevent
              @keyup.enter.exact.prevent="wsSendMessage"
              @input="handleOwnTyping"
            ></v-textarea>
            <v-btn
              @click="wsSendMessage"
              icon="mdi-send"
              variant="plain"
              color="teal"
              size="x-large"
              class="ml-2 mb-3"
              style="font-size: 30px; transform: rotate(-5deg)"
            >
            </v-btn>
          </v-row>
          <v-row
            v-show="friendIsTyping"
            class="mb-3 mt-0 ml-5 text-teal-darken-3"
            >typing <ThreeDots class="ml-n3"
          /></v-row>
          <v-row v-show="!friendIsTyping" class="mb-3 mt-0 ml-5">&nbsp;</v-row>
        </v-card>
        <!-- SEND BUTTON COMPONENT END -->

        <v-alert
          v-if="displaySystemMessage"
          :color="systemMessage.type === 'error'
            ? 'pink-accent-2'
            : systemMessage.type === 'system'
              ? 'blue-grey-lighten-2'
              : 'indigo-lighten-2'
            "
          theme="dark"
          class="text-center text-h6 font-weight-bold"
          >{{ systemMessage.content }}</v-alert
        >
      </v-col>
      <!-- RIGHT PANEL END -->
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, onUpdated, nextTick, computed } from "vue";
import { useWebSocket } from "@/composables/useWebSocket";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { useChatStore } from "@/store/chatStore";
import { useMessageStore } from "@/store/messageStore";

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


const isSearch = ref(false);
const isChat = ref(true);
const isGroup = ref(false);

const toggleSearch = () => {
  isSearch.value = true;
  isChat.value = false;
  isGroup.value = false;
};
const toggleChat = () => {
  isChat.value = true;
  isSearch.value = false;
  isGroup.value = false;
};
const toggleGroup = () => {
  isGroup.value = true;
  isChat.value = false;
  isSearch.value = false;
};

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



const userStore = useUserStore();
const chatStore = useChatStore();
const messageStore = useMessageStore();

const { currentUser } = storeToRefs(userStore);

// Establish Websocket connection, useWebSocket return socket ref that holds WebSocket object
const { socket } = useWebSocket("ws://localhost:8001/ws/"); // TODO: Make it constant

// Chat box setup, Messages and Chat Functions
const messageToSend = ref("");
const textInput = ref(null);
const chatWindow = ref(null);
const currentChatGUID = ref("");
const allMessages = ref([]);
const displaySystemMessage = ref(false);
const systemMessage = ref({});
const moreMessagesToLoad = ref(false);

// Reference to the last message element
const lastReadMessage = ref({});

// User Information
const userName = currentUser.value.userName;
const userGUID = currentUser.value.userGUID;

// Chat List Management
const directChats = ref([]);
const friendUserName = ref("");

// Status and Message Handling
const friendStatus = ref(false);

// Functions for Message Handling

const meTyping = ref(false);
const meTypingTimer = ref(null);
const friendIsTyping = ref(false);
const friendTypingTimer = ref(false);

// display scroll to bottom

const isBottom = ref(true)

const wsSendTyping = async () => {
  // Check if the WebSocket connection exists and the message is not empty
  await socket.value.send(
    JSON.stringify({
      type: "user_typing",
      user_guid: userGUID,
      chat_guid: currentChatGUID.value,
    })
  );
};

const handleOwnTyping = async () => {
  // if myTyping is still true - ignore
  // else: send message and change meTyping to false after timeout
  if (!meTyping.value) {
    meTyping.value = messageToSend.value.trim() !== "";
    await wsSendTyping();

    meTypingTimer.value = setTimeout(async () => {
      meTyping.value = false;
    }, 1000)
  }

};

const handleFriendTyping = (receivedMessage) => {
  if (
    receivedMessage.type === "user_typing" &&
    receivedMessage.user_guid !== userGUID &&
    receivedMessage.chat_guid === currentChatGUID.value
  ) {
    // avoid setting friendIsTyping to false if new message was received
    clearTimeout(friendTypingTimer.value);
    friendIsTyping.value = true;
    // Set a timeout to reset friendIsTyping to false after 2 seconds
    friendTypingTimer.value = setTimeout(() => {
      friendIsTyping.value = false;
    }, 2000);

  }
};

const showDateBreak = (index) => {
  const messages = allMessages.value;
  if (index === messages.length - 1) {
    // Always show a date break for the first message
    return true;
  }
  // Compare the date of the current message with the previous message
  const currentDate = new Date(
    allMessages.value[index].created_at
  ).toDateString();
  const nextDate = new Date(
    allMessages.value[index + 1].created_at
  ).toDateString();

  return currentDate !== nextDate;
};

// Function for Loading older messages
const loadMoreMessages = async () => {
  try {
    const lastMessageGUID =
      allMessages.value[allMessages.value.length - 1]["message_guid"];

    const getHistoricalMessagesResponse =
      await messageStore.getHistoricalMessages(
        currentChatGUID.value,
        lastMessageGUID
      );
    // append existing allMessages
    const oldMessages = getHistoricalMessagesResponse.messages;
    oldMessages.forEach((oldMessage) => {
      allMessages.value.push(oldMessage);
    });
    moreMessagesToLoad.value = getHistoricalMessagesResponse.has_more_messages;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};

const updateMessagesReadStatus = (messages, lastReadMessageDate) => {
  for (let i = 0; i < messages.value.length; i++) {
    const message = messages.value[i];
    if (
      (new Date(message.created_at) <= new Date(lastReadMessageDate)) &
      (message.user_guid === userGUID)
    ) {
      if (message.is_read) {
        break;
      }
      // introduce 0.5 seconds delay for marking messages as read
      setTimeout(() => {
      messages.value[i].is_read = true;
    }, 500)
    }
  }
};

// Functions for Chat Loading
const loadChat = async (directChat) => {
  const chatGUID = directChat.chat_guid;
  friendUserName.value = directChat.friend.username;

  try {
    const getLastMessagesResponse = await messageStore.getLastMessages(
      chatGUID
    );
    console.log("getMessages", getLastMessagesResponse);

    allMessages.value = getLastMessagesResponse.messages;
    moreMessagesToLoad.value = getLastMessagesResponse.has_more_messages;

    // recalculate new messages count from newly loaded messages

    directChat.new_messages_count = calculateNewMessagesCountForChat(
      getLastMessagesResponse.messages,
      userGUID
    );

    if (getLastMessagesResponse.last_read_message) {
      setLastReadMessage(getLastMessagesResponse.last_read_message);
    } else {
      clearLastReadMessage();
    }
  } catch (error) {
    console.log("Error in loadChat", error);
  }

  setChatAsActive(chatGUID);
  console.log("SWITCHED TABS, GUID", currentChatGUID.value);
  clearFriendStatus();
  // clear if friend was typing in previous chat
  friendIsTyping.value = false;

  // disconnect observer if there is any from the previous chat
  if (observer.value) {
    observer.value.disconnect();
  }
  initializeObserver();
};

const setLastReadMessage = (lastReadMessageData) => {
  lastReadMessage.value.guid = lastReadMessageData.guid;
  lastReadMessage.value.created_at = new Date(lastReadMessageData.created_at);
};

const clearLastReadMessage = () => {
  lastReadMessage.value = {};
};
const setChatAsActive = (chatGUID) => {
  currentChatGUID.value = chatGUID;
};

const clearFriendStatus = () => {
  friendStatus.value = false;
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

// Function to mark a message as "seen"
const wsMarkMessageAsRead = async (message) => {
  console.log("SENDING WS MESSAGE", message.content);
  await socket.value.send(
    JSON.stringify({
      type: "message_read",
      chat_guid: message.chat_guid,
      message_guid: message.message_guid,
    })
  );
};

const markMessageAsRead = async (message) => {
  // assume message is not read and of another user
  console.log("Marking this message as read", message.content);
  // compare with current last_read message
  // if 'unread' message is newer accept it, else mark it as already read
  // console.log("TRIGGERING", lastReadMessage, new Date(message.created_at), lastReadMessage.value.created_at);
  // console.log(!lastReadMessage.value, !lastReadMessage, new Date(message.created_at) >= lastReadMessage.value.created_at);
  if (
    !lastReadMessage.value ||
    new Date(message.created_at) >= lastReadMessage.value.created_at
  ) {
    console.log(
      "TRIGGERING",
      lastReadMessage,
      new Date(message.created_at),
      lastReadMessage.value.created_at
    );
    await wsMarkMessageAsRead(message);
    lastReadMessage.value.guid = message.message_guid;
    lastReadMessage.value.created_at = new Date(message.created_at);
    message.is_read = true;
  } else {
    message.is_read = true;
  }
};

const calculateNewMessagesCountForChat = (messages, userGUID) => {
  // Use reduce to count unread messages for the specified user
  //   // ignore read status of own messages

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
    const msgIndex = entry.target.getAttribute("index");
    const msg = allMessages.value[msgIndex];
    if (msg.is_read) {
      console.log("what message?", msg.is_read, msg);
      console.log("Already read message:", msg.content);
    } else {
      await markMessageAsRead(msg);
      console.log("Marking message as read...");
      // find chat and decrement read_messages count by 1
      const foundChat = directChats.value.find(
        (obj) => obj.chat_guid === msg.chat_guid
      );
      if (foundChat) {
        console.log("FOUND CHAT", foundChat);
        foundChat.new_messages_count--;
      } else {
        console.log("Chat not found.");
      }
    }
  }
};

const handleSystemMessage = (receivedMessage) => {
  if (
    receivedMessage.type === "system" &&
    receivedMessage.username !== userName
  ) {
    systemMessage.value = receivedMessage;
    displaySystemMessage.value = true;
  }
};

const wsSendMessage = async () => {
  if (socket.value && messageToSend.value.trim() !== "") {
    // Check if the WebSocket connection exists and the message is not empty
    await socket.value.send(
      JSON.stringify({
        type: "new_message",
        user_guid: userGUID,
        chat_guid: currentChatGUID.value,
        content: messageToSend.value,
      })
    );
    messageToSend.value = ""; // Clear the input field
    // chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
  }
};

const handleNewMessage = (receivedMessage) => {
  if (receivedMessage.type === "new") {
    console.log("CURRENT CHAT GUID", currentChatGUID.value);
    console.log("RECEIVED NEW MESSAGE", receivedMessage, currentChatGUID.value)
    // append messages to the open chat
    if (receivedMessage.chat_guid === currentChatGUID.value) {
      allMessages.value.unshift(receivedMessage);
    }

    // observe only if another user's message and belongs to latest selected chat
    if (receivedMessage.user_guid !== userGUID && receivedMessage.chat_guid === currentChatGUID.value) {

      console.log(currentChatGUID.value, receivedMessage);
      // observe incomming message of other user
      setTimeout(() => {
        const newMessage = document.getElementById(
          `${receivedMessage.message_guid}`
        );
        console.log("FOUND MESSAGE", newMessage);
        observer.value.observe(newMessage);
      }, 500); // need to wait before new message is inserted
    }

    if (receivedMessage.user_guid !== userGUID) {

      // find chat and increment new_message_count for chat by +1
      const foundChat = directChats.value.find(
        (obj) => obj.chat_guid === receivedMessage.chat_guid
      );
      if (foundChat) {
        foundChat.new_messages_count++;
      } else {
        console.log("Chat not found.", directChats.value, receivedMessage.chat_guid);
      }
      // set friend is typing to false
      console.log("SETTING TYPING TO FALSE...");
      friendIsTyping.value = false;
    }
  }
};

const handleMessageRead = (receivedMessage) => {
  // make sure that user is in the current chat
  if (
    receivedMessage.type === "message_read" &&
    receivedMessage.user_guid !== userGUID
  ) {
    updateMessagesReadStatus(
      allMessages,
      receivedMessage.last_read_message_created_at
    );
  }
};

const handleFriendStatusMessage = (receivedMessage) => {
  if (
    receivedMessage.type === "status" &&
    receivedMessage.username == friendUserName.value
  ) {
    friendStatus.value = receivedMessage.status;
  }
};

const handleSocketClose = () => {
  systemMessage.value = { type: "error", content: "You are disconnected" };
  displaySystemMessage.value = true;
  console.log("System Message", displaySystemMessage.value);
};

onMounted(async () => {
  directChats.value = await chatStore.getDirectChats(
    currentUser.value.userGUID
  );

  systemMessage.value = { type: "success", content: "You are connected" };
  displaySystemMessage.value = true;

  chatWindow.value.addEventListener('scroll', handleScroll);


  socket.value.addEventListener("message", (event) => {
    const receivedMessage = JSON.parse(event.data);
    handleSystemMessage(receivedMessage);
    handleNewMessage(receivedMessage);
    handleMessageRead(receivedMessage);
    handleFriendStatusMessage(receivedMessage);
    handleFriendTyping(receivedMessage);
  });

  socket.value.addEventListener("close", (event) => {
    systemMessage.value = { type: "error", content: "You are disconnected" };
    displaySystemMessage.value = true;
    console.log("System Message", displaySystemMessage.value);
  });

  socket.value.addEventListener("close", handleSocketClose);

  // chatWindow.value.addEventListener("scroll", handleScroll);
});

const observer = ref(null);

onUpdated(() => {
  console.log("Updated");
});

// Watch for changes in displaySystemMessage and set it to false after 3 seconds.
watch(displaySystemMessage, (newValue) => {
  if (newValue) {
    if (systemMessage.value.type !== "error") {
      setTimeout(() => {
        displaySystemMessage.value = false;
      }, 3000); // 3 seconds
    }
  }
});

// track messages to recalculate unread messages count
watch(
  allMessages,
  (newVal) => {
    // calculateNewMessagesCount(allMessages.value, userGUID);
    // chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
    // setTimeout(() => {
    //   calculateNewMessagesCount(allMessages.value, userGUID);
    //   }, 1000); // 1 second
  },
  { deep: true }
);


const scrollBottom = () => {
  chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
}

const handleScroll = () => {
  if (chatWindow.value.scrollTop >= -50) {
    isBottom.value = true;
  } else {
    isBottom.value  = false;
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

#icon-search:hover,
#icon-chats:hover,
#icon-groups:hover {
  color: #009688 !important;
}

.searchTab,
.chatsTab,
.groupsTab {
  color: #009688 !important;
}

.activeEmoji {
  color: #009688 !important;
}

/* #message-container {
  background: url('/chat-background.jpg')center;
  background-size: 600px;
} */
</style>
