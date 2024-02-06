<template>
  <div id="homepage">

    <v-container>
      <h1 id="welcome" style="font-family: Courgette;" class="mt-2 py-5 bg-purple text-center rounded-xl">Welcome to the
        Chat App</h1>
    </v-container>

  </div>
</template>

<script setup>
import { onMounted } from 'vue';


onMounted( async () => {
  window.document.title = "Welcome to Ponder Pal"
})

</script>


<style scoped>
#homepage {
  width: 100%;
  height: 100%;
  background-image: url("@/assets/cb.jpg");
  background-size: cover;
  background-position: center center;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;


}

#welcome {
  background: radial-gradient(1165px at -5.4% 50.5%, rgb(0, 255, 239) 4.1%, rgb(243, 4, 251) 47%, rgb(251, 223, 0) 89.5%);
}
</style>