<template>
  <div id="g-container">
    <div id="g-filter" />
    <div id="g-img" />
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'
  const props = defineProps({
    pic: {
      type: String,
      default: 'url("https://oss.aiyuzhou8.com/2023/05/08-.jpg")',
    },
  })

  onMounted(() => {
    const container = document.getElementById('g-container')
    const img = document.getElementById('g-img')
    container.style.setProperty('--pic', `url(${props.pic})`)
    container.addEventListener('mousemove', (event) => {
      img.style.visibility = 'visible'

      const target = event.target
      const rect = target.getBoundingClientRect()

      const offsetX = event.clientX - rect.left
      const offsetY = event.clientY - rect.top

      const percentX = (Math.min(Math.max(offsetX / rect.width, 0), 1) * 100).toFixed(2)
      const percentY = (Math.min(Math.max(offsetY / rect.height, 0), 1) * 100).toFixed(2)

      console.log('X: ' + percentX + '%')
      console.log('Y: ' + percentY + '%')

      container.setAttribute('style', `--x: ${percentX}%;--y: ${percentY}%;`)
    })

    container.addEventListener('mouseout', (event) => {
      img.style.visibility = 'hidden'
    })
  })
</script>

<style lang="less" scoped>
  #g-container {
    --x: 0;
    --y: 0;
    --pic: url('https://oss.aiyuzhou8.com/2023/05/08-.jpg');
    // --pic: url("https://i.pinimg.com/736x/f0/c3/23/f0c323f370acf6cf35973ca5f53ecc89.jpg");

    position: relative;
    margin: auto;
    width: 350px;
    height: 500px;
    border-radius: 30px;
    transition: all 0.1s;
    z-index: 3;

    &::after {
      content: '';
      position: absolute;
      inset: 50px;
      background: var(--pic);
      background-size: cover;
      background-position: center;
      border-radius: 30px;
      z-index: 10;
    }
  }

  #g-filter {
    position: absolute;
    inset: 2px;
    border-radius: 30px;
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

  #g-img {
    position: absolute;
    // visibility: hidden;
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
      border-radius: 30px;
      background: conic-gradient(#03a9f4, #e91e63, #9c27b0, #ff5722, #03a9f4);
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 30px;
      background: conic-gradient(#03a9f4, #e91e63, #9c27b0, #ff5722, #03a9f4);
    }
  }
</style>
