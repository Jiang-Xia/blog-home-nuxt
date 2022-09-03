<script setup lang="ts">
  definePageMeta({
    layout: "custom", // 不使用default布局
  });
  const props = defineProps({
    error: Object,
  });
  const handleError = () => clearError({ redirect: "/" });
  console.log(props.error);
</script>
<template>
  <div class="common-page">
    <div class="img-wrap"></div>
    <div class="b-text text-center">
      <div class="gradient-text flex justify-center">
        <span class="mr-2">{{ error.statusCode }}</span>
        <span class="mr-2">{{ error.statusMessage }}</span>
        <span class="mr-2">{{ error.url }}</span>
      </div>
      <div
        class="gradient-text text-xl px-8 sm:px-0 sm:text-4xl md:mb-6 font-light h-11 leading-none"
      >
        {{ error.message }}
      </div>
      <div class="text-left text-sm mb-3 w-3/4 whitespace-pre-wrap" v-html="error.description"></div>
      <div class="w-full flex items-center justify-center">
        <xia-button @click="handleError">Try Again</xia-button>
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
      content: "";
      position: absolute;
      bottom: -30vh;
      left: 0;
      height: 40vh;
      width: 100%;
      background: linear-gradient(45deg, #00dc82 0%, #36e4da 50%, #0047e1 100%);
      filter: blur(20vh);
    }
    .img-wrap {
      background-image: url(../assets/images/gif/error.gif);
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      width: 50%;
      height: 40vh;
    }
    .b-text {
    }
  }
</style>
