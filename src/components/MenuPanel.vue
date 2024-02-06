<template>
  <v-card :class="compactView ? 'rounded-t-0' : 'rounded-ts-lg'" color="panel" class="rounded-0"
    style="height: 60px;">
    <div class="mt-5 mb-3 d-flex justify-space-around">
      <v-menu :close-on-content-click="false" @click:outside="clickedOutside">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" size="large" class="flex-grow-1" id="icon-settings" @click="settingsClicked"
            :color="settingsColor">mdi-tune
          </v-icon>
        </template>
        <v-list bg-color="submenu" width="180px" class="ml-2">
          <!-- <v-list-item class="settings-items" append-icon="mdi-close">
          </v-list-item> -->
          <v-list-item class="settings-items" title="Settings">
          </v-list-item>
          <v-list-item class="settings-items" title="Logout" @click="logout">
          </v-list-item>
          <v-list-item class="mb-n2">
            <v-switch v-model="currentTheme" true-value="teal" false-value="midnight" :label="currentTheme==='teal'? 'Teal' : 'Midnight'" inset
              color="teal-lighten-2" @change="switchTheme"></v-switch>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-icon size="large" class="flex-grow-1" id="icon-search" color="icons" :class="{ searchTab: isSearch }"
        @click="toggleSearch">mdi-compass
      </v-icon>
      <div class="d-flex flex-grow-1" style="position: relative;">
        <v-icon id="icon-chats" :class="{ chatsTab: isChat }" class="flex-grow-1" size="large" color="icons"
          @click="toggleChat">mdi-chat
        </v-icon>
        <p v-if="totalUnreadMessagesCount" class="px-1 bg-pink-lighten-3 rounded-lg"
          style="font-size: 10px; z-index: 1; user-select: none; position: absolute;"
          :style="compactView ? { 'right': '30%' } : { 'right': '20%' }"><span>{{ totalUnreadMessagesCount }}</span></p>
      </div>

      <v-icon size="large" class="flex-grow-1" id="icon-groups" :class="{ groupsTab: isGroup }" @click="toggleGroup"
        color="icons">mdi-account-group
      </v-icon>

    </div>
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
import { useTheme } from 'vuetify'
import { event } from "vue-gtag";

const theme = useTheme();

const router = useRouter();


const chatStore = useChatStore();
const mainStore = useMainStore();
const messageStore = useMessageStore();
const userStore = useUserStore();

const { isSearch, isChat, isGroup, compactView } = storeToRefs(mainStore);
const { isBottom, totalUnreadMessagesCount } = storeToRefs(chatStore);
const { currentTheme } = storeToRefs(userStore);

// const colorMode = ref("Teal")

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
  router.push("/")
  await userStore.logout();
  // reset theme to default 'teal'
  theme.global.name.value = 'teal';
}


const settingsColor = ref("icons")

const settingsSelectedGA = async () => {
  event("settings-selected", {
    event_category: "analytics",
    event_label: "Settings Selected",
    value: 1,
  });
}

const settingsClicked = async () => {
  settingsColor.value = (settingsColor.value === "icons") ? "primary" : "icons";
  await settingsSelectedGA();
};

const clickedOutside = () => {
  settingsColor.value = "teal-lighten-3"
};

const switchTheme = async () => {
  theme.global.name.value = currentTheme.value
  await userStore.setUserTheme(currentTheme.value);
};



</script>

<style scoped>
#icon-search:hover,
#icon-chats:hover,
#icon-groups:hover,
#icon-settings:hover {
  color: rgb(var(--v-theme-primary)) !important;
}

.searchTab {
  color: rgb(var(--v-theme-primary)) !important;
  animation: rotate 0.5s;
}

.chatsTab {
  color: rgb(var(--v-theme-primary)) !important;
  animation: beat 0.5s;
}

.groupsTab {
  color: rgb(var(--v-theme-primary)) !important;
  animation: swing 0.5s;
}

.settings-items:hover {
  color: rgb(var(--v-theme-select));
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
