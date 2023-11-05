<template>
    <v-col class="d-flex rounded-0 rounded-e-lg bg-teal-lighten-3" style="height: 700px">
        <div class="my-auto mx-auto">
            <img :src="imageURL" style="height: 100px; margin-left: 30%;" />

            <p style="user-select: none;">Select a contact to start conversation</p>
        </div>
    </v-col>
</template>

<script setup>

const imageURL = new URL("@/assets/message-multiple.svg", import.meta.url).href;

</script>