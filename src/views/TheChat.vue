<template>
  <v-container class="bg-red">
    <v-row no-gutters>
      <v-col class="mt-5 bg-white" cols="4">
        <v-card>
          <v-card-title>Conversations</v-card-title>
          <v-btn variant="flat">Explore</v-btn>
          <v-btn variant="flat" color="green-accent-1">Direct</v-btn>
          <v-btn variant="flat">Group</v-btn>
        </v-card>
        <v-list v-for="directChat in directChats">
          <v-list-item class="my-2" @click="loadChat(directChat)">
            <v-list-item-content class="ml-2 d-flex align-center">
              <v-avatar class="mr-5">
                <v-img
                  src="https://cdn.vuetifyjs.com/images/john.jpg"
                  alt="John"
                ></v-img>
              </v-avatar>
              <p>{{ directChat.friend.username }}</p>
              <p
                v-if="
                  directChat.chat_guid === currentChatGUID &&
                  newMessagesCount !== 0
                "
                class="ml-auto bg-cyan-lighten-4 font-weight-regular rounded-circle px-2"
              >
                {{ newMessagesCount }}
              </p>
              <p
                v-else-if="directChat.has_new_messages"
                class="ml-auto bg-cyan-lighten-4 font-weight-regular rounded-circle px-2"
              >
                {{ directChat.new_messages_count }}
              </p>
              <p class="ml-auto">
                {{ formatTimeFromDateString(directChat.updated_at) }}
              </p>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>

      <v-col>
        <v-card class="mx-auto mt-5" max-width="600">
          <v-card-title
            class="bg-grey-lighten-4"
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
              <v-icon v-else size="xs" class="mt-5 ml-n1 mb-n2" color="success"
                >mdi-checkbox-blank-circle-outline</v-icon
              >

              <span>{{ friendUserName }}</span>
            </div>
            <span>Direct Chat</span>
          </v-card-title>

          <v-divider></v-divider>
          <div id="container" ref="chatWindow">
            <div
              v-for="(message, index) in allMessages"
              :key="message.message_guid"
            >
              <div
                v-if="showDateBreak(index)"
                class="text-center my-2 font-weight-medium"
              >
                {{ formatDate(message.created_at) }}
                <v-divider class="mt-2"></v-divider>
              </div>
              <speaker-bubble
                v-if="message.user_guid === userGUID"
                class="ml-auto mr-2"
              >
                <v-list-item class="py-2 my-5 text-right">
                  <v-list-item-content>{{
                    message.content
                  }}</v-list-item-content>

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
              >
                <v-list-item class="py-2 my-5 ml-2 text-left">
                  <v-list-item-content
                    >{{ message.content }}
                  </v-list-item-content>
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

          <!-- <v-divider></v-divider> -->
          <v-card class="mx-auto" max-width="600">
            <v-container class="mx-3 px-5 rounded-lg mt-3">
              <v-row align="center" justify="center" no-gutters>
                <v-textarea
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
                <!-- @keydown.enter.exact.prevent -> Prevents next line on clicking ENTER -->
                <!-- We should be able to add a new line by pressing SHIFT+ENTER -->
                <v-btn
                  @click="wsSendMessage"
                  icon="mdi-send"
                  variant="plain"
                  color="blue"
                  size="x-large"
                  class="ml-2 mb-5"
                  style="font-size: 30px"
                >
                </v-btn>
              </v-row>
              <v-row
                v-show="friendIsTyping"
                class="mb-auto mt-0 ml-2 text-blue-darken-3"
                >typing ...</v-row
              >
              <v-row v-show="!friendIsTyping" class="mb-auto mt-0 ml-2"
                >&nbsp;</v-row
              >
            </v-container>
          </v-card>
          <v-alert
            v-if="displaySystemMessage"
            :color="
              systemMessage.type === 'error'
                ? 'pink-accent-2'
                : systemMessage.type === 'system'
                ? 'blue-grey-lighten-2'
                : 'indigo-lighten-2'
            "
            theme="dark"
            class="text-center text-h6 font-weight-bold"
            >{{ systemMessage.content }}</v-alert
          >
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, onUpdated, onBeforeMount } from "vue";
import { useWebSocket } from "@/composables/useWebSocket";
import useGetMessages from "@/composables/useGetMessages";
import useGetOldMessages from "@/composables/useGetOldMessages";
import useGetChats from "@/composables/useGetChats";
import Cookies from "js-cookie";
import {
  formatTimestamp,
  formatDate,
  formatTimeFromDateString,
} from "@/utils/dateUtils";

import PartnerBubble from "@/components/PartnerBubble.vue";
import SpeakerBubble from "@/components/SpeakerBubble.vue";

// Websocket setup
const { socket } = useWebSocket("ws://localhost:8001/ws/"); // Replace with your WebSocket server URL

// Chat box setup, Messages and Chat Functions
const messageToSend = ref("");
const chatWindow = ref(null);
const currentChatGUID = ref("");
const allMessages = ref([]);
const displaySystemMessage = ref(false);
const systemMessage = ref({});
const moreMessagesToLoad = ref(false);
const newMessagesCount = ref(0);

// Reference to the last message element
const lastReadMessage = ref({});

// User Information
const userName = Cookies.get("username");
const userGUID = Cookies.get("user_guid");

// Chat List Management
const directChats = ref([]);
const groupChats = ref([]);
const friendUserName = ref("");

// Status and Message Handling
const friendStatus = ref(false);

const { getMessages } = useGetMessages();
const { getOldMessages } = useGetOldMessages();
const { getChats } = useGetChats();

// Functions for Message Handling

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
    chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
  }
};

const isTyping = ref(false);
const typingTimer = ref(null);
const friendIsTyping = ref(false);
let friendTypingTimeout = null;

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
  // Clear the existing timer
  clearTimeout(typingTimer.value);

  // Set isTyping to true when the textarea has content
  isTyping.value = messageToSend.value.trim() !== "";

  // Start a new timer to set isTyping to false after 3 seconds
  typingTimer.value = setTimeout(async () => {
    isTyping.value = false;
    // Call the wsSendTyping function when the user stops typing (after 3 seconds)
    await wsSendTyping();
  }, 1000); // Set the timeout to 3000 milliseconds (3 seconds)
};

const handleUserTyping = (receivedMessage) => {
  if (
    receivedMessage.type === "user_typing" &&
    receivedMessage.user_guid !== userGUID
  ) {
    friendIsTyping.value = true;

    // Clear any existing timeout
    if (friendTypingTimeout) {
      clearTimeout(friendTypingTimeout);
    }

    // Set a timeout to reset friendIsTyping to false after 3 seconds
    friendTypingTimeout = setTimeout(() => {
      friendIsTyping.value = false;
    }, 3000); // 3000 milliseconds (3 seconds)
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

// Functions for Loading More Messages
const loadMoreMessages = async () => {
  try {
    const oldestMessageGUID =
      allMessages.value[allMessages.value.length - 1]["message_guid"];
    console.log("CURRENT CHAT GUID", currentChatGUID.value);
    const response = await getOldMessages(
      currentChatGUID.value,
      oldestMessageGUID
    );
    // append existing allMessages
    const oldMessages = response["messages"];
    oldMessages.forEach((oldMessage) => {
      allMessages.value.push(oldMessage);
    });
    moreMessagesToLoad.value = response["has_more_messages"];
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};

// Function to mark a message as "seen"
const wsMarkMessageAsRead = async (message) => {
  await socket.value.send(
    JSON.stringify({
      type: "message_read",
      chat_guid: message.chat_guid,
      message_guid: message.message_guid,
    })
  );
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
      messages.value[i].is_read = true;
    }
  }
};

// assign UnreadMessagesCount after getting Messages
const setNewMessagesCountforChat = (chat) => {
  newMessagesCount.value = chat.unread_messages_count;
};

// Functions for Chat Loading
const loadChat = async (directChat) => {
  const chatGUID = directChat.chat_guid;
  friendUserName.value = directChat.friend.username;
  // send WS message to create a get/create a chat
  if (socket.value !== "") {
    socket.value.send(
      JSON.stringify({ type: "connect_chat", chat_guid: chatGUID })
    );
  }
  setNewMessagesCountforChat(directChat);

  try {
    const response = await getMessages(chatGUID);
    console.log("Get Messages", response);

    allMessages.value = response.messages;
    moreMessagesToLoad.value = response.has_more_messages;
    if (response.last_read_message) {
      lastReadMessage.value.guid = response.last_read_message.guid;
      lastReadMessage.value.created_at = new Date(
        response.last_read_message.created_at
      );
    } else {
      // clear from previously loaded
      lastReadMessage.value = "";
    }
    currentChatGUID.value = chatGUID;
  } catch (error) {
    console.log("Error in loadChat", error);
  }
  // clear friend's status
  friendStatus.value = false;

  if (observer.value) {
    observer.value.disconnect();
  }

  observer.value = new IntersectionObserver(onElementObserved, {
    root: chatWindow.value,
    threshold: 1.0,
  });

  // Select all elements with the class "partner-msg" that you want to observe
  setTimeout(() => {
    const bubbles = document.querySelectorAll(".partner-msg");
    console.log("Loading chat..");
    bubbles.forEach((bubble) => {
      observer.value.observe(bubble);
    });
  }, 500);
};

const activeTab = ref(true);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    activeTab.value = false;
  } else {
    activeTab.value = true;
  }
});

const shouldMarkMessageAsRead = (message, viewportTop, viewportBottom) => {
  const isUnread = message.user_guid !== userGUID && message.is_new === true;
  if (!isUnread) return false;
  const messageElement = document.getElementById(`${message.message_guid}`);
  if (!messageElement) return false;

  // Get the top and bottom boundaries of the message element
  const messageTop = messageElement.offsetTop;
  const messageBottom = messageTop + messageElement.offsetHeight;

  return messageTop < viewportBottom && messageBottom > viewportTop;
};

const markMessageasRead = async (message) => {
  // assuming another user's messages are passed
  if (message.is_new) {
    console.log("Marking this message as read", message.content);
    // await wsMarkMessageAsRead(message);
  } else {
    console.log("Skipping", message.content);
  }
};

const calculateNewMessagesCount = (messages, userGUID) => {
  // Use reduce to count unread messages for the specified user
  // ignore read status of own messages
  console.log("New messages,", messages);
  newMessagesCount.value = messages.reduce((count, message) => {
    if (message.user_guid !== userGUID && message.is_new) {
      return count + 1;
    } else {
      return count;
    }
  }, 0);
  console.log("NEW messages count", newMessagesCount.value);
};

const onElementObserved = async (entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }
    observer.value.unobserve(entry.target);
    const msgIndex = entry.target.getAttribute("index");
    const msg = allMessages.value[msgIndex];
    markMessageasRead(msg);
  });
};

const handleScroll = async () => {
  // Get the viewport's top and bottom boundaries
  const viewportTop = chatWindow.value.scrollTop;
  const viewportBottom = viewportTop + chatWindow.value.clientHeight;

  // Iterate through messages and check their visibility
  for (let i = 0; i < allMessages.value.length; i++) {
    const message = allMessages.value[i];
    // ignore if own message
    if (message.user_guid === userGUID) continue;
    // break the loop if message was already read
    if (lastReadMessage.value.guid === message.guid) break;
    // break the loop if message is not new
    if (!message.is_new) break;
    if (shouldMarkMessageAsRead(message, viewportTop, viewportBottom)) {
      lastReadMessage.value.guid = message.message_guid;
      lastReadMessage.value.created_at = new Date(message.created_at);
      // mark message as read for current user
      allMessages.value[i].is_read = true;
      allMessages.value[i].is_new = false;
      // send read_status ws message
      await wsMarkMessageAsRead(message);
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

const handleNewMessage = (receivedMessage) => {
  if (receivedMessage.type === "new") {
    // set is_new to false if own message
    if (receivedMessage.user_guid === userGUID) {
      receivedMessage.is_new = false;
    } else {
      // set friend is typing to false
      friendIsTyping.value = false;
      // observe incomming message
      setTimeout(() => {
        // start observing
        const newMessage = document.getElementById(
          `${receivedMessage.message_guid}`
        );
        observer.value.observe(newMessage);
      }, 500);
    }
    allMessages.value.unshift(receivedMessage);
  }
};

const handleMessageRead = (receivedMessage) => {
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
  [directChats.value, groupChats.value] = await getChats(userName);
  systemMessage.value = { type: "success", content: "You are connected" };
  displaySystemMessage.value = true;

  socket.value.addEventListener("message", (event) => {
    const receivedMessage = JSON.parse(event.data);
    handleSystemMessage(receivedMessage);
    handleNewMessage(receivedMessage);
    handleMessageRead(receivedMessage);
    handleFriendStatusMessage(receivedMessage);
    handleUserTyping(receivedMessage);
  });

  socket.value.addEventListener("close", (event) => {
    systemMessage.value = { type: "error", content: "You are disconnected" };
    displaySystemMessage.value = true;
    console.log("System Message", displaySystemMessage.value);
  });

  socket.value.addEventListener("close", handleSocketClose);

  chatWindow.value.addEventListener("scroll", handleScroll);
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
    calculateNewMessagesCount(allMessages.value, userGUID);
    // chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
  },
  { deep: true }
);
</script>

<style scoped>
#container {
  max-height: 500px;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
}
</style>
