<template>
    <div style="width: 100%; height: 100%;">
        <v-card class="bg-teal-lighten-4 rounded-0 rounded-te-lg" height="60px"></v-card>

        <v-card class="d-flex flex-column justify-center px-10 py-10 mx-auto rounded-0 rounded-be-lg"
            style="min-height: calc(100% - 60px);;">
            <v-card-title class="text-center" style="white-space: initial; font-family: Courgette">
                Loading Messages ...
            </v-card-title>
            <v-progress-circular indeterminate color="teal" size="71" width="7" class="mx-auto mt-3"></v-progress-circular>
        </v-card>
    </div>
</template>

