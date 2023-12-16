<template>
    <div>
        <ChatBoxHeader />
        <MainChat/>
        <div style="position: relative;">
            <!-- combine v-if and v-show to not load component in mobile view -->
            <EmojiPicker v-if="!compactView" v-show="showEmoji" style="position: absolute; bottom: 80%;" @select="onSelectEmoji" />
        </div>

        <!-- SEND BUTTON COMPONENT START -->
        <v-card class="rounded-0 rounded-be-lg" height="90px">
            <v-row align="center" justify="center" no-gutters>

                <v-icon class="ml-2" :class="compactView ? 'mr-2' : ''" size="x-large" color="teal" style="transform: rotate(10deg)">mdi-paperclip</v-icon>
                <v-icon v-if="!compactView" class="ml-2 mr-2" size="x-large" color="teal-lighten-2" :class="{ activeEmoji: showEmoji }"
                    @click="toggleEmoji">mdi-emoticon-happy-outline</v-icon>
                <!-- @keydown.enter.exact.prevent -> Prevents next line on clicking ENTER -->
                <!-- We should be able to add a new line by pressing SHIFT+ENTER -->
                <v-textarea ref="textInput" hide-details label="Type your text" rows="1" v-model="messageToSend" auto-grow
                    variant="solo" @keydown.enter.exact.prevent @keyup.enter.exact.prevent="sendMessage"
                    @input="websocketStore.handleUserTyping" :readonly="inputLocked"></v-textarea>

                <v-btn @click="sendMessage" icon="mdi-send" variant="plain" :color="messageToSend === '' ? 'gray' : 'teal'"
                    size="x-large" class="ml-0" style="font-size: 30px; transform: rotate(-5deg);">
                </v-btn>
            </v-row>

            <v-row v-show="friendTyping" class="mb-1 mt-0 ml-5 text-teal-darken-3">typing
                <ThreeDots class="ml-n3" />
            </v-row>
            <v-row v-show="!friendTyping" class="mb-1 mt-0 ml-5" style="user-select: none;">&nbsp;</v-row>
        </v-card>
        <!-- SEND BUTTON COMPONENT END -->
      </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { storeToRefs } from "pinia";

import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

import MainChat from "@/components/chat/MainChat.vue";
import ThreeDots from "@/components/chat/ThreeDots.vue";
import ChatBoxHeader from "@/components/chat/ChatBoxHeader.vue";

import { useChatStore } from "@/store/chatStore";
import { useWebsocketStore } from "@/store/websocketStore";
import { useMainStore } from "@/store/mainStore";

const chatStore = useChatStore();
const websocketStore = useWebsocketStore();
const mainStore = useMainStore();

const { inputLocked, friendTyping } = storeToRefs(chatStore);
const { socket } = storeToRefs(websocketStore);
const { compactView } = storeToRefs(mainStore);

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
    // close emoji if open
    showEmoji.value = false;
  }
}

</script>

<style scoped>
.activeEmoji {
  color: teal !important;
}
</style>
