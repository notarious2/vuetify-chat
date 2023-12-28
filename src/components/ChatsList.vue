<template>
  <div class="bg-teal-lighten-5" id="chatList">
    <v-list class="bg-teal-lighten-5" v-for="directChat in directChats">
      <v-list-item class="px-2" @click="chatStore.loadChat(directChat)">
        <v-list-item-title class="d-flex align-center py-2 rounded-lg"
          :class="{ 'bg-teal-lighten-1': currentChatGUID === directChat.chat_guid }">
          <!-- profile-image - globally defined class (in App.vue) -->
          <!-- v-img and v-avatar are lagging when rounding -->
          <div style="width: 45px;" class="ml-1">
            <img v-if="directChat.friend.user_image && !directChat.friend.imageError"
                class="profile-image" 
                :src="directChat.friend.user_image" :alt="`${directChat.friend.username}_image`"
                @error="() => handleImageError(directChat.friend)"/>
              <v-icon v-else-if="directChat.friend.imageError" icon="mdi-account-alert" size="large" color="teal"></v-icon>
              <v-icon v-else icon="mdi-account" size="large" color="teal"></v-icon>
          </div>  
          <StatusCircle :friendStatus="friendStatuses[directChat.friend.guid]" />
          <p>{{ directChat.friend.first_name }}</p>
          <p v-if="directChat.new_messages_count" class="ml-10 bg-teal-lighten-4 font-weight-regular rounded-circle px-2">
            {{ directChat.new_messages_count }}
          </p>
          <p class="ml-auto mr-2 font-weight-medium text-caption">
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

const chatStore = useChatStore();
const userStore = useUserStore();


const { currentChatGUID, directChats } = storeToRefs(chatStore);
const { friendStatuses } = storeToRefs(userStore);

const handleImageError = (friend) => {
  friend.imageError = true;
};

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
  background: #b2e6e1;
  /* Color of the track (the area behind the thumb) */

}

#chatList::-webkit-scrollbar-thumb {
  background-color: teal;
  /* Color of the thumb (the draggable part) */
  border-radius: 6px;
  /* Roundness of the thumb */
}


</style>