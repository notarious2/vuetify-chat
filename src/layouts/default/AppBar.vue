<template>
  <v-app-bar flat id="app-bar" color="appbar" v-if="isGroup || isSearch || !compactView || compactView&&!chatSelected">
    <router-link :to="{ name: 'Home' }" style="text-decoration: none; color: inherit" class="ml-2">
      <v-app-bar-title>
        <v-icon icon="mdi-chat" color="logoleft" style="z-index: 1;" />
        <v-icon icon="mdi-chat" color="logoright" style="transform: scaleX(-1);" class="ml-n5" />

        <span class="mx-2 text-gray font-weight-bold" style="user-select: none; font-family: Courgette">Ponder Pal</span>
      </v-app-bar-title>
    </router-link>

    <div class="ml-auto" style="font-family: Sriracha">

      <div v-if="isLoggedIn" class="menu">
        <router-link class="link" :to="{ name: 'Chat' }">Chat</router-link>
        <v-menu :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props">
              <img v-if="currentUser.userImage && !userImageError" :src="currentUser.userImage" alt="userImage"
                class="profile-image" @error="() => handleImageError()">
              <img v-else-if="userImageError" :src="notAvailablePhotoURL" alt="userImageNotAvailable"
                class="profile-image">
              <img v-else :src="defaultPhotoURL" alt="defaultUserImage" class="profile-image">
            </v-list-item>
          </template>
          <v-list bg-color="submenu">
            <v-list-item>View Profile</v-list-item>
            <v-list-item @click="logoutAndRedirect">Logout</v-list-item>
          </v-list>
        </v-menu>
      </div>

      <div v-else class="menu">
        <router-link class="link" :to="{ name: 'Login' }">Login</router-link>
        <router-link class="link mr-5" :to="{ name: 'Register' }">Register</router-link>
      </div>

    </div>

  </v-app-bar>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { useMainStore } from "@/store/mainStore";
import { useChatStore } from "@/store/chatStore";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useTheme } from 'vuetify'

const router = useRouter();
const userStore = useUserStore();
const mainStore = useMainStore();
const chatStore = useChatStore();


const { isLoggedIn, currentUser } = storeToRefs(userStore);
const { compactView, isChat, isGroup, isSearch } = storeToRefs(mainStore);
const { chatSelected } = storeToRefs(chatStore);

const defaultPhotoURL = new URL("@/assets/photo-default.png", import.meta.url).href;
const notAvailablePhotoURL = new URL("@/assets/photo-not-available.png", import.meta.url).href;
const userImageError = ref(false);

const theme = useTheme();

const logoutAndRedirect = async () => {
  router.push("/")
  await userStore.logout()
  // reset theme to default 'teal'
  theme.global.name.value = 'teal';
};


const handleImageError = () => {
  userImageError.value = true;
};



</script>

<style scoped>
#app-bar {
  /* background: radial-gradient(801px at 4.2% 16.4%, rgba(104, 211, 218, 0.99) 0%, rgb(184, 77, 235) 88.8%); */
}

.menu {
  display: flex;
  gap: 20px;
  align-items: center;
}


.link {
  text-decoration: none;
  color: black;
}

a.router-link-active {
  text-decoration-line: underline;
  -webkit-text-decoration-line: underline;
  text-decoration-color: rgb(var(--v-theme-primary));
  -webkit-text-decoration-color: rgb(var(--v-theme-primary));
  text-decoration-thickness: 3px;
  -webkit-text-decoration-thickness: 3px;
  text-underline-position: under;
  -webkit-text-underline-position: under;
}
</style>
