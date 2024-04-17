<template>
  <div class="page-container p-12">
    <div>主题切换=====>{{ theme }}</div>
    <Delay />
  </div>
</template>
<script setup>
  import Delay from './components/Delay.vue'
  const theme = useTheme()
  // watch(() => theme.value, () => {
  //   console.log('watch========》', theme.value)
  // })
</script>
<style lang="less">
  .page-container {
    min-height: 100vh;
  }
</style>
