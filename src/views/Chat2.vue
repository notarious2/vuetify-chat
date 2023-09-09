<template>
  <v-card class="mx-auto" max-width="600">
    <v-card-title> Messages </v-card-title>

    <v-divider></v-divider>

    <v-virtual-scroll :items="reversedItems" height="500" item-height="48">
      <template v-slot:default="{ item }">
        <v-list-item v-if="item % 2 === 0" :title="`Message #${item}`" :subtitle="`Username`" style="text-align: right" class="bg-teal-lighten-5 rounded-xl ml-10 mr-2 py-8 my-5">
          <template v-slot:append>
            <v-icon class="bg-primary rounded-xl">mdi-message</v-icon>
          </template>
        </v-list-item>
        <v-list-item v-else :title="`Message #${item}`" :subtitle="`Username`" style="text-align: left" class="bg-blue-lighten-4 rounded-xl ml-2 mr-10 py-8 my-5">
          <template v-slot:prepend>
            <v-icon class="bg-primary rounded-xl">mdi-message</v-icon>
          </template>
        </v-list-item>
      </template>
    </v-virtual-scroll>
  </v-card>
</template>

<!-- <script>
export default {
  data: () => ({
    items: Array.from({ length: 50 }, (k, v) => v + 1),
  }),
  computed: {
    reversedItems() {
      // Reverse the items array and return it
      return this.items.slice().reverse();
    },
  },
};
</script> -->

<!-- <script setup>
import { ref } from "vue";

const items = ref(Array.from({ length: 50 }, (k, v) => v + 1));

const getReversedItems = () => {
  // Reverse the items array and return it
  return items.value.slice().reverse();
};
const reversedItems = getReversedItems();

</script> -->


<script setup>
import { ref, computed, watch } from "vue";
import { useWebSocket } from "@/composables/useWebSocket";
import { useMessageHistory } from "@/composables/useMessageHistory";

const items = ref(Array.from({ length: 50 }, (k, v) => v + 1));

const reversedItems = computed(() => {
  // Reverse the items array and return it
  return items.value.slice().reverse();
});

// Use the composable to establish a WebSocket connection
// const { socket } = useWebSocket("wss://localhost:8001"); // Replace with your WebSocket server URL
const { messages } = useMessageHistory();
console.log("MESSAGES:", messages)

// You can now use the 'socket' variable to send/receive WebSocket messages

</script>