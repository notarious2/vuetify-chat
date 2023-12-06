<template>
  <v-card class="rounded-0 rounded-te-lg bg-teal-lighten-3" height="60px">
    <v-card-title style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
      <div class="d-flex align-center">
        <img :src="imageURL" style="height: 30px; cursor: pointer;" class="filter-teal mr-5" @click="goBack" />
        <v-avatar class="ml-auto">
          <v-img v-if="currentFriendImage && !currentFriendImageError" :src="currentFriendImage"
            :alt="`${currentFriendUserName}_image`" @error="handleImageError()"></v-img>
          <!-- Image failed to load -->
          <v-icon v-else-if="currentFriendImageError" icon="mdi-account-alert" size="large" color="teal"></v-icon>
          <v-icon v-else icon="mdi-account" size="large" color="teal"></v-icon>
        </v-avatar>
        <StatusCircle :friendStatus="friendStatuses[currentFriendGUID]" />
        <span class="ml-1">{{ currentFriendUserName }}</span>
      </div>
      <v-icon color="teal">mdi-dots-vertical</v-icon>
    </v-card-title>
  </v-card>
</template>


<script setup>
import { storeToRefs } from "pinia";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { ref } from "vue";

import StatusCircle from "@/components/StatusCircle.vue";

const chatStore = useChatStore();
const userStore = useUserStore();
const currentFriendImageError = ref(false);

const { friendStatuses } = storeToRefs(userStore);
const { currentFriendUserName, currentFriendGUID, currentFriendImage, chatSelected, currentChatGUID } = storeToRefs(chatStore);

const imageURL = new URL("@/assets/arrow_back.svg", import.meta.url).href;

const goBack = () => {
  console.log("Going back");
  chatSelected.value = false;
  currentChatGUID.value = null;
}

const handleImageError = () => {
  currentFriendImageError.value = true;
};
</script>

<style scoped>
.filter-teal {
  filter: invert(35%) sepia(21%) saturate(3419%) hue-rotate(145deg) brightness(95%) contrast(102%);
}
</style>