<template>
  <div class="xia-image">
    <template v-if="!lazyload">
      <img
        v-show="imageLoaded"
        v-bind="$attrs"
        :alt="alt"
        :src="localSrc"
        @load="handleLoad"
        @error="handleError"
      >
      <img v-show="!imageLoaded" v-bind="$attrs" :src="placeholder" alt="Placeholder">
    </template>
    <template v-else>
      <img ref="xiaImage" v-bind="$attrs" :alt="alt" :src="placeholder">
    </template>
  </div>
</template>

<script setup>
/* 为了解决处理图片开裂，破图样式, 懒加载v-lazyImg执行前给一个默认图片 */
import loadingImgGif from '@/assets/images/gif/loading-dna-min.gif';
import errorImg from '@/assets/images/common/LoadFailed.svg';

import { ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';

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
  lazyload: {
    type: Boolean,
    default: false,
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

// 懒加载
const xiaImage = ref(null);
const setLazyLoad = () => {
  if (!props.lazyload) return;
  const el = xiaImage.value;
  el.src = loadingImgGif;
  const { stop } = useIntersectionObserver(
    // 监听目标元素
    xiaImage.value,
    ([{ isIntersecting, observerElement }]) => {
      // console.log(isIntersecting, observerElement);
      // 正在和root viewport相交
      if (isIntersecting) {
        // 图片加载失败显示默认图片
        el.onerror = function () {
          el.src = props.failImg;
        };
        // 这里显示传过来的图片数据
        el.src = props.src;
        stop(); // 中止监听
      }
    },
  );
};
onMounted(() => {
  setLazyLoad();
});
</script>

<style lang="less" scoped>
  .xia-image {
    img {
      height: 100%;
      width: 100%;
    }
  }
</style>
