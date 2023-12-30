<template>
  <v-container style="max-width: 1000px" :class="compactView ? 'pa-0' : ''">
    <v-row no-gutters>
      <!-- LEFT PANEL START -->
      <v-col class="bg-teal-lighten-5 rounded-s-lg fill-height" :cols="compactView ? 12 : 4">
        <MenuPanel v-if="!compactView" />
        <!-- these two appear irrespective of view -->
        <ContactList v-if="isSearch" :style="compactView ? { height: '540px' } : { height: '640px' }"
          :class="compactView ? '' : 'rounded-bs-lg'" />
        <ChatsList v-if="(isChat && !chatSelected) || (isChat && !compactView)"
          :style="compactView ? { height: '540px' } : { height: '640px' }" :class="compactView ? '' : 'rounded-bs-lg'" />

        <!-- these two appear irrespective of view -->

        <SelectedChatWindow v-if="compactView && isChat && chatSelected" style="height: 540px" />
        <GroupsList v-if="!compactView && isGroup" style="height: 640px" />
        <EmptyGroupWindow v-if="compactView && isGroup" style="height: 540px" />
      </v-col>
      <v-col v-if="compactView">
        <MenuPanel />
      </v-col>

      <!-- LEFT PANEL CHATS END -->

      <!-- RIGHT PANEL START  ONLY FOR LARGE VIEW -->
      <v-col v-if="!compactView" class="ma-0 pa-0">
        <!-- wait for asynchronous component to load -->
        <!-- https://kaperskyguru.medium.com/exploring-suspense-in-vue-3-9e88c0c4535d -->
        <suspense v-if="isChat && chatSelected">
          <template #default>
            <SelectedChatWindow />
          </template>
          <template #fallback>
            <ChatLoading />
          </template>
        </suspense>

        <EmptyChatWindow v-else-if="isChat && !chatSelected" />
        <EmptySearchWindow v-else-if="isSearch" />
        <EmptyGroupWindow v-else-if="isGroup" class="rounded-e-lg" />
      </v-col>
      <!-- RIGHT PANEL END -->
    </v-row>
    <v-alert v-if="Object.keys(systemMessage).length > 0" height="70px" :color="systemMessage.type === 'error'
      ? 'pink-accent-2'
      : systemMessage.type === 'system'
        ? 'blue-grey-lighten-2'
        : 'indigo-lighten-2'
      " style="position: absolute; bottom: 60%" :style="compactView ? 'right: 10%;' : 'right: 30%;'" closable
      theme="dark" :icon="systemMessage.type === 'success'
        ? 'mdi-power-plug'
        : 'mdi-power-plug-off'
        " class="mt-3 text-center text-h6 font-weight-bold mx-auto rounded-xl">
      {{ systemMessage.content }}</v-alert>
  </v-container>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  onUpdated,
  defineAsyncComponent,
} from "vue";
import { storeToRefs } from "pinia";

const ContactList = defineAsyncComponent(() =>
  import("@/components/ContactList.vue")
);
const GroupsList = defineAsyncComponent(() =>
  import("@/components/GroupsList.vue")
);

// should not lazy load these components as they are first to be shown by default
import EmptyChatWindow from "@/components/EmptyChatWindow.vue";
import ChatsList from "@/components/ChatsList.vue";
import MenuPanel from "@/components/MenuPanel.vue";

import ChatLoading from "@/components/chat/ChatLoading.vue";

const SelectedChatWindow = defineAsyncComponent(() =>
  import("@/components/chat/SelectedChatWindow.vue")
);
const EmptyGroupWindow = defineAsyncComponent(() =>
  import("@/components/EmptyGroupWindow.vue")
);
const EmptySearchWindow = defineAsyncComponent(() =>
  import("@/components/EmptySearchWindow.vue")
);

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
const { isSearch, isChat, isGroup, compactView } = storeToRefs(mainStore);
const { currentUser } = storeToRefs(userStore);

const activeTab = ref(true);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    activeTab.value = false;
  } else {
    activeTab.value = true;
  }
});

// important to render appropriate view
compactView.value = window.innerWidth < 700 ? true : false;

onMounted(async () => {
  await chatStore.getDirectChats(currentUser.value.userGUID);
  // connect to websocket only if connection does not exist
  if (!websocketStore.socketExists) {
    await websocketStore.connectWebsocket();
    systemMessage.value = { type: "success", content: "Websocket connected" };
  }

  userStore.setEmptyFriendStatuses();
  // Set a timeout to clear the systemMessage after 3 seconds
  setTimeout(() => {
    systemMessage.value = {};
  }, 3000);

  window.addEventListener("resize", handleWindowChange);
  compactView.value = window.innerWidth < 700 ? true : false;
});

const handleWindowChange = () => {
  // console.log("WIDTH", window.innerWidth, "Available", window.screen.availWidth);
  compactView.value = window.innerWidth < 700 ? true : false;
};

onUpdated(() => {
  console.log("Updated");
});

onUnmounted(() => {
  // must remove event listener(s)
  window.removeEventListener("resize", handleWindowChange);
});
</script>

<style scoped>
/* #Chat {
  background-image: url("@/assets/chat-background.jpg");
} */
</style>
