<script setup lang="ts">
const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
});
</script>

<template>
  <div class="xia-progress">
    <div
      class="progress-bar"
      :class="{
        five: 5 <= value,
        twentyfive: 5 < value && value <= 25,
        fifty: 25 < value && value <= 50,
        seventyfive: 50 < value && value <= 75,
        onehundred: value >= 100,
      }"
      :style="{ width: value + '%' }"
    />
  </div>
</template>

<style lang="less" scoped>
  .xia-progress {
    padding: 4px 0;
    // background: rgba(0, 0, 0, 0.25);
    border-radius: 6px;
    // box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25), 0 1px rgba(255, 255, 255, 0.08);
    overflow: hidden;
    .progress-bar {
      height: 8px;
      border-radius: 4px;
      background-image: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.3),
        rgba(255, 255, 255, 0.05)
      );
      // transition: 0.4s linear;
      // transition-property: width, background-color;
      // box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.25), inset 0 1px rgba(255, 255, 255, 0.1);
    }

    .five {
      background-color: #f63a0f;
    }

    .twentyfive {
      background-color: #f27011;
    }

    .fifty {
      background-color: #f2b01e;
    }

    .seventyfive {
      background-color: #f2d31b;
    }

    .onehundred {
      background-color: #86e01e;
    }
  }
</style>
