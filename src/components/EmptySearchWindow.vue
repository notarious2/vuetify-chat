<template>
    <v-col class="d-flex rounded-0 rounded-e-lg bg-icons" style="height: 700px">
        <div class="my-auto mx-auto">
            <!-- MOVED SVG INTO A SEPARATE TEMPLATE DUE TO PERFORMANC ISSUES -->
            <!-- RELATED TO LOADING SVG IN IMG -->
            <EmptyChatIcon style="height: 100px; margin-left: 30%;" />
            <p style="user-select: none;">Select a contact to start conversation</p>
        </div>
    </v-col>
</template>

<script setup>

import EmptyChatIcon from "@/components/EmptyChatIcon.vue"

</script>