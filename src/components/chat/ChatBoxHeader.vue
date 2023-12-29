<template>
  <v-card class="rounded-0 bg-teal-lighten-4" height="60px" :class="compactView ? 'rounded-te-0' : 'rounded-te-lg'">

    <v-card-title style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">

      <div class="d-flex align-center">
        <img :src="ArrowBackImageURL" style="height: 30px; cursor: pointer;" class="filter-teal mr-3" @click="goBack" />
        <img v-if="currentFriendImage && !currentFriendImageError" :src="currentFriendImage"
          class="profile-image"
          :alt="`${currentFriendFirstName}_image`" style="cursor: pointer;" @error="handleImageError()"
          @click="showPhoto = true"/>
          <img v-else-if="currentFriendImageError" :src="notAvailablePhotoURL" alt="userImageNotAvailable" class="profile-image">
          <img v-else :src="defaultPhotoURL" alt="defaultUserImage" class="profile-image">
        <StatusCircle :friendStatus="friendStatuses[currentFriendGUID]" />
        <span class="ml-1">{{ currentFriendFirstName }}</span>
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
    <v-dialog width="50%" v-model="showPhoto">
    <img :src="currentFriendImage" :class="compactView ? 'image-enlarged-small' : 'image-enlarged-large'" alt="Overlay Image">
  </v-dialog>
  </v-card>


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
const mainStore = useMainStore();

const { compactView } = storeToRefs(mainStore);
const { friendStatuses } = storeToRefs(userStore);
const { currentFriendUserName, currentFriendFirstName, currentFriendImageError, currentFriendGUID, currentFriendImage, chatSelected, currentChatGUID } = storeToRefs(chatStore);

const ArrowBackImageURL = new URL("@/assets/arrow_back.svg", import.meta.url).href;
const defaultPhotoURL = new URL("@/assets/photo-default.png", import.meta.url).href;
const notAvailablePhotoURL = new URL("@/assets/photo-not-available.png", import.meta.url).href;

console.log("HEADER!");

const showPhoto = ref(false)

console.log("Compact View?", compactView.value)
const goBack = () => {
  chatSelected.value = false;
  currentChatGUID.value = null;
  currentFriendImage.value = "";
  currentFriendUserName.value = "";
  currentFriendFirstName.value = "";
  currentFriendGUID.value = "";


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

.image-enlarged-large {
  border-radius: 50%;
  width:  500px;
  height:  500px;
  object-fit: cover; 
}

.image-enlarged-small {
  border-radius: 50%;
  width:  300px;
  height:  300px;
  object-fit: cover; 
  position: absolute;
  bottom: 0;
  left: -25%;
}
</style>