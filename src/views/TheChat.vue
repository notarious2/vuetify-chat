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

const { socket } = useWebSocket("ws://localhost:8001/ws/"); // Replace with your WebSocket server URL

const { getMessages } = useGetMessages();
const { getOldMessages } = useGetOldMessages();
const { getChats } = useGetChats();


const messageToSend = ref(""); // Create a ref for the message input
const chatWindow = ref(null);

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

const openChat = (chatGUID) => {
  if (socket.value !== "") {
    socket.value.send(JSON.stringify({ type: "connect_chat", chat_guid: chatGUID }));
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
// const chatGUID = "98542279-059e-4a29-b5b5-2b31cbcf2fcc";

const currentChatGUID = ref("")


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

const isFriendOnline = ref(false)



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
    console.log("Loaded older messages", response);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};

// GET CHATS RELATED FUNCTIONALITY
const directChats = ref([]);
const groupChats = ref([])
const friendName = ref("")

const loadChat = async (directChat) => {
  const chatGUID = directChat.chat_guid
  friendName.value = directChat.friend.username
  console.log("CHAT CREATED AT", directChat.created_at);
  console.log("CHAT UPDATED AT", directChat.updated_at);
  console.log("FORMATTED", formatTimeFromDateString(directChat.created_at));
  console.log("CHAT GUID", chatGUID);
  openChat(chatGUID);

  try {
    const response = await getMessages(chatGUID);
    moreMessagesToLoad.value = hasMoreMessages(response.page, response.size, response.total);
    allMessages.value = response.items;
    currentChatGUID.value = chatGUID
    console.log("ALL MESSAGES", allMessages);
    console.log("OLDEST MESSAGE", allMessages.value[allMessages.value.length - 1]["guid"])
  } catch (error) {
    console.log("ERROR HERE", error);
  }
}

const formatTimeFromDateString = (dateString) => {
  const date = new Date(dateString);
  const currentDate = new Date();
  console.log("PROVIDED", getWeekNumber(date));
  console.log("CURRENT", getWeekNumber(currentDate));

  // Check if the date is in the same day as today
  if (
    date.getDate() === currentDate.getDate() &&
    date.getMonth() === currentDate.getMonth() &&
    date.getFullYear() === currentDate.getFullYear()
  ) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  if (date.getFullYear() === currentDate.getFullYear() && getWeekNumber(currentDate) === getWeekNumber(date)) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  // Format as day/month like 5/08
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
  return `${day}/${month}`;
};



function getWeekNumber(d) {
  d = new Date(+d) // Copy date so don't modify original.
  d.setHours(0, 0, 0, 0) // Reset hours.
  d.setDate(d.getDate() + 4 - (d.getDay() || 7)) // Set to nearest Thursday: current date + 4 - current day number and make Sunday's day number 7
  var yearStart = new Date(d.getFullYear(), 0, 1) // Get first day of year
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7) // Calculate full weeks to nearest Thursday
  return weekNo // Return week number
}

onMounted(async () => {
  // try {
  //   const response = await getMessages(chatGUID);
  //   moreMessagesToLoad.value = hasMoreMessages(response.page, response.size, response.total);
  //   allMessages.value = response.items;

  //   console.log("ALL MESSAGES", allMessages);
  //   console.log("OLDEST MESSAGE", allMessages.value[allMessages.value.length - 1]["guid"])
  // } catch (error) {
  //   console.log("ERROR HERE", error);
  // }

  [directChats.value, groupChats.value] = await getChats(userName);
  console.log("DIRECT CHATS", directChats.value);
  console.log("GROUP CHATS", groupChats.value);



  systemMessage.value = { type: "success", content: "You are connected" };
  displaySystemMessage.value = true;

  socket.value.addEventListener("message", (event) => {
    const receivedMessage = JSON.parse(event.data);
    if (receivedMessage.type === "system" && receivedMessage.username !== userName) {
      console.log("System Message", receivedMessage);
      systemMessage.value = receivedMessage;
      displaySystemMessage.value = true;
    } else if (receivedMessage.type === "new") {
      allMessages.value.unshift(receivedMessage);
    } else if (receivedMessage.type === "status" && receivedMessage.username !== userName) {
      isFriendOnline.value = receivedMessage.online
      console.log("Friend's status", receivedMessage.online);
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
