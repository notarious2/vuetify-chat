<template >
  <v-card class="mx-auto mt-5" max-width="600" >
    <v-card-title class="bg-grey-lighten-4"> Messages </v-card-title>

    <v-divider></v-divider>

    <v-virtual-scroll :items="messages" height="560" item-height="48" id="container" ref="chatWindow">
      <template v-slot="{ item }">
        <v-list-item
          v-if="item.user === 'Bekzod'"
          style="text-align: right; white-space: pre-wrap;"
          class="bg-teal-lighten-5 rounded-xl ml-10 mr-2 py-8 my-5"
        >
        <v-list-item-content>{{ item.message }}</v-list-item-content>
        <v-list-item-subtitle>{{ item.user }}</v-list-item-subtitle>

          <template v-slot:append>
            <v-icon class="bg-primary rounded-xl">mdi-message</v-icon>
          </template>
        </v-list-item>
        <v-list-item
          v-else
          style="text-align: left"
          class="bg-blue-lighten-4 rounded-xl ml-2 mr-10 py-8 my-5"
        >
        <v-list-item-content>{{ item.message }}</v-list-item-content>
        <v-list-item-subtitle>{{ item.user }}</v-list-item-subtitle>

          <template v-slot:prepend>
            <v-icon class="bg-primary rounded-xl">mdi-message</v-icon>
          </template>
        </v-list-item>
      </template>
    </v-virtual-scroll>
    <!-- <v-divider></v-divider> -->
  </v-card>

  <v-card class="mx-auto mt-2 bg-grey-lighten-3" max-width="600">
  <v-container class="mx-3 px-5  rounded-lg mt-3">
    <v-row align="center" justify="center" no-gutters>
      <v-text-field
        label="Type your text"
        variant="solo"
        v-model="messageToSend"
        @keyup.enter = "sendMessage"
      ></v-text-field>
      <v-btn @click="sendMessage" variant="outlined" size="x-large" class="ml-2 mb-5"> Send </v-btn>
    </v-row>
  </v-container>
</v-card>

</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUpdated, watchEffect, reactive } from "vue";
import { useWebSocket } from "@/composables/useWebSocket";
import { useMessageHistory } from "@/composables/useMessageHistory";

const { socket } = useWebSocket("ws://127.0.0.1:8000/ws"); // Replace with your WebSocket server URL


const {messages} = useMessageHistory()


const messageToSend = ref(""); // Create a ref for the message input
const chatWindow = ref(null)



const sendMessage = () => {
  if (socket.value && messageToSend.value.trim() !== "") {
    // Check if the WebSocket connection exists and the message is not empty
    socket.value.send(messageToSend.value);
    messageToSend.value = ""; // Clear the input field
  }
};



onMounted(() => {


  socket.value.addEventListener("message", (event) => {
    const receivedMessage = JSON.parse(event.data);

    // Append the received message to the messages ref (inside the composable)
    messages.value.push(receivedMessage);

  });
  console.log("on mounted", chatWindow.value.$el, chatWindow.value.$el.scrollHeight);

});

onUpdated(() => {
  console.log("Updated")
});




watch(messages, (newVal) => {
    // chatWindow.value.$el.scrollTop = chatWindow.value.$el.scrollHeight
    chatWindow.value.$el.scrollTo(0, chatWindow.value.$el.scrollHeight)

}, { deep: true });


</script>


<style scoped>
/* #container {
  display: flex;
  flex-direction: column-reverse;
} */
</style>