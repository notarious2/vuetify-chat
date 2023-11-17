<template>
  <v-container>
    <v-row no-gutters>
      <!-- LEFT PANEL START -->
      <v-col cols="4" class="bg-teal-lighten-5 rounded-s-lg">
        <MenuPanel />
        <ContactList v-if="isSearch" />
        <ChatList v-if="isChat"/>
      </v-col>
      <!-- LEFT PANEL CHATS END -->

      <!-- RIGHT PANEL START -->
      <v-col v-if="isChat && chatSelected">
        <ChatBoxHeader />
        <MainChat/>
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
import { ref, onMounted, onUpdated, nextTick } from "vue";
import { storeToRefs } from "pinia";

import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

import MainChat from "@/components/MainChat.vue";
import ThreeDots from "@/components/ThreeDots.vue";
import EmptyChatWindow from "@/components/EmptyChatWindow.vue";
import EmptyGroupWindow from "@/components/EmptyGroupWindow.vue";
import SearchWindow from "@/components/SearchWindow.vue";
import ContactList from "@/components/ContactList.vue";
import MenuPanel from "@/components/MenuPanel.vue";
import ChatBoxHeader from "@/components/ChatBoxHeader.vue";
import ChatList from "@/components/ChatList.vue";

import { useChatStore } from "@/store/chatStore";
import { useMessageStore } from "@/store/messageStore";
import { useMainStore } from "@/store/mainStore";
import { useWebsocketStore } from "@/store/websocketStore";

const chatStore = useChatStore();
const messageStore = useMessageStore();
const mainStore = useMainStore();
const websocketStore = useWebsocketStore();

const { chatSelected, inputLocked, friendTyping } = storeToRefs(chatStore);
const { systemMessage } = storeToRefs(messageStore);
const { isSearch, isChat, isGroup } = storeToRefs(mainStore);
const { socket } = storeToRefs(websocketStore);

// Chat box setup, Messages and Chat Functions
const messageToSend = ref("");
const textInput = ref(null);

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

  // must wait for the DOM update
  nextTick(() => {
    // Update the cursor position to be at the end of the inserted emoji
    textInput.value.selectionStart = cursorPosition + emoji.i.length;
    textInput.value.selectionEnd = cursorPosition + emoji.i.length;
    // Place focus at the updated cursor position
    textInput.value.focus();
  })
}

const sendMessage = async () => {
  if (socket.value.readyState === 1 && messageToSend.value.trim() !== "") {
    await websocketStore.sendMessage(messageToSend.value)
    // Clear the input field
    messageToSend.value = "";
    // make input not editable before receive own message via websocket
    inputLocked.value = true;
    chatStore.scrollToBottom();
  }
}

const activeTab = ref(true);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    activeTab.value = false;
  } else {
    activeTab.value = true;
  }
});


onMounted(async () => {
  await websocketStore.connectWebsocket()
  systemMessage.value = { type: "success", content: "Websocket connection is established" };
  // Set a timeout to clear the systemMessage after 3 seconds
  setTimeout(() => {
    systemMessage.value = {};
  }, 3000);
});


onUpdated(() => {
  console.log("Updated");
});

</script>

<style scoped>
.activeEmoji {
  color: #009688 !important;
}
</style>
