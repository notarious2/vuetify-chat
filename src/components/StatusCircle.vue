<template>
  <v-icon
    v-if="friendStatus === 'online'"
    size="x-small"
    class="mt-5 ml-n3 mb-n2 mr-1"
    color="success"
    >mdi-checkbox-blank-circle</v-icon
  >
  <v-icon
    v-else-if="friendStatus === 'inactive'"
    size="x-small"
    class="mt-5 ml-n3 mb-n2 mr-1"
    color="orange-lighten-2"
    >mdi-checkbox-blank-circle</v-icon
  >
  <v-icon v-else size="x-small" class="mt-5 ml-n3 mb-n2 mr-1" color="teal-darken-1"
    ></v-icon
  >
</template>

<script setup>

const props = defineProps(["friendStatus"]);

</script>