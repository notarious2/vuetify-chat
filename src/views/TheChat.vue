<template>
  <v-container>
    <v-row no-gutters>
      <!-- LEFT PANEL START -->
      <v-col cols="4" class="bg-teal-lighten-5 rounded-s-lg">
        <!-- MENU PANEL START -->
        <v-card class="bg-teal-lighten-4 rounded-0 rounded-ts-lg">
          <div class="mt-5 mb-3 d-flex justify-space-around">
            <v-icon class="flex-grow-1" id="icon-search" color="teal-lighten-3" :class="{ searchTab: isSearch }"
              @click="toggleSearch">mdi-magnify</v-icon>
            <v-icon class="flex-grow-1" id="icon-chats" color="teal-lighten-3" :class="{ chatsTab: isChat }"
              @click="toggleChat">mdi-chat</v-icon>
            <v-icon class="flex-grow-1" id="icon-groups" color="teal-lighten-3" :class="{ groupsTab: isGroup }"
              @click="toggleGroup">mdi-account-group</v-icon>
          </div>
          <v-divider />
        </v-card>
        <!-- MENU PANEL END -->

        <v-list class="bg-teal-lighten-5" v-for="directChat in directChats">
          <v-list-item class="my-2" @click="loadChat(directChat)">
            <v-list-item-title class="ml-2 d-flex align-center">
              <v-avatar class="mr-5">
                <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John"></v-img>
              </v-avatar>
              <p>{{ directChat.friend.username }}</p>
              <p v-if="directChat.new_messages_count"
                class="ml-10 bg-teal-lighten-4 font-weight-regular rounded-circle px-2">
                {{ directChat.new_messages_count }}
              </p>
              <p class="ml-auto">
                {{ formatTimeFromDateString(directChat.updated_at) }}
              </p>
            </v-list-item-title>
          </v-list-item>
        </v-list>

      </v-col>
      <!-- LEFT PANEL END -->

      <!-- RIGHT PANEL START -->
      <v-col>
        <!-- MESSAGE BOX HEADING START -->
        <v-card class="rounded-0 rounded-te-lg bg-teal-lighten-3">
          <v-card-title style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
            <div>
              <v-avatar class="ml-auto">
                <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John"></v-img>
              </v-avatar>
              <v-icon v-if="friendStatus === 'online'" size="xs" class="mt-5 ml-n1 mb-n2"
                color="success">mdi-checkbox-blank-circle</v-icon>
              <v-icon v-else-if="friendStatus === 'inactive'" size="xs" class="mt-5 ml-n1 mb-n2"
                color="orange-lighten-2">mdi-checkbox-blank-circle</v-icon>
              <v-icon v-else size="xs" class="mt-5 ml-n1 mb-n2" color="gray">mdi-checkbox-blank-circle-outline</v-icon>

              <span class="ml-3">{{ friendUserName }}</span>
            </div>
            <v-icon color="teal">mdi-dots-vertical</v-icon>
          </v-card-title>
        </v-card>
        <!-- MESSAGE BOX HEADING END -->

        <!-- MESSAGES CONTAINER START -->
        <v-card class="rounded-0" id="message-container">
          <div id="container" ref="chatWindow">
            <div v-for="(message, index) in allMessages" :key="message.message_guid">
              <div v-if="showDateBreak(index)" class="text-center text-black my-2 font-weight-medium">
                {{ formatDate(message.created_at) }}
                <v-divider class="mt-2 mx-auto border-opacity-75" width="200px" color="teal" thickness="2px"></v-divider>
              </div>
              <speaker-bubble v-if="message.user_guid === userGUID" class="ml-auto mr-2">
                <v-list-item class="py-2 my-5 text-right">
                  <v-list-item-title>{{ message.content }}</v-list-item-title>

                  <v-list-item-subtitle class="mt-2">
                    {{ formatTimestamp(message.created_at) }}
                    <v-icon v-if="message.user_guid === userGUID"
                      :class="message.is_read ? 'text-blue' : 'text-gray'">mdi-check-all</v-icon>
                  </v-list-item-subtitle>
                </v-list-item>
              </speaker-bubble>
              <partner-bubble v-else class="ml-2 partner-msg" :id="message.message_guid" :index="index"
                :observer="observer">
                <v-list-item class="py-2 my-5 ml-2 text-left">
                  <v-list-item-title>{{ message.content }} </v-list-item-title>
                  <v-list-item-subtitle class="mt-2">
                    {{ formatTimestamp(message.created_at) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </partner-bubble>
            </div>
            <v-btn v-if="moreMessagesToLoad" @click="loadMoreMessages" class="mt-3 mx-auto"
              style="text-transform: none">Load More</v-btn>
          </div>
        </v-card>
        <!-- MESSAGES CONTAINER END -->
        <!-- <v-divider color="teal" thickness="10px"></v-divider> -->
        <!-- SEND BUTTON COMPONENT START -->
        <v-card class="rounded-0 rounded-be-lg">
          <v-row align="center" justify="center" no-gutters>
            <v-icon class="ml-2" size="x-large" color="teal" style="transform: rotate(10deg);">mdi-paperclip</v-icon>
            <v-icon class="ml-2 mr-2" size="x-large" color="teal">mdi-emoticon-happy-outline</v-icon>
            <!-- @keydown.enter.exact.prevent -> Prevents next line on clicking ENTER -->
            <!-- We should be able to add a new line by pressing SHIFT+ENTER -->
            <v-textarea hide-details label="Type your text" rows="1" v-model="messageToSend" auto-grow variant="solo"
              @keydown.enter.exact.prevent @keyup.enter.exact.prevent="wsSendMessage"
              @input="handleOwnTyping"></v-textarea>
            <v-btn @click="wsSendMessage" icon="mdi-send" variant="plain" color="teal" size="x-large" class="ml-2 mb-5"
              style="font-size: 30px; transform: rotate(-5deg);">
            </v-btn>
          </v-row>
        </v-card>
        <!-- SEND BUTTON COMPONENT END -->

        <v-alert v-if="displaySystemMessage" :color="systemMessage.type === 'error'
          ? 'pink-accent-2'
          : systemMessage.type === 'system'
            ? 'blue-grey-lighten-2'
            : 'indigo-lighten-2'
          " theme="dark" class="text-center text-h6 font-weight-bold">{{ systemMessage.content }}</v-alert>
      </v-col>
      <!-- RIGHT PANEL END -->
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, onUpdated, onBeforeMount } from "vue";
import { useWebSocket } from "@/composables/useWebSocket";
import useGetMessages from "@/composables/useGetMessages";
import useGetOldMessages from "@/composables/useGetOldMessages";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { useChatStore } from "@/store/chatStore";

import {
  formatTimestamp,
  formatDate,
  formatTimeFromDateString,
} from "@/utils/dateUtils";

import PartnerBubble from "@/components/PartnerBubble.vue";
import SpeakerBubble from "@/components/SpeakerBubble.vue";
import router from "@/router";

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

const userStore = useUserStore();
const chatStore = useChatStore();

const { currentUser } = storeToRefs(userStore);

// Establish Websocket connection, useWebSocket return socket ref that holds WebSocket object
const { socket } = useWebSocket("ws://localhost:8001/ws/"); // TODO: Make it constant

// Chat box setup, Messages and Chat Functions
const messageToSend = ref("");
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

const { getMessages } = useGetMessages();
const { getOldMessages } = useGetOldMessages();

// Functions for Message Handling

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

// Functions for Loading handles Messages
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

// Functions for Chat Loading
const loadChat = async (directChat) => {
  // declare variables
  const chatGUID = directChat.chat_guid;

  friendUserName.value = directChat.friend.username;

  // TODO: I need to subscribe user to all open direct chat's on mounted
  // basically, once the backend accepts connections it should get all direct chats
  // user is in and subscribe via redisPubSub channel
  // this allows:
  // - if user in directChat it send status message to all chats user is in
  // - new messages count from other users will be shown in the sidebar (updated)

  // send WS message to create a get/create a chat
  if (socket.value !== "") {
    socket.value.send(
      JSON.stringify({ type: "connect_chat", chat_guid: chatGUID })
    );
  }

  try {
    const response = await getMessages(chatGUID);
    console.log("Get Messages", response);
    handleGetMessagesResponse(response, chatGUID, directChat);
  } catch (error) {
    console.log("Error in loadChat", error);
  }

  setChatAsActive(chatGUID);
  clearFriendStatus();
  // disconnect observer if there is any from the previous chat
  if (observer.value) {
    observer.value.disconnect();
  }
  initializeObserver();
};

const handleGetMessagesResponse = (response, chatGUID, directChat) => {
  allMessages.value = response.messages;
  moreMessagesToLoad.value = response.has_more_messages;

  directChat.new_messages_count = calculateNewMessagesCountForChat(
    response.messages,
    userGUID
  );

  if (response.last_read_message) {
    setLastReadMessage(response.last_read_message);
  } else {
    clearLastReadMessage();
  }
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
    chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
  }
};

const handleNewMessage = (receivedMessage) => {
  if (receivedMessage.type === "new") {
    // only append allMessages if message belongs to currently open Chat
    if (receivedMessage.chat_guid === currentChatGUID.value) {
      allMessages.value.unshift(receivedMessage);
    }

    if (receivedMessage.user_guid !== userGUID) {
      console.log("OBSERVER RECEIVED MESSAGE", observer);
      // observe incomming message of other user
      setTimeout(() => {
        const newMessage = document.getElementById(
          `${receivedMessage.message_guid}`
        );
        console.log("FOUND MESSAGE", newMessage);
        observer.value.observe(newMessage);
      }, 500); // need to wait before new message is inserted

      // find chat and increment new_message_count for chat by +1
      const foundChat = directChats.value.find(
        (obj) => obj.chat_guid === receivedMessage.chat_guid
      );
      if (foundChat) {
        foundChat.new_messages_count++;
      } else {
        console.log("Chat not found.");
      }
      // set friend is typing to false
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

onBeforeMount(() => {
  // Redirect to login page if not logged in
  // TODO: Must move to router before each
  if (!Object.keys(currentUser.value).length) {
    router.push("/login/");
  }
});

onMounted(async () => {
  directChats.value = await chatStore.getDirectChats(
    currentUser.value.userGUID
  );

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

/* #message-container {
  background: url('/chat-background.jpg')center;
  background-size: 600px;
} */
</style>
