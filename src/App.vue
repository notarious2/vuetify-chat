<template>
  <router-view />
</template>

<script setup>
  //
</script>

<style>
@font-face {
  font-family: Courgette;
  src: url('@/assets/fonts/Courgette-Regular.ttf');
}

@font-face {
  font-family: Sriracha;
  src: url('@/assets/fonts/Sriracha-Regular.ttf');
}

.profile-image {
  border-radius: 50%;
  float: left;
  width:  40px;
  height: 40px;
  object-fit: cover; 


}
</style>