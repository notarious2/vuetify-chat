<template>
  <v-card class="rounded-0 bg-teal-lighten-3" height="60px" :class="compactView ? 'rounded-te-0' : 'rounded-te-lg'">

    <v-card-title style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
      <div class="d-flex align-center">
        <img :src="imageURL" style="height: 30px; cursor: pointer;" class="filter-teal mr-5" @click="goBack" />
        <v-avatar class="ml-auto">
          <v-img v-if="currentFriendImage && !currentFriendImageError" :src="currentFriendImage"
            :alt="`${currentFriendUserName}_image`" style="cursor: pointer;" @error="handleImageError()"
            @click="showPhoto = true"></v-img>

          <!-- Image failed to load -->
          <v-icon v-else-if="currentFriendImageError" icon="mdi-account-alert" size="large" color="teal"></v-icon>
          <v-icon v-else icon="mdi-account" size="large" color="teal"></v-icon>
        </v-avatar>
        <StatusCircle :friendStatus="friendStatuses[currentFriendGUID]" />
        <span class="ml-1">{{ currentFriendUserName }}</span>
      </div>

      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" size="large" color="teal">mdi-dots-vertical
          </v-icon>
        </template>
        <v-list bg-color="teal-darken-1">
          <v-list-item append-icon="mdi-delete" title="Delete Chat" @click="deleteChat(currentChatGUID)">
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>

  </v-card>

  <v-dialog width="50%" v-model="showPhoto">
    <img :src="currentFriendImage" class="rounded-circle" alt="Overlay Image">
  </v-dialog>
</template>


<script setup>
import { storeToRefs } from "pinia";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { useMainStore } from "@/store/mainStore";

import { ref } from "vue";

import StatusCircle from "@/components/StatusCircle.vue";

const chatStore = useChatStore();
const userStore = useUserStore();
const currentFriendImageError = ref(false);
const mainStore = useMainStore();

const { compactView } = storeToRefs(mainStore);
const { friendStatuses } = storeToRefs(userStore);
const { currentFriendUserName, currentFriendGUID, currentFriendImage, chatSelected, currentChatGUID } = storeToRefs(chatStore);

const imageURL = new URL("@/assets/arrow_back.svg", import.meta.url).href;

const showPhoto = ref(false)

console.log("Compact View?", compactView.value)
const goBack = () => {
  chatSelected.value = false;
  currentChatGUID.value = null;
  currentFriendImage.value = "";
  currentFriendUserName.value = "";
}

const handleImageError = () => {
  currentFriendImageError.value = true;
};

const deleteChat = async (chatGUID) => {
  const chatDeleted = await chatStore.deleteDirectChat(chatGUID)
  if (chatDeleted) {
    goBack();

  }
};


</script>

<style scoped>
.filter-teal {
  filter: invert(35%) sepia(21%) saturate(3419%) hue-rotate(145deg) brightness(95%) contrast(102%);
}
</style>