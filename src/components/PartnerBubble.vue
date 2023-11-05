<template>
  <div ref="messageBubble" class="bubble bubble-bottom-left">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const messageBubble = ref(null);
onMounted(() => {
  if (props.observer) {
    props.observer.observe(messageBubble.value);
    console.log("observing..")
  } else {
    console.log("Observer not initiated, must fix", props.observer);
  }
});

const props = defineProps(["observer"]);
</script>

<style scoped>
.bubble {
  position: relative;
  line-height: 24px;
  width: 300px;
  background: #f5f5f5;
  border-radius: 25px;
  text-align: center;
  color: #000;
}

.bubble-bottom-left:before {
  content: "";
  width: 0px;
  height: 0px;
  position: absolute;
  border-left: 24px solid #f5f5f5; /* Controls the left side of the triangle */
  border-right: 12px solid transparent; /* Controls the right side of the triangle (transparent) */
  border-top: 12px solid #f5f5f5; /* Controls the top side of the triangle */
  border-bottom: 20px solid transparent; /* Controls the bottom side of the triangle (transparent) */
  left: 10px; /* Position from the left edge of the bubble */
  bottom: -10px; /* Position from the bottom edge of the bubble */
  transform: rotate(10deg);
}
</style>
