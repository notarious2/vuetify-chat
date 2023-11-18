<template>
  <v-container>
    <v-row no-gutters>
      <!-- LEFT PANEL START -->
      <v-col cols="4" class="bg-teal-lighten-5 rounded-s-lg"> <!--:cols="compactView? 8: 4" -->
        <MenuPanel />
        <ContactList v-if="isSearch" />
        <ChatList v-if="isChat"/>
      </v-col>
      <!-- LEFT PANEL CHATS END -->

      <!-- RIGHT PANEL START -->
      <SelectedChatWindow v-if="isChat && chatSelected"/>
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
import { ref, onMounted, onUnmounted, onUpdated } from "vue";
import { storeToRefs } from "pinia";


import MenuPanel from "@/components/MenuPanel.vue";
import ContactList from "@/components/ContactList.vue";
import ChatList from "@/components/ChatList.vue";

import SelectedChatWindow from "@/components/chat/SelectedChatWindow.vue";
import EmptyChatWindow from "@/components/EmptyChatWindow.vue";
import EmptyGroupWindow from "@/components/EmptyGroupWindow.vue";
import SearchWindow from "@/components/SearchWindow.vue";

import { useChatStore } from "@/store/chatStore";
import { useMessageStore } from "@/store/messageStore";
import { useMainStore } from "@/store/mainStore";
import { useWebsocketStore } from "@/store/websocketStore";
import { useUserStore } from "@/store/userStore";

const chatStore = useChatStore();
const messageStore = useMessageStore();
const mainStore = useMainStore();
const websocketStore = useWebsocketStore();
const userStore = useUserStore();

const { chatSelected } = storeToRefs(chatStore);
const { systemMessage } = storeToRefs(messageStore);
const { isSearch, isChat, isGroup } = storeToRefs(mainStore);
const { currentUser } = storeToRefs(userStore);


const activeTab = ref(true);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    activeTab.value = false;
  } else {
    activeTab.value = true;
  }
});

// const compactView = ref(false)

onMounted(async () => {
  await chatStore.getDirectChats(currentUser.value.userGUID);
  await websocketStore.connectWebsocket()
  userStore.setEmptyFriendStatuses();
  systemMessage.value = { type: "success", content: "Websocket connection is established" };
  // Set a timeout to clear the systemMessage after 3 seconds
  setTimeout(() => {
    systemMessage.value = {};
  }, 3000);

  // window.addEventListener('resize', handleWindowChange);

});


// const handleWindowChange = () => {
//   // console.log("WIDTH", window.innerWidth, "Available", window.screen.availWidth);
//   compactView.value = window.innerWidth < 700 ? true : false;

//   console.log("Compact view:", compactView.value);

// }

onUpdated(() => {
  console.log("Updated");
});

onUnmounted(() => {
  // must remove event listener(s)
  // window.removeEventListener('resize', handleWindowChange);

})

</script>
