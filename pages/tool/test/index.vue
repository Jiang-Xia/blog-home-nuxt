<template>
  <div class="page-container p-12">
    <div>主题切换=====>{{ theme }}</div>
    <Delay />
    <XiaCardBorderLight :pic="pic" />
  </div>
</template>
<script setup>
  import Delay from './components/Delay.vue'
  const theme = useTheme()
  const pic =
    'https://jiang-xia.top/x-blog/api/v1/static/uploads/2023-03/ubul73p9bipisom18lvt12-react.webp'
  // watch(() => theme.value, () => {
  //   console.log('watch========》', theme.value)
  // })
</script>
<style lang="less">
  .page-container {
    min-height: 100vh;
  }
</style>
