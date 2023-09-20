<template>
  <v-card class="mx-auto mt-5" max-width="600">
    <v-card-title class="bg-grey-lighten-4" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
      <v-avatar class="ml-auto">
        <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John"></v-img>
      </v-avatar>
      <!-- mdi-checkbox-blank-circle-outline -->
      <v-icon size="xs" class="mt-5 ml-n1 mb-n2" color="success">mdi-checkbox-blank-circle</v-icon>
      <span>John</span>
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
      <v-btn v-if="moreMessagesToLoad" @click="loadMoreMessages" class="mt-3 mx-auto" style="text-transform: none;">Load
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
          <v-btn @click="sendMessage" icon="mdi-send" variant="plain" color="blue" size="x-large" class="ml-2 mb-5" style="font-size: 30px;">

          </v-btn>
        </v-row>
      </v-container>
    </v-card>
    <v-alert v-if="displaySystemMessage"
      :color="systemMessage.type === 'error' ? 'pink-accent-2' : (systemMessage.type === 'system' ? 'blue-grey-lighten-2' : 'indigo-lighten-2')"
      theme="dark" class="text-center text-h6 font-weight-bold">{{ systemMessage.content }}</v-alert>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted, onUpdated } from "vue";
import { useWebSocket } from "@/composables/useWebSocket";
import useGetMessages from "@/composables/useGetMessages";
import useGetOldMessages from "@/composables/useGetOldMessages";
import Cookies from "js-cookie";

const { socket } = useWebSocket("ws://localhost:8001/ws/"); // Replace with your WebSocket server URL

const { getMessages } = useGetMessages();
const { getOldMessages } = useGetOldMessages();


const messageToSend = ref(""); // Create a ref for the message input
const chatWindow = ref(null);

const sendMessage = () => {
  if (socket.value && messageToSend.value.trim() !== "") {
    // Check if the WebSocket connection exists and the message is not empty
    socket.value.send(
      JSON.stringify({ chat_guid: chatGUID, content: messageToSend.value })
    );
    messageToSend.value = ""; // Clear the input field
    chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
  }
};

const openChat = (chatGUID) => {
  if (socket.value !== "") {
    socket.value.send(JSON.stringify({ chatGUID: chatGUID }));
  }
};

// Function to format the timestamp
const formatTimestamp = (timestampString) => {
  const date = new Date(timestampString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
};

// Function to format the date as "day of the week, day, and month"
const formatDate = (timestampString) => {
  const date = new Date(timestampString);
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString(undefined, options);
};

// Function to determine whether to show a date break
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

const userName = Cookies.get("username");

// const chatGUID = "e5378d07-5b14-45e3-8bcd-15b504851d78"
const chatGUID = "98542279-059e-4a29-b5b5-2b31cbcf2fcc";

const allMessages = ref([]);

const displaySystemMessage = ref(false);
const systemMessage = ref({});

const moreMessagesToLoad = ref(false)

const hasMoreMessages = (page, pageSize, total) => {
  // Calculate the total number of messages loaded so far
  const totalLoaded = page * pageSize;
  // Check if there are more messages to load based on the total
  return totalLoaded < total;
};



const loadMoreMessages = async () => {
  try {
    const oldestMessageGUID = allMessages.value[allMessages.value.length - 1]["guid"]
    const response = await getOldMessages(chatGUID, oldestMessageGUID);
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
    console.log("Loaded older messages", response);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};


onMounted(async () => {
  try {
    const response = await getMessages(chatGUID);
    moreMessagesToLoad.value = hasMoreMessages(response.page, response.size, response.total);
    allMessages.value = response.items;

    console.log("ALL MESSAGES", allMessages);
    console.log("OLDEST MESSAGE", allMessages.value[allMessages.value.length - 1]["guid"])
  } catch (error) {
    console.log("ERROR HERE", erro);
  }

  openChat(chatGUID);

  systemMessage.value = { type: "success", content: "You are connected" };
  displaySystemMessage.value = true;

  socket.value.addEventListener("message", (event) => {
    const receivedMessage = JSON.parse(event.data);
    console.log("messages received", receivedMessage.username, userName);
    if (receivedMessage.type === "system" && receivedMessage.username !== userName) {
      console.log("System Message", receivedMessage);
      systemMessage.value = receivedMessage;
      displaySystemMessage.value = true;
    } else if (receivedMessage.type === "new") {
      allMessages.value.unshift(receivedMessage);

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
