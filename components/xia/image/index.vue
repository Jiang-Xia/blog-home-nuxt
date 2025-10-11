<template>
  <div class="xia-image">
    <img
      v-show="imageLoaded"
      v-bind="$attrs"
      :alt="alt"
      :src="localSrc"
      @load="handleLoad"
      @error="handleError"
    >
    <img v-show="!imageLoaded" v-bind="$attrs" :src="placeholder" alt="Placeholder">
  </div>
</template>

<script setup>
/* 为了解决处理图片开裂，破图样式, 懒加载v-lazyImg执行前给一个默认图片 */
import loadingImgGif from '@/assets/images/gif/loading-dna-min.gif';
import errorImg from '@/assets/images/common/LoadFailed.svg';

import { ref } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: loadingImgGif,
  },
  failImg: {
    type: String,
    default: errorImg,
  },
});

const localSrc = ref(props.src);
const imageLoaded = ref(false);

const handleLoad = () => {
  // console.log('handleLoad-------->');
  imageLoaded.value = true;
};

const handleError = () => {
  // imageLoaded.value = true;
  localSrc.value = props.failImg;
  console.error('Image failed to load');
};
</script>

<style lang="less" scoped>
  .xia-image {
    img {
      height: 100%;
      width: 100%;
    }
  }
</style>
