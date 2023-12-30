<template>
  <div style="width: 100%; height: 100vh;">
    <v-card class="d-flex flex-column justify-center bg-teal-lighten-4 px-10 py-10 mx-auto" style="min-height: 100%;">
      <v-card-title class="text-center" style="white-space: initial; font-family: Courgette">
        Authenticating via Google credentials...
      </v-card-title>
      <v-progress-circular indeterminate color="teal" size="71" width="7" class="mx-auto mt-3"></v-progress-circular>
    </v-card>
  </div>
</template>



<script setup>
import { onMounted } from 'vue';
import { useUserStore } from "@/store/userStore";


const userStore = useUserStore();


const authenticateViaBackend = async () => {
  const accessToken = new URLSearchParams(window.location.hash.substring(1)).get('access_token');
  const authenticationSuccess = await userStore.loginWithGoogle(accessToken);

  if (authenticationSuccess) {
    // Close the pop-up
    window.close();

    // Make sure the original tab is in full-screen mode
    // Redirect to chat page
    if (window.opener) {
      window.opener.location.href = '/chat/';

    }
  }
};

onMounted(async () => {
  await authenticateViaBackend();
})

</script>



