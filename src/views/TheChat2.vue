<template >
  <v-card class="mx-auto mt-5" max-width="600">
    <v-card-title class="bg-grey-lighten-4"> Messages </v-card-title>

    <v-divider></v-divider>
    <div id="container" ref="chatWindow">
      <div v-for="item in messages">
        <v-list-item
          :class="item.user === userName ? 'bg-teal-lighten-5 ml-10 mr-2 text-right' : 'bg-blue-lighten-4 ml-2 mr-10'"
          class="rounded-xl py-2 my-5">
          <v-list-item-title class="pb-3 text-center">Today</v-list-item-title>
          <v-list-item-content>{{ item.message }}</v-list-item-content>

          <v-list-item-subtitle class="mt-2">
            {{ item.user }}
            <v-icon v-if="item.user === userName" class="text-blue ml-2">mdi-check-all</v-icon>
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
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUpdated, watchEffect, reactive } from "vue";
import { useWebSocket } from "@/composables/useWebSocket";
import { useMessageHistory } from "@/composables/useMessageHistory";

const { socket } = useWebSocket("ws://localhost:8001/ws/"); // Replace with your WebSocket server URL


const { messages } = useMessageHistory()

const messageToSend = ref(""); // Create a ref for the message input
const chatWindow = ref(null)

const userName = "Bekzod"

const sendMessage = () => {
  if (socket.value && messageToSend.value.trim() !== "") {
    // Check if the WebSocket connection exists and the message is not empty
    socket.value.send(JSON.stringify({ message: messageToSend.value }));
    messageToSend.value = ""; // Clear the input field
  }
};



onMounted(() => {

  socket.value.addEventListener("message", (event) => {
    const receivedMessage = JSON.parse(event.data);

    // Append the received message to the messages ref (inside the composable)
    messages.value.unshift(receivedMessage);

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



</script>


<style scoped>
#container {
  max-height: 500px;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
}
</style>