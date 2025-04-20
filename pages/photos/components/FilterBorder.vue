<template>
  <div
    ref="cardContainer"
    class="card-container"
    :style="{ 'padding': padding + 'px', '--pic': `url(${pic})` }"
  >
    <img
      :src="pic"
      :style="{ borderRadius: radius + 'px' }"
    >
    <div
      ref="cardFilter"
      class="card-filter"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import loadingImg from '@/assets/images/gif/loading3-min.gif';

const props = defineProps({
  pic: {
    type: String,
    default: '',
  },
  padding: {
    type: Number,
    default: 36,
  },
  radius: {
    type: Number,
    default: 16,
  },
});
const cardContainer = ref();
const cardFilter = ref();
// watch(() => props.pic, (n) => {
//   console.log('--', n);
// });
</script>

<style lang="less" scoped>
  .card-container {
    --border-size: 16px;
    position: relative;
    margin: auto;
    min-width: 150px;
    min-height: 200px;
    padding: 12px;
    width: 56vw;
    // max-height: 80vh;
    overflow: hidden;
    box-sizing: border-box;
    img {
      position: relative;
      z-index: 10;
      border-radius: var(--border-size);
      width: 100%;
    }
  }

  .card-filter {
    position: absolute;
    inset: 2px;
    z-index: 5;
    overflow: hidden;
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--pic);
      background-size: cover;
      filter: blur(20px);
    }
  }
</style>
