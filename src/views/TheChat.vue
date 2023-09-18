<template >
  <v-card class="mx-auto mt-5" max-width="600">
    <v-card-title class="bg-grey-lighten-4"> Messages </v-card-title>

    <v-divider></v-divider>
    <div id="container" ref="chatWindow">
      <div v-for="message in allMessages">
        <v-list-item
          :class="message.user.username === userName ? 'bg-teal-lighten-5 ml-10 mr-2 text-right' : 'bg-blue-lighten-4 ml-2 mr-10'"
          class="rounded-xl py-2 my-5">
          <v-list-item-title class="pb-3 text-center">Today</v-list-item-title>
          <v-list-item-content>{{ message.content }}</v-list-item-content>

          <v-list-item-subtitle class="mt-2">
            {{ message.user.first_name }}
            <v-icon v-if="message.user.username === userName" class="text-blue ml-2">mdi-check-all</v-icon>
          </v-list-item-subtitle>
        </v-list-item>

      </div>
    </div>
    <!-- <v-divider></v-divider> -->
    <v-card class="mx-auto" max-width="600">
      <v-container class="mx-3 px-5  rounded-lg mt-3">
        <v-row align="center" justify="center" no-gutters>
          <v-textarea label="Type your text" rows="1"  v-model="messageToSend" auto-grow variant="solo"
          @keydown.enter.exact.prevent @keyup.enter.exact.prevent="sendMessage"></v-textarea>
          <!-- @keydown.enter.exact.prevent -> Prevents next line on clicking ENTER -->
            <!-- We should be able to add a new line by pressing SHIFT+ENTER -->
          <v-btn @click="sendMessage" variant="outlined" size="x-large" class="ml-2 mb-5"> Send </v-btn>
        </v-row>
      </v-container>
    </v-card>
    <v-alert v-if="displaySystemMessage" :color="systemMessage.type === 'success' ? 'indigo-lighten-2' : 'pink-accent-2'"  theme="dark" class="text-center text-h6 font-weight-bold">{{ systemMessage.content }}</v-alert>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUpdated, watchEffect, reactive } from "vue";
import { useWebSocket } from "@/composables/useWebSocket";
import { useMessageHistory } from "@/composables/useMessageHistory";
import useGetMessages from "@/composables/useGetMessages";


const { socket } = useWebSocket("ws://localhost:8001/ws/"); // Replace with your WebSocket server URL

const { getMessages } = useGetMessages()

const { messages } = useMessageHistory()


const messageToSend = ref(""); // Create a ref for the message input
const chatWindow = ref(null)

const userName = "bekzod"

const sendMessage = () => { 
  if (socket.value && messageToSend.value.trim() !== "") {
    // Check if the WebSocket connection exists and the message is not empty
    socket.value.send(JSON.stringify({ chat_guid: chatGUID, content: messageToSend.value }));
    messageToSend.value = ""; // Clear the input field
  }
};

const openChat = (chatGUID) => { 
  if (socket.value !== "") {
    // Check if the WebSocket connection exists and the message is not empty
    socket.value.send(JSON.stringify({ chatGUID: chatGUID}));
    messageToSend.value = ""; // Clear the input field
  }
};


const chatGUID = "e5378d07-5b14-45e3-8bcd-15b504851d78"

const allMessages = ref([])

const displaySystemMessage = ref(false)
const systemMessage = ref({})


onMounted(async () => {

  try {
    const response = await getMessages(chatGUID)
    allMessages.value = response.items
    
    console.log("ALL MESSAGES", allMessages);
  } catch (error) {
    console.log("ERROR HERE", erro);
  }

  // OPEN CHAT

  openChat(chatGUID)

  systemMessage.value = {type: "success", content:"You are connected"};
  displaySystemMessage.value = true;


  socket.value.addEventListener("message", (event) => {
    const receivedMessage = JSON.parse(event.data);
    // Append the received message to the messages ref (inside the composable)
    allMessages.value.unshift(receivedMessage);

  });

  socket.value.addEventListener("close", (event) => {
    systemMessage.value = {type: "error", content:"You are disconnected"};
    displaySystemMessage.value = true;
    console.log("System Message", displaySystemMessage.value);

  });

});

onUpdated(() => {
  console.log("Updated")
});

watch(messages, (newVal) => {
  console.log("chat", chatWindow.value);
  chatWindow.value.scrollTop = chatWindow.value.scrollHeight
  // chatWindow.value.$el.scrollTo(0, chatWindow.value.$el.scrollHeight)
}, { deep: true });

// Watch for changes in displaySystemMessage and set it to false after 3 seconds.
watch(displaySystemMessage, (newValue) => {
  if (newValue) {
    if (systemMessage.value.type === "success") {
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