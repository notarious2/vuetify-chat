<template>
  <div style="height: 580px; overflow: auto; color: inherit" class="rounded-0">
    <v-text-field
      variant="solo"
      class="mx-5 my-2 pa-0 search-input"
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
          <p class="ml-2">{{ user.username }}</p>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "@/api/axios";
import { useMainStore } from "@/store/mainStore";
import { useChatStore } from "@/store/chatStore";
import { useMessageStore } from "@/store/messageStore";
import { storeToRefs } from "pinia";

const chatStore = useChatStore();
const messageStore = useMessageStore();
const mainStore = useMainStore();
const { currentChatMessages } = storeToRefs(messageStore);

const { isSearch, isChat } = storeToRefs(mainStore);

const { directChats, chatSelected, currentChatGUID, friendUserName, curren } =
  storeToRefs(chatStore);

const users = ref([]);

const searchContact = ref("");

const userSelected = async (userGUID) => {
  isSearch.value = false;
  isChat.value = true;

  let chatFound = false;
  for (const chat of directChats.value) {
    // open already existing chat
    if (chat.friend.guid === userGUID) {
      console.log("You already have a chat with this user");
      chatSelected.value = true;
      currentChatGUID.value = chat.chat_guid;
      chatFound = true;
      // if that chat was unselected previously, must load that chat again
      if (currentChatMessages.value.length === 0) {
        console.log("Re-loading chat again...");
        try {
          await messageStore.getLastMessages(
            chat.chat_guid
          );
        } catch (error) {
          console.log("Error in loadChat", error);
        }
      }

      break;
    } else if (
      chat.friend.guid === userGUID &&
      currentChatGUID.value !== chat.chat_guid
    ) {
      // must load chat
      let chatGUID = chat.chat_guid;
      chatSelected.value = true;
      chatStore.setChatAsActive(chatGUID);
      try {
        const getLastMessagesResponse = await messageStore.getLastMessages(
          chatGUID
        );
        currentChatMessages.value = getLastMessagesResponse.messages;
      } catch (error) {
        console.log("Error in loadChat", error);
      }
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
    friendUserName.value = selectedUser.username;
  }
};


const filteredUsers = () => {
  return users.value.filter(
    (user) =>
      !searchContact.value ||
      user.username.toLowerCase().includes(searchContact.value.toLowerCase())
  );
};

const getUsers = async () => {
  try {
    const response = await axios.get("/users/");
    users.value = response.data;
  } catch (error) {
    console.error("Error during getting Users:", error);
    throw error;
  }
};

onMounted(async () => {
  await getUsers();
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
