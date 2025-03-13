<script setup lang="ts">
const emit = defineEmits(['click']);
defineProps({
  text: {
    type: String,
    default: '按钮',
  },
});
</script>

<template>
  <div
    class="gradient-border text-md sm:text-xl py-2 px-4 sm:py-3 sm:px-6 cursor-pointer"
    @click="emit('click')"
  >
    <!-- 回到首页 -->
    <slot>{{ text }}</slot>
  </div>
</template>

<style lang="less" scoped>
  /* 渐变 伪类border */
  .gradient-border:before {
    background: linear-gradient(90deg, #e2e2e2, #e2e2e2 25%, #00dc82 50%, #36e4da 75%, #0047e1);
  }
  .gradient-border:before {
    background-size: 400% auto;
    border-radius: 0.5rem;
    bottom: 0;
    content: '';
    left: 0;
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.5;
    padding: 2px;
    position: absolute;
    right: 0;
    top: 0;
    transition:
      background-position 0.3s ease-in-out,
      opacity 0.2s ease-in-out;
    width: 100%;
  }
  .gradient-border:hover:before {
    background-position: -50% 0;
    opacity: 1;
  }
  .gradient-border {
    position: relative;
    border-radius: 0.5rem;
    position: relative;
    background: rgba(255, 255, 255, 0.3);
  }
</style>
