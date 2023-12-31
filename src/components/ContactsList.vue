<template>
  <!-- style="overflow: auto; color: inherit" class="rounded-0" -->
  <div id="contactList" class="bg-teal-lighten-5">
    <v-text-field variant="solo" class="mx-3 py-2 search-input" rounded prepend-inner-icon="mdi-magnify" clearable
      v-model="searchContact" hide-details></v-text-field>
    <v-list v-for="user in filteredUsers()" :key="user.guid" class="bg-teal-lighten-5"
      style="cursor: pointer; user-select: none;" >
      <v-list-item v-ripple="false" class="list-item mx-3 rounded-lg" @click="userSelected(user.guid)">
        <v-list-item-title class="d-flex align-center">
          <div style="width: 45px;">
            <img v-if="user.user_image && !user.imageError" :src="user.user_image" :alt="`${user.username}_image`"
              class="profile-image" @error="() => handleImageError(user)" />
            <!-- Image failed to load -->
            <img v-else-if="user.imageError" :src="notAvailablePhotoURL" class="profile-image" />
            <img v-else :src="defaultPhotoURL" class="profile-image" />
          </div>
          <StatusCircle :friendStatus="friendStatuses[user.guid]" />
          <p>{{ user.first_name }}</p>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useMainStore } from "@/store/mainStore";
import { useChatStore } from "@/store/chatStore";
import { useMessageStore } from "@/store/messageStore";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";

import StatusCircle from "@/components/StatusCircle.vue";

const defaultPhotoURL = new URL("@/assets/photo-default.png", import.meta.url).href;
const notAvailablePhotoURL = new URL("@/assets/photo-not-available.png", import.meta.url).href;

const userStore = useUserStore();
const chatStore = useChatStore();
const messageStore = useMessageStore();
const mainStore = useMainStore();

const { currentChatMessages } = storeToRefs(messageStore);
const { users, friendStatuses } = storeToRefs(userStore);
const { isSearch, isChat } = storeToRefs(mainStore);

const {
  directChats,
  chatSelected,
  currentChatGUID,
  currentFriendUserName,
  currentFriendFirstName,
  currentFriendImage,
  currentFriendGUID,
} = storeToRefs(chatStore);

const searchContact = ref("");

const userSelected = async (userGUID) => {
  isSearch.value = false;
  isChat.value = true;

  let chatFound = false;
  for (const chat of directChats.value) {
    // load existing chat if there is chat with selected user
    if (chat.friend.guid === userGUID) {
      console.log(
        "You already have conversation with this user, loading chat..."
      );
      await chatStore.loadChat(chat);
      chatFound = true;
      break;
    }
  }
  if (!chatFound) {
    const selectedUser = users.value.find((user) => user.guid === userGUID);
    // Create temporary window, which will initiate a chat if a message is sent
    directChats.value.unshift({
      chat_guid: "unassigned",
      friend: {
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        username: selectedUser.username,
        guid: selectedUser.guid,
        user_image: selectedUser.user_image,
      },
      created_at: null,
      has_new_messages: false,
      new_messages_count: 0,
      updated_at: null,
    });
    // set image for chat box header in unassigned chat
    currentFriendImage.value = selectedUser.user_image;
    console.log("Created a temporary chat");
    currentChatGUID.value = "unassigned";
    chatSelected.value = true;
    currentChatMessages.value = []; // clear messages history from previous chat
    currentFriendUserName.value = selectedUser.username;
    currentFriendFirstName.value = selectedUser.first_name;
    currentFriendGUID.value = userGUID;
  }
};

const filteredUsers = () => {
  if (!Array.isArray(users.value)) {
    return;
  }

  if (users.value === undefined || users.value.length == 0) {
    return;
  }

  return users.value.filter(
    (user) =>
      !searchContact.value ||
      user.first_name.toLowerCase().includes(searchContact.value.toLowerCase())
  );
};

const handleImageError = (user) => {
  user.imageError = true;
};

onMounted(async () => {
  await userStore.getUsers();
});
</script>

<style scoped>

.list-item:hover {
  background-color: #b6e8e3;
}

.search-input :deep() .v-field__input {
  font-size: 15px;
}

#contactList {
  overflow: auto;
}

/* Styling the scrollbar */
#contactList::-webkit-scrollbar {
  width: 13px;
  /* Width of the entire scrollbar */
}

#contactList::-webkit-scrollbar-track {
  background: #b2e6e1;
  /* Color of the track (the area behind the thumb) */
}

#contactList::-webkit-scrollbar-thumb {
  background-color: teal;
  /* Color of the thumb (the draggable part) */
  border-radius: 6px;
  /* Roundness of the thumb */
}
</style>
