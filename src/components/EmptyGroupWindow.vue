<template>
    <v-col class="d-flex bg-icons" style="height: 700px">
        <div class="my-auto mx-auto">
            <img :src="imageURL" style="height: 100px; margin-left: 15%;"  />

            <p class="ml-auto" style="user-select: none;">Coming up soon...</p>
        </div>
    </v-col>
</template>

<script setup>

const imageURL = new URL("@/assets/hashtag.svg", import.meta.url).href;

</script>