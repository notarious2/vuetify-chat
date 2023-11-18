<template>
        <div style="height: 580px; overflow: auto" class="bg-teal-lighten-5 rounded-0">
          <v-list class="bg-teal-lighten-5" v-for="directChat in directChats">
            <v-list-item class="px-2" @click="chatStore.loadChat(directChat)">
              <v-list-item-title class="d-flex align-center py-2 rounded-lg"
                :class="{ 'bg-teal-lighten-1': currentChatGUID === directChat.chat_guid }">
                <v-avatar class="ml-2">
                  <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John"></v-img>
                </v-avatar>
                <StatusCircle :friendStatus="friendStatuses[directChat.friend.guid]"/>
                <p>{{ directChat.friend.username }}</p>
                <p v-if="directChat.new_messages_count"
                  class="ml-10 bg-teal-lighten-4 font-weight-regular rounded-circle px-2">
                  {{ directChat.new_messages_count }}
                </p>
                <p class="ml-auto mr-2">
                  {{ formatTimeFromDateString(directChat.updated_at) }}
                </p>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import {formatTimeFromDateString} from "@/utils/dateUtils";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";

import StatusCircle from "@/components/StatusCircle.vue";

const chatStore = useChatStore();
const userStore = useUserStore();


const { currentChatGUID, directChats } = storeToRefs(chatStore);
const { friendStatuses } = storeToRefs(userStore);


</script>