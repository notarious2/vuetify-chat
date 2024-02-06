<template>
  <div id="chatList" class="bg-items">
    <v-list class="bg-items" v-for="directChat in directChats">
      <v-list-item v-ripple="false" class="px-2" @click="selectChat(directChat)">
        <v-list-item-title class="list-item d-flex align-center py-2 rounded-lg"
          :class="{ 'bg-select': currentChatGUID === directChat.chat_guid }">
          <!-- profile-image - globally defined class (in App.vue) -->
          <!-- v-img and v-avatar are lagging when rounding -->
          <div style="width: 45px;" class="ml-1">
            <img v-if="directChat.friend.user_image && !directChat.friend.imageError"
                class="profile-image"
                :src="directChat.friend.user_image" :alt="`${directChat.friend.username}_image`"
                @error="() => handleImageError(directChat.friend)"/>
              <!-- <v-icon v-else-if="directChat.friend.imageError" icon="mdi-account-alert" size="large" color="teal"></v-icon> -->
              <img v-else-if="directChat.friend.imageError" :src="notAvailablePhotoURL" class="profile-image" />

              <img v-else :src="defaultPhotoURL" class="profile-image" />

              <!-- <v-icon v-else icon="mdi-account" size="large" color="teal"></v-icon> -->
          </div>
          <StatusCircle :friendStatus="friendStatuses[directChat.friend.guid]" />
          <p>{{ directChat.friend.first_name }}</p>
          <p v-if="directChat.new_messages_count" class="ml-10 bg-panel font-weight-regular rounded-circle px-2">
            {{ directChat.new_messages_count }}
          </p>
          <p class="ml-auto mr-2 font-weight-bold">
            {{ formatTimeFromDateString(directChat.updated_at) }}
          </p>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { formatTimeFromDateString } from "@/utils/dateUtils";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";

import StatusCircle from "@/components/StatusCircle.vue";
import { onMounted } from "vue";
import { event } from "vue-gtag";

const chatStore = useChatStore();
const userStore = useUserStore();
const defaultPhotoURL = new URL("@/assets/photo-default.png", import.meta.url).href;
const notAvailablePhotoURL = new URL("@/assets/photo-not-available.png", import.meta.url).href;


const { currentChatGUID, directChats, chatSelected, currentFriendFirstName } = storeToRefs(chatStore);
const { friendStatuses } = storeToRefs(userStore);

const handleImageError = (friend) => {
  friend.imageError = true;
};

const chatSelectedGA = async () => {
  event("chats-selected", {
    event_category: "analytics",
    event_label: "Chats Selected",
    value: 1,
  });
}


const selectChat = async (directChat) => {
  await chatStore.loadChat(directChat); 
  await updateWindowTitle(directChat.friend);
  await chatSelectedGA();
}

const changeTitle = async (newTitle) => {
  window.document.title = newTitle;
};

const updateWindowTitle = async (friend) => {
  if (friend.first_name) {
    window.document.title = `Chat: ${friend.first_name}`
  } 
}

onMounted (async () => {
  if (chatSelected.value) {
    await changeTitle(`Chat: ${currentFriendFirstName.value}`);  
  } else {
    await changeTitle("Ponder Pal: Direct Chats");
  }
});

</script>

<style scoped>
#chatList {
  overflow: auto;
}

/* Styling the scrollbar */
#chatList::-webkit-scrollbar {
  width: 13px;
  /* Width of the entire scrollbar */
}


#chatList::-webkit-scrollbar-track {
  background-color: rgb(var(--v-theme-track));
  /* Color of the track (the area behind the thumb) */

}

#chatList::-webkit-scrollbar-thumb {
  background-color: rgb(var(--v-theme-primary));
  /* Color of the thumb (the draggable part) */
  border-radius: 6px;
  /* Roundness of the thumb */
}

.list-item:hover {
  background-color: rgb(var(--v-theme-select));
  border-radius: 6px;
}
/* .v-list-item:hover{
  opacity: 0;
} */

</style>