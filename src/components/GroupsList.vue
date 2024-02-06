<template>
    <div class="bg-items rounded-bs-lg">
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { event } from "vue-gtag";

const groupsSelectedGA = async () => {
  event("groups-selected", {
    event_category: "analytics",
    event_label: "Groups Selected",
    value: 1,
  });
}

const changeTitle = async (newTitle) => {
  window.document.title = newTitle;
};

onMounted( async () => {
    await changeTitle("Ponder Pal: Group Chat");
    await groupsSelectedGA();
})

</script>