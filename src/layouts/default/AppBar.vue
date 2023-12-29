<template>
  <v-app-bar flat class="bg-cyan-lighten-4" id="app-bar">
    <router-link :to="{ name: 'Home' }" style="text-decoration: none; color: inherit" class="ml-2">
      <v-app-bar-title>
        <v-icon icon="mdi-chat" color="teal-lighten-3" />
        <v-icon icon="mdi-chat" color="teal-darken-2" class="ml-n5" />

        <span class="mx-2 text-gray font-weight-bold" style="user-select: none; font-family: Courgette">Ponder Pal</span>
      </v-app-bar-title>
    </router-link>

    <div class="ml-auto" style="font-family: Sriracha">
      <v-list class="d-flex" v-if="isLoggedIn" style="background: inherit;">
        <v-list-item class="remove-overlay" :to="{ name: 'Chat' }">Chat</v-list-item>
        <v-menu :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props">
              <img v-if="currentUser.userImage && !userImageError" :src="currentUser.userImage" alt="userImage" class="profile-image"  @error="() => handleImageError()">
              <img v-else-if="userImageError" :src="notAvailablePhotoURL" alt="userImageNotAvailable" class="profile-image">
              <img v-else :src="defaultPhotoURL" alt="defaultUserImage" class="profile-image">
            </v-list-item>
          </template>
          <v-list bg-color="teal-darken-1">
            <v-list-item>View Profile</v-list-item>
            <v-list-item @click="logoutAndRedirect">Logout</v-list-item>
          </v-list>
        </v-menu>



      </v-list>
      <v-list v-else class="d-flex" style="background: inherit;">
        <!-- v-list-item is a wrapper for router-link -->
        <v-list-item class="remove-overlay" v-ripple="false" :to="{ name: 'Login' }">Login</v-list-item>
        <v-list-item class="remove-overlay" v-ripple="false" :to="{ name: 'Register' }">Register</v-list-item>
      </v-list>

    </div>
  </v-app-bar>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const userStore = useUserStore();

const { isLoggedIn, currentUser } = storeToRefs(userStore);
const defaultPhotoURL = new URL("@/assets/photo-default.png", import.meta.url).href;
const notAvailablePhotoURL = new URL("@/assets/photo-not-available.png", import.meta.url).href;
const userImageError = ref(false);

const logoutAndRedirect = async () => {
  await userStore.logout()
  router.push("/")
};


const handleImageError = () => {
  userImageError.value = true;
};



</script>

<style scoped>
#app-bar {
  /* background: radial-gradient(801px at 4.2% 16.4%, rgba(104, 211, 218, 0.99) 0%, rgb(184, 77, 235) 88.8%); */
}

.v-list-item--active {
  /* border-bottom: 3px solid teal; */
  text-decoration-line: underline;
  -webkit-text-decoration-line: underline;
  text-decoration-color: teal;
  -webkit-text-decoration-color: teal;
  text-decoration-thickness: 3px;
  -webkit-text-decoration-thickness: 3px;
  text-underline-position: under;
  -webkit-text-underline-position: under;
}
.remove-overlay :deep(.v-list-item__overlay) {
  background-color: transparent;
}
</style>
