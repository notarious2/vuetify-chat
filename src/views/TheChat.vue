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
                <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John"></v-img>
              </v-avatar>
              <p>{{ directChat.friend.username }}</p>
              <p class="ml-auto">{{ formatTimeFromDateString(directChat.updated_at) }}</p>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>


      <v-col>
        <v-card class="mx-auto mt-5" max-width="600">
          <v-card-title class="bg-grey-lighten-4"
            style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <v-avatar class="ml-auto">
                <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John"></v-img>
              </v-avatar>
              <v-icon v-if="isFriendOnline" size="xs" class="mt-5 ml-n1 mb-n2"
                color="success">mdi-checkbox-blank-circle</v-icon>
              <v-icon v-else="isFriendOnline" size="xs" class="mt-5 ml-n1 mb-n2"
                color="success">mdi-checkbox-blank-circle-outline</v-icon>

              <span>{{friendName}}</span>
            </div>
            <span>Direct Chat</span>

          </v-card-title>


          <v-divider></v-divider>
          <div id="container" ref="chatWindow">
            <div v-for="(message, index) in allMessages">
              <div v-if="showDateBreak(index)" class="text-center my-2 font-weight-medium">
                {{ formatDate(message.created_at) }}
                <v-divider class="mt-2"></v-divider>
              </div>
              <v-list-item :class="message.user.username === userName
                ? 'bg-teal-lighten-5 ml-10 mr-2 text-right'
                : 'bg-blue-lighten-4 ml-2 mr-10'
                " class="rounded-xl py-2 my-5">
                <v-list-item-content>{{ message.content }}</v-list-item-content>
                <v-list-item-subtitle class="mt-2">
                  {{ formatTimestamp(message.created_at) }}
                  <v-icon v-if="message.user.username === userName" class="text-blue">mdi-check-all</v-icon>


                </v-list-item-subtitle>

              </v-list-item>

            </div>
            <v-btn v-if="moreMessagesToLoad" @click="loadMoreMessages" class="mt-3 mx-auto"
              style="text-transform: none;">Load
              More</v-btn>
          </div>

          <!-- <v-divider></v-divider> -->
          <v-card class="mx-auto" max-width="600">
            <v-container class="mx-3 px-5 rounded-lg mt-3">
              <v-row align="center" justify="center" no-gutters>
                <v-textarea label="Type your text" rows="1" v-model="messageToSend" auto-grow variant="solo"
                  @keydown.enter.exact.prevent @keyup.enter.exact.prevent="sendMessage"></v-textarea>
                <!-- @keydown.enter.exact.prevent -> Prevents next line on clicking ENTER -->
                <!-- We should be able to add a new line by pressing SHIFT+ENTER -->
                <v-btn @click="sendMessage" icon="mdi-send" variant="plain" color="blue" size="x-large" class="ml-2 mb-5"
                  style="font-size: 30px;">

                </v-btn>
              </v-row>
            </v-container>
          </v-card>
          <v-alert v-if="displaySystemMessage"
            :color="systemMessage.type === 'error' ? 'pink-accent-2' : (systemMessage.type === 'system' ? 'blue-grey-lighten-2' : 'indigo-lighten-2')"
            theme="dark" class="text-center text-h6 font-weight-bold">{{ systemMessage.content }}</v-alert>
        </v-card>
      </v-col>


    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, onUpdated } from "vue";
import { useWebSocket } from "@/composables/useWebSocket";
import useGetMessages from "@/composables/useGetMessages";
import useGetOldMessages from "@/composables/useGetOldMessages";
import useGetChats from "@/composables/useGetChats";
import Cookies from "js-cookie";
import { formatTimestamp, formatDate, formatTimeFromDateString } from "@/utils/dateUtils";


// Websocket setup
const { socket } = useWebSocket("ws://localhost:8001/ws/"); // Replace with your WebSocket server URL

// Chat box setup, Messages and Chat Functions
const messageToSend = ref("");
const chatWindow = ref(null);
const currentChatGUID = ref("")
const allMessages = ref([]);
const displaySystemMessage = ref(false);
const systemMessage = ref({});
const moreMessagesToLoad = ref(false)

// User Information
const userName = Cookies.get("username");

// Chat List Management
const directChats = ref([]);
const groupChats = ref([])
const friendName = ref("")

// Status and Message Handling
const isFriendOnline = ref(false)


const { getMessages } = useGetMessages();
const { getOldMessages } = useGetOldMessages();
const { getChats } = useGetChats();


// Functions for Message Handling

const sendMessage = () => {
  if (socket.value && messageToSend.value.trim() !== "") {
    // Check if the WebSocket connection exists and the message is not empty
    socket.value.send(
      JSON.stringify({ type: "new_message", chat_guid: currentChatGUID.value, content: messageToSend.value })
    );
    messageToSend.value = ""; // Clear the input field
    chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
  }
};


const showDateBreak = (index) => {
  const messages = allMessages.value
  if (index === messages.length - 1) {
    // Always show a date break for the first message
    return true;
  }
  // Compare the date of the current message with the previous message
  const currentDate = new Date(allMessages.value[index].created_at).toDateString();
  const nextDate = new Date(allMessages.value[index + 1].created_at).toDateString();

  return currentDate !== nextDate;
};

const hasMoreMessages = (page, pageSize, total) => {
  // Calculate the total number of messages loaded so far
  const totalLoaded = page * pageSize;
  // Check if there are more messages to load based on the total
  return totalLoaded < total;
};

// Functions for Loading More Messages
const loadMoreMessages = async () => {
  try {
    const oldestMessageGUID = allMessages.value[allMessages.value.length - 1]["guid"]
    const response = await getOldMessages(currentChatGUID.value, oldestMessageGUID);
    // append existing allMessages
    const oldMessages = response["messages"]
    oldMessages.forEach(oldMessage => {
      allMessages.value.push(oldMessage)
    });
    if (response["has_more_messages"]) {
      console.log("Yes");
    } else {
      moreMessagesToLoad.value = false;
    }
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};

// Functions for Chat Loading
const loadChat = async (directChat) => {
  const chatGUID = directChat.chat_guid
  friendName.value = directChat.friend.username
  // send WS message to create a get/create a chat
  if (socket.value !== "") {
    socket.value.send(JSON.stringify({ type: "connect_chat", chat_guid: chatGUID }));
  }

  try {
    const response = await getMessages(chatGUID);
    moreMessagesToLoad.value = hasMoreMessages(response.page, response.size, response.total);
    allMessages.value = response.items;
    currentChatGUID.value = chatGUID
  } catch (error) {
    console.log("Error in loadChat", error);
  }
}


onMounted(async () => {

  [directChats.value, groupChats.value] = await getChats(userName);

  systemMessage.value = { type: "success", content: "You are connected" };
  displaySystemMessage.value = true;

  socket.value.addEventListener("message", (event) => {
    const receivedMessage = JSON.parse(event.data);
    if (receivedMessage.type === "system" && receivedMessage.username !== userName) {
      systemMessage.value = receivedMessage;
      displaySystemMessage.value = true;
    } else if (receivedMessage.type === "new") {
      allMessages.value.unshift(receivedMessage);
    } else if (receivedMessage.type === "status" && receivedMessage.username !== userName) {
      isFriendOnline.value = receivedMessage.online
    }

  });

  socket.value.addEventListener("close", (event) => {
    systemMessage.value = { type: "error", content: "You are disconnected" };
    displaySystemMessage.value = true;
    console.log("System Message", displaySystemMessage.value);
  });
});

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
</script>

<style scoped>
#container {
  max-height: 500px;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
}
</style>
