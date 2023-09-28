<template>

<div class="bubble bubble-bottom-left">
<slot></slot>

</div>
  </template>

  <script setup>
  </script>

  <style scoped>

.bubble {
  position: relative;
  line-height: 24px;
  width: 300px;
  background: #F5F5F5;
  border-radius: 25px;
  text-align: center;
  color: #000;
}

.bubble-bottom-left:before {
  content: "";
  width: 0px;
  height: 0px;
  position: absolute;
  border-left: 24px solid #F5F5F5;       /* Controls the left side of the triangle */
  border-right: 12px solid transparent;  /* Controls the right side of the triangle (transparent) */
  border-top: 12px solid #F5F5F5;         /* Controls the top side of the triangle */
  border-bottom: 20px solid transparent; /* Controls the bottom side of the triangle (transparent) */
  left: 10px;                          /* Position from the left edge of the bubble */
  bottom: -10px;                       /* Position from the bottom edge of the bubble */
  transform: rotate(10deg);
}

  </style>
