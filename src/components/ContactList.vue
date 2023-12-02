<template>
  <!-- style="overflow: auto; color: inherit" class="rounded-0" -->
  <div class="bg-teal-lighten-5">
    <v-text-field
      variant="solo"
      class="mx-3 py-2 search-input"
      rounded
      prepend-inner-icon="mdi-magnify"
      clearable
      v-model="searchContact"
      hide-details
    ></v-text-field>
    <v-list
      v-for="user in filteredUsers()"
      :key="user.guid"
      class="bg-teal-lighten-5"
      style="cursor: pointer; user-select: none"
    >
      <v-list-item
        class="list-item mx-3 rounded-lg"
        @click="userSelected(user.guid)"
      >
        <v-list-item-title class="d-flex align-center">
          <v-avatar class="ml-0">
            <v-img
              src="https://cdn.vuetifyjs.com/images/john.jpg"
              alt="John"
            ></v-img>
          </v-avatar>
          <StatusCircle :friendStatus="friendStatuses[user.guid]"/>
          <p>{{ user.username }}</p>

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

const userStore = useUserStore();
const chatStore = useChatStore();
const messageStore = useMessageStore();
const mainStore = useMainStore();

const { currentChatMessages } = storeToRefs(messageStore);
const { users, friendStatuses } = storeToRefs(userStore);
const { isSearch, isChat } = storeToRefs(mainStore);

const { directChats, chatSelected, currentChatGUID, currentFriendUserName } =
  storeToRefs(chatStore);


const searchContact = ref("");

const userSelected = async (userGUID) => {
  isSearch.value = false;
  isChat.value = true;

  let chatFound = false;
  for (const chat of directChats.value) {

    // load existing chat if there is chat with selected user
    if (chat.friend.guid === userGUID) {
      console.log("You already have conversation with this user, loading chat...");
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
      friend: { username: selectedUser.username, guid: selectedUser.guid },
      created_at: null,
      has_new_messages: false,
      new_messages_count: 0,
      updated_at: null,
    });
    console.log("Created a temporary chat")
    currentChatGUID.value = "unassigned";
    chatSelected.value = true;
    currentChatMessages.value = []; // clear messages history from previous chat
    currentFriendUserName.value = selectedUser.username;
  }
};


const filteredUsers = () => {
  return users.value.filter(
    (user) =>
      !searchContact.value ||
      user.username.toLowerCase().includes(searchContact.value.toLowerCase())
  );
};


onMounted(async () => {
  console.log("Getting users");
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
</style>
