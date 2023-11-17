<template>
    <v-card class="bg-teal-lighten-4 rounded-0 rounded-ts-lg">
      <div class="mt-5 mb-3 d-flex justify-space-around">
        <v-icon size="large" class="flex-grow-1" id="icon-search" color="teal-lighten-3" :class="{ searchTab: isSearch }"
          @click="toggleSearch">mdi-compass
        </v-icon>
        <v-icon size="large" class="flex-grow-1" id="icon-chats" color="teal-lighten-3" :class="{ chatsTab: isChat }"
          @click="toggleChat">mdi-chat
        </v-icon>
        <v-icon size="large" class="flex-grow-1" id="icon-groups" color="teal-lighten-3" :class="{ groupsTab: isGroup }"
          @click="toggleGroup">mdi-account-group
        </v-icon>
      </div>
      <v-divider />
    </v-card>
  </template>
  
  <script setup>
  
  import { useMainStore } from "@/store/mainStore";
  import { storeToRefs } from "pinia";
  import { useChatStore } from "@/store/chatStore";
  
  const chatStore = useChatStore();
  const mainStore = useMainStore();


  const { isSearch, isChat, isGroup } = storeToRefs(mainStore);


  const toggleSearch = () => {
    isSearch.value = true;
    isChat.value = false;
    isGroup.value = false;
    chatStore.removeUnassignedChat();
  };
  
  const toggleChat = () => {
    isChat.value = true;
    isSearch.value = false;
    isGroup.value = false;
  };
  
  const toggleGroup = () => {
    isGroup.value = true;
    isChat.value = false;
    isSearch.value = false;
  };
  </script>
  
  <style scoped>
  #icon-search:hover,
  #icon-chats:hover,
  #icon-groups:hover {
    color: #009688 !important;
  }
  
  .searchTab {
    color: #009688 !important;
    animation: rotate 0.5s;
  }
  
  .chatsTab {
    color: #009688 !important;
    animation: beat 0.5s;
  }
  
  .groupsTab {
    color: #009688 !important;
    animation: swing 0.5s;
  }
  
  @keyframes beat {
    15%, 85% { transform: scale(1.1); }
    25%, 75% { transform: scale(1.2); }
    50% { transform: scale(1.3); }
  }
  
  @keyframes swing {
    20% { transform: skew(-10deg); }
    40% { transform: skew(-15deg); }
    60% { transform: skew(10deg); }
    80% { transform: skew(15deg); }
  }
  
  @keyframes rotate {
    15%, 85% { transform: rotate(-0.2turn); }
    25%, 75% { transform: rotate(-0.4turn); }
    50% { transform: rotate(-0.6turn); }
  }
  
  </style>
  