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
              <v-icon v-if="friendStatus === 'online'" size="x-small" class="mt-5 ml-n3 mb-n2"
                color="success">mdi-checkbox-blank-circle</v-icon>
              <v-icon v-else-if="friendStatus === 'inactive'" size="x-small" class="mt-5 ml-n3 mb-n2"
                color="orange-lighten-2">mdi-checkbox-blank-circle</v-icon>
              <v-icon v-else size="x-small" class="mt-5 ml-n3 mb-n2"
                color="teal-darken-1">mdi-checkbox-blank-circle-outline</v-icon>
              <span class="ml-3">{{ friendUserName }}</span>
            </div>
            <v-icon color="teal">mdi-dots-vertical</v-icon>
          </v-card-title>
        </v-card>


</template>


<script setup>
import { storeToRefs } from "pinia";

import { useChatStore } from "@/store/chatStore";

const chatStore = useChatStore();

const { friendUserName, friendStatus } = storeToRefs(chatStore);


</script>