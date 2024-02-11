<template>
  <v-container style="max-width: 1000px" :class="compactView ? 'pa-0' : ''">
    <v-row no-gutters>
      <!-- LEFT PANEL START -->
      <v-col class="bg-items rounded-s-lg fill-height" :cols="compactView ? 12 : 4">
        <MenuPanel v-show="!compactView" />

        <!-- wait for asynchronous component to load -->
        <!-- https://kaperskyguru.medium.com/exploring-suspense-in-vue-3-9e88c0c4535d -->
        <suspense v-if="isSearch">
          <template #default>
            <ContactsList :style="compactView ? { height: '540px' } : { height: '640px' }"
              :class="compactView ? '' : 'rounded-bs-lg'" />
          </template>
          <template #fallback>
            <ContactsLoading v-once :style="compactView ? { height: '540px' } : { height: '640px' }" />
          </template>
        </suspense>

        <ChatsList v-if="(isChat && !chatSelected) || (isChat && !compactView)"
          :style="compactView ? { height: '540px' } : { height: '640px' }" :class="compactView ? '' : 'rounded-bs-lg'" />

        <!-- these two appear irrespective of view -->

        <SelectedChatWindow v-if="compactView && isChat && chatSelected" style="height: 600px" />
        <GroupsList v-if="!compactView && isGroup" style="height: 640px" />
        <EmptyGroupWindow v-if="compactView && isGroup" style="height: 540px" />
      </v-col>
      <v-col v-show="compactView">
        <MenuPanel />
      </v-col>

      <!-- LEFT PANEL CHATS END -->

      <!-- RIGHT PANEL START  ONLY FOR LARGE VIEW -->
      <v-col v-if="!compactView" class="ma-0 pa-0">

        <SelectedChatWindow v-if="isChat && chatSelected" />
        <EmptyChatWindow v-else-if="isChat && !chatSelected" />
        <EmptySearchWindow v-else-if="isSearch" />
        <EmptyGroupWindow v-else-if="isGroup" class="rounded-e-lg" />
      </v-col>
      <!-- RIGHT PANEL END -->
    </v-row>
    <v-alert v-if="Object.keys(systemMessage).length > 0"
           height="70px"
           :color="alertColor"
           style="position: absolute; bottom: 60%"
           :style="compactView ? 'right: 10%;' : 'right: 30%;'"
           closable
           theme="dark"
           :icon="alertIcon"
           class="mt-3 text-center text-h6 font-weight-bold mx-auto rounded-xl">
    {{ systemMessage.content }}
  </v-alert>
  </v-container>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  onUpdated,
  defineAsyncComponent,
  computed,
} from "vue";
import { storeToRefs } from "pinia";
import { useTheme } from 'vuetify'

const alertColor = computed(() => {
  switch (systemMessage.value.type) {
    case 'error':
      return 'pink-accent-2';
    case 'success':
      return 'green-accent-1';
    case 'info':
      return 'orange-lighten-4'
    default:
      return 'indigo-lighten-2';
  }
});
const alertIcon = computed(() => {
  switch (systemMessage.value.type) {
    case 'success':
      return 'mdi-power-plug';
    case 'error':
      return 'mdi-power-plug-off';
    case 'info':
      return 'mdi-information-variant';
    default:
      return ''; // handle other cases as needed
  }
});
const theme = useTheme();

const ContactsList = defineAsyncComponent(() =>
  import("@/components/ContactsList.vue")
);
const GroupsList = defineAsyncComponent(() =>
  import("@/components/GroupsList.vue")
);

import EmptyChatWindow from "@/components/EmptyChatWindow.vue";
import ChatsList from "@/components/ChatsList.vue";
import MenuPanel from "@/components/MenuPanel.vue";

import ContactsLoading from "@/components/ContactsLoading.vue";


import SelectedChatWindow from "@/components/chat/SelectedChatWindow.vue"
import EmptyGroupWindow from "@/components/EmptyGroupWindow.vue"
import EmptySearchWindow from "@/components/EmptySearchWindow.vue"

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
const { currentUser, currentTheme } = storeToRefs(userStore);


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
  theme.global.name.value = currentTheme.value;

  await chatStore.getDirectChats(currentUser.value.userGUID);
  // connect to websocket only if connection does not exist
  if (!websocketStore.socketExists) {
    await websocketStore.connectWebsocket();
    messageStore.displaySystemMessage("success", "Websocket connected", 1000)
  }

  userStore.setEmptyFriendStatuses();

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
