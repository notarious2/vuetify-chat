<template>
  <v-card class="bg-teal-lighten-4 rounded-0 rounded-ts-lg">
    <div class="mt-5 mb-3 d-flex justify-space-around">
      <v-menu :close-on-content-click="false" @click:outside="clickedOutside">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" size="large" class="flex-grow-1" id="icon-settings" @click="settingsClicked"
            :color="settingsColor">mdi-tune
          </v-icon>
        </template>
        <v-list bg-color="teal-darken-2" width="180px" class="ml-2">
          <!-- <v-list-item class="settings-items" append-icon="mdi-close">
          </v-list-item> -->
          <v-list-item class="settings-items" title="Settings">
          </v-list-item>
          <v-list-item class="settings-items" title="Logout" @click="logout">
          </v-list-item>
          <v-list-item class="mb-n2">
            <v-switch v-model="colorMode" true-value="Teal" false-value="Dark" :label="`${colorMode}`" inset
              color="teal-lighten-2"></v-switch>
          </v-list-item>
        </v-list>
      </v-menu>
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
import { useRouter } from "vue-router";
import { ref } from "vue";

import { storeToRefs } from "pinia";

import { useMainStore } from "@/store/mainStore";
import { useChatStore } from "@/store/chatStore";
import { useMessageStore } from "@/store/messageStore";
import { useUserStore } from "@/store/userStore";


const router = useRouter();


const chatStore = useChatStore();
const mainStore = useMainStore();
const messageStore = useMessageStore();
const userStore = useUserStore();

const { isSearch, isChat, isGroup } = storeToRefs(mainStore);
const { isBottom } = storeToRefs(chatStore);

const colorMode = ref("Teal")

const toggleSearch = () => {
  isSearch.value = true;
  isChat.value = false;
  isGroup.value = false;
  chatStore.removeUnassignedChat();
  messageStore.clearMoreMessagesToLoad();
  isBottom.value = true;
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


const logout = async () => {
  await userStore.logout();
  router.push("/")
}


const settingsColor = ref("teal-lighten-3")

const settingsClicked = () => {
  settingsColor.value = (settingsColor.value === "teal-lighten-3") ? "#009688" : "teal-lighten-3";
};

const clickedOutside = () => {
  settingsColor.value = "teal-lighten-3"
};

</script>

<style scoped>
#icon-search:hover,
#icon-chats:hover,
#icon-groups:hover,
#icon-settings:hover {
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

.settings-items:hover {
  color: #a1d7d2;
  cursor: pointer;
}

@keyframes beat {

  15%,
  85% {
    transform: scale(1.1);
  }

  25%,
  75% {
    transform: scale(1.2);
  }

  50% {
    transform: scale(1.3);
  }
}

@keyframes swing {
  20% {
    transform: skew(-10deg);
  }

  40% {
    transform: skew(-15deg);
  }

  60% {
    transform: skew(10deg);
  }

  80% {
    transform: skew(15deg);
  }
}

@keyframes rotate {

  15%,
  85% {
    transform: rotate(-0.2turn);
  }

  25%,
  75% {
    transform: rotate(-0.4turn);
  }

  50% {
    transform: rotate(-0.6turn);
  }
}
</style>
