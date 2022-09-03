<script setup lang="ts">
definePageMeta({
  layout: 'custom' // 不使用default布局
})
const route = useRoute()
</script>
<template>
  <div class="common-page">
    <img src="../assets/images/gif/404.gif" alt="404">
    <div class="b-text">
      <div
        class="gradient-text text-xl px-8 sm:px-0 sm:text-4xl md:mb-6 font-light h-11 leading-none"
      >
        Page not found: {{ route.fullPath }}
      </div>
      <div class="w-full flex items-center justify-center">
        <xia-button @click="navigateTo('/')">
          Go back home
        </xia-button>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
  .common-page {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    // justify-content: center;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    &::after {
      pointer-events: none;
      content: '';
      position: absolute;
      bottom: -30vh;
      left: 0;
      height: 40vh;
      width: 100%;
      background: linear-gradient(45deg, #00dc82 0%, #36e4da 50%, #0047e1 100%);
      filter: blur(20vh);
    }
    .b-text {
      margin-top: -70px;
    }
  }
</style>
