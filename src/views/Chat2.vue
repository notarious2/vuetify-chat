<template>
  <v-card class="mx-auto" max-width="600">
    <v-card-title>
      Messages
    </v-card-title>

    <v-divider></v-divider>

    <v-virtual-scroll :items="items" height="500" item-height="48">
      <template v-slot:default="{ item }">
        <v-list-item :title="`Message #${item}`" :subtitle="`Username`"
          :style="item % 2 === 0 ? { 'text-align': 'right' } : { 'text-align': 'left' }">

          <template v-slot:prepend>
            <v-icon class="bg-primary rounded-xl">mdi-message</v-icon>
          </template>
        </v-list-item>
      </template>
    </v-virtual-scroll>
  </v-card>
</template>





<script>
export default {
  data: () => ({
    items: Array.from({ length: 50 }, (k, v) => v + 1),
  }),
}
</script>