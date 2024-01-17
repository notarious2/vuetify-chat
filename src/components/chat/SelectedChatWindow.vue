<template>
  <div>
    <ChatBoxHeader />
    <MainChat />
    <div style="position: relative;">
      <!-- combine v-if and v-show to not load component in mobile view -->
      <EmojiPicker v-if="!compactView" v-show="showEmoji" style="position: absolute; bottom: 80%;"
        @select="onSelectEmoji" />
    </div>

    <v-dialog width="500" v-model="showAttachmentPreview" :close-on-content-click="false">
      <v-card class="rounded-lg">
        <v-icon icon="mdi-close" class="ml-auto mr-2 mt-2 mb-n3" color="black" @click="closePreview" />
        <v-card-title>
          Attachment Preview
        </v-card-title>

        <v-img v-if="isPreviewImage" :src="previewImageUrl" height="500" />
        <p v-else class="text-center">
          <v-icon icon="mdi-file-pdf-box my-auto" size="x-large" color="teal"></v-icon>
        </p>
        <v-card-text>
          {{ previewFileName }}
        </v-card-text>
        <v-card-text>
          {{ previewFileSize }} Mb
        </v-card-text>
        <v-btn color="primary" class="my-5 mx-2">Send</v-btn>
      </v-card>

    </v-dialog>
    <!-- SEND BUTTON COMPONENT START -->
    <v-card class="rounded-0 rounded-be-lg">
      <v-row align="center" justify="center" no-gutters>
        <p class="ml-2 mr-n2">
          <v-file-input class="file-input text-icons font-weight-bold" @update:model-value="handleFileUpload" />
        </p>

        <v-icon v-if="!compactView" class="ml-2 mr-2" size="x-large" color="icons" :class="{ activeEmoji: showEmoji }"
          @click="toggleEmoji">mdi-emoticon-happy-outline</v-icon>
        <!-- @keydown.enter.exact.prevent -> Prevents next line on clicking ENTER -->
        <!-- We should be able to add a new line by pressing SHIFT+ENTER -->
        <v-textarea ref="textInput" @keydown.enter="sendMessage" hide-details label="Type your text" rows="1"
          v-model="messageToSend" auto-grow variant="solo" @input="websocketStore.handleUserTyping"
          :readonly="inputLocked || loadingMessages"></v-textarea>

        <v-btn @click="sendMessage" icon="mdi-send" variant="plain"
          :color="messageToSend === '' ? 'blue-grey-lighten-2' : 'send'" size="x-large" class="ml-0"
          style="font-size: 30px; transform: rotate(-5deg);">
        </v-btn>
      </v-row>

      <v-row v-show="friendTyping" class="mb-1 mt-0 ml-5 text-teal-darken-3">
        <strong>{{ currentFriendFirstName }}</strong>&nbsp;is typing
        <ThreeDots class="ml-n3" />
      </v-row>
      <v-row v-show="!friendTyping" class="mb-1 mt-0 ml-5" style="user-select: none;">&nbsp;</v-row>
    </v-card>
    <!-- SEND BUTTON COMPONENT END -->
  </div>
</template>

<script setup>
import { ref, nextTick, defineAsyncComponent } from "vue";
import { storeToRefs } from "pinia";



import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const ThreeDots = defineAsyncComponent(() => import("@/components/chat/ThreeDots.vue"))

import MainChat from "@/components/chat/MainChat.vue";
import ChatBoxHeader from "@/components/chat/ChatBoxHeader.vue";

import { useChatStore } from "@/store/chatStore";
import { useWebsocketStore } from "@/store/websocketStore";
import { useMainStore } from "@/store/mainStore";
import { useMessageStore } from "@/store/messageStore";
import { useUserStore } from "@/store/userStore";


const chatStore = useChatStore();
const websocketStore = useWebsocketStore();
const mainStore = useMainStore();
const messageStore = useMessageStore();
const userStore = useUserStore();


const { currentChatGUID, inputLocked, friendTyping, currentFriendFirstName } = storeToRefs(chatStore);
const { socket } = storeToRefs(websocketStore);
const { compactView } = storeToRefs(mainStore);
const { currentUser } = storeToRefs(userStore);
const { currentChatMessages, loadingMessages } = storeToRefs(messageStore);


// Chat box setup, Messages and Chat Functions
const messageToSend = ref("");
const textInput = ref(null);

const showAttachmentPreview = ref(false);
const previewFileName = ref("");
const previewFileSize = ref(null);
const previewImageUrl = ref("");
const isPreviewImage = ref(false);

const showEmoji = ref(false);

const toggleEmoji = () => {
  if (!showEmoji.value) {
    textInput.value.focus()
  }
  showEmoji.value = !showEmoji.value
}


const closePreview = () => {
  isPreviewImage.value = false;
  showAttachmentPreview.value = false;
}

const createPreviewData = (file) => {
  file = file[0]
  console.log("FILE", file);
  if (file.type === "image/jpeg") {

    const reader = new FileReader();

    reader.onload = e => {
      previewImageUrl.value = e.target.result;
    };
    isPreviewImage.value = true;
    reader.readAsDataURL(file);
  }
  previewFileSize.value = file.size / 1000000
  previewFileName.value = file.name

}


const handleFileUpload = (file) => {
  if (!file) {
    return;
  }
  createPreviewData(file);
  console.log("File Uploaded", file);
  showAttachmentPreview.value = true;
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

    // make input not editable before receive own message via websocket
    inputLocked.value = true;
    // close emoji if open
    showEmoji.value = false;
    // append messages without confirmation from websocket
    currentChatMessages.value.unshift(
      {
        user_guid: currentUser.value.userGUID,
        chat_guid: currentChatGUID,
        content: messageToSend.value,
        created_at: new Date(),
        is_read: false,
        is_sending: true,
      }
    );
    // Clear the input field
    messageToSend.value = "";
    // scroll to bottom when own new message is appended (after DOM update)
    nextTick(() => {
      chatStore.scrollToBottom("smooth");
    })



  }
}

</script>

<style scoped>
.activeEmoji {
  color: teal !important;
}

.file-input:deep().v-input__control,
.file-input:deep().v-input__details {
  display: none;
}
</style>
