<template>
  <div class="page-container p-4 max-w-6xl mx-auto rounded-xl bg-base-100">
    <ClientOnly>
      <uniapp />
    </ClientOnly>
    <div>主题切换=====>{{ theme }}</div>
    <Delay />
    <XiaCardBorderLight :pic="pic" />
    <Stream />
    <ClientOnly>
      <Screenshot />
    </ClientOnly>
  </div>
</template>

<script setup>
import Delay from './components/Delay.vue';
import Stream from './components/stream.vue';
import Screenshot from './components/Screenshot.vue';
import uniapp from './components/uniapp.vue';

const theme = useTheme();
const pic
    = 'https://jiang-xia.top/x-blog/api/static/uploads/2023-03/ubul73p9bipisom18lvt12-react.webp';
  // watch(() => theme.value, () => {
  //   console.log('watch========》', theme.value)
  // })
const loaded = ref(false);
onMounted(() => {
  loaded.value = true;
});
</script>

<style lang="less">
  .page-container {
    min-height: 100vh;
  }
</style>
