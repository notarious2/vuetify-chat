<template>
    
    <v-card class="rounded-0 rounded-te-lg bg-teal-lighten-3">
          <v-card-title style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
            <div>
              <v-avatar class="ml-auto mb-1">
                <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John"></v-img>
              </v-avatar>
                <StatusCircle :friendStatus="friendStatuses[currentFriendGUID]"/>
              <span class="ml-1">{{ currentFriendUserName }}</span>
            </div>
            <v-icon color="teal">mdi-dots-vertical</v-icon>
          </v-card-title>
        </v-card>


</template>


<script setup>
import { storeToRefs } from "pinia";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";

import StatusCircle from "@/components/StatusCircle.vue";

const chatStore = useChatStore();
const userStore = useUserStore();

const { friendStatuses } = storeToRefs(userStore);
const { currentFriendUserName, currentFriendGUID } = storeToRefs(chatStore);


</script>