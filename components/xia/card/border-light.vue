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
  import { onMounted } from 'vue'
  import loadingImg from '@/assets/images/gif/loading3-min.gif'

  const props = defineProps({
    pic: {
      type: String,
      default: `url("${loadingImg}")`,
    },
  })
  const cardContainer = ref()
  const cardFilter = ref()
  const cardImg = ref()
  const onmousemoveHandle = (event) => {
    cardImg.value.style.visibility = 'visible'

    const target = event.target
    const rect = target.getBoundingClientRect()

    const offsetX = event.clientX - rect.left
    const offsetY = event.clientY - rect.top

    const percentX = (Math.min(Math.max(offsetX / rect.width, 0), 1) * 100).toFixed(2)
    const percentY = (Math.min(Math.max(offsetY / rect.height, 0), 1) * 100).toFixed(2)

    // console.log('X: ' + percentX + '%')
    // console.log('Y: ' + percentY + '%')

    cardContainer.value.style.setProperty('--x', `${percentX}%`)
    cardContainer.value.style.setProperty('--y', `${percentY}%`)
  }
  const mouseoutHandle = () => {
    cardImg.value.style.visibility = 'hidden'
  }
  onMounted(() => {
    cardContainer.value.style.setProperty('--pic', `url(${props.pic})`)
  })
</script>

<style lang="less" scoped>
  .card-container {
    --border-size: 16px;
    --x: 0;
    --y: 0;
    // --pic: url("https://oss.aiyuzhou8.com/2023/05/08-.jpg");
    // --pic: url("https://i.pinimg.com/736x/f0/c3/23/f0c323f370acf6cf35973ca5f53ecc89.jpg");

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
      inset: 16px;
      background: var(--pic);
      // background-size: cover;
      background-size: 100% 100%;
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
