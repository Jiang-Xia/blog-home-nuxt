<template>
  <div
    ref="cardContainer"
    class="card-container"
    @mousemove="onmousemoveHandle"
    @mouseout="mouseoutHandle"
  >
    <div ref="cardFilter" class="card-filter" />
    <div ref="cardImg" class="card-img" />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import loadingImg from '@/assets/images/gif/loading3-min.gif';
import errorImg from '@/assets/images/common/LoadFailed.svg';

const props = defineProps({
  pic: {
    type: String,
    default: '',
  },
  failImg: {
    type: String,
    default: errorImg,
  },
});
const cardContainer = ref();
const cardFilter = ref();
const cardImg = ref();

const setPic = (url) => {
  if (!cardContainer.value || !url) return;
  cardContainer.value.style.setProperty('--pic', `url("${url}")`);
};

const loadPic = (url) => {
  if (!cardContainer.value) return;
  if (!url) {
    setPic(props.failImg);
    return;
  }
  setPic(loadingImg);
  const img = new Image();
  img.onload = () => setPic(url);
  img.onerror = () => setPic(props.failImg);
  img.src = url;
};

const onmousemoveHandle = (event) => {
  cardImg.value.style.visibility = 'visible';

  const target = event.target;
  const rect = target.getBoundingClientRect();

  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;

  const percentX = (Math.min(Math.max(offsetX / rect.width, 0), 1) * 100).toFixed(2);
  const percentY = (Math.min(Math.max(offsetY / rect.height, 0), 1) * 100).toFixed(2);

  cardContainer.value.style.setProperty('--x', `${percentX}%`);
  cardContainer.value.style.setProperty('--y', `${percentY}%`);
};
const mouseoutHandle = () => {
  cardImg.value.style.visibility = 'hidden';
};
onMounted(() => loadPic(props.pic));
watch(() => props.pic, loadPic);
</script>

<style lang="less" scoped>
  .card-container {
    --border-size: 16px;
    --x: 0;
    --y: 0;

    position: relative;
    margin: auto;
    min-width: 150px;
    min-height: 200px;
    width: 100%;
    height: 100%;
    border-radius: var(--border-size);
    transition: all 0.1s;
    z-index: 3;

    &::after {
      content: '';
      position: absolute;
      inset: var(--pic-inset, 16px);
      background: var(--pic);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border-radius: var(--border-size);
      z-index: 10;
    }
  }

  .card-filter {
    position: absolute;
    inset: 2px;
    border-radius: var(--border-size);
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

  .card-img {
    position: absolute;
    visibility: hidden;
    filter: brightness(1.5);
    inset: 0;
    z-index: 1;
    mask: radial-gradient(
      circle at var(--x) var(--y),
      #000,
      #000,
      transparent,
      transparent,
      transparent
    );

    &::before {
      content: '';
      position: absolute;
      inset: 2px;
      border-radius: var(--border-size);
      background: conic-gradient(#03a9f4, #e91e63, #9c27b0, #ff5722, #03a9f4);
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--border-size);
      background: conic-gradient(#03a9f4, #e91e63, #9c27b0, #ff5722, #03a9f4);
    }
  }
</style>
