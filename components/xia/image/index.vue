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
/**
   * 图片组件：破图兜底与可选懒加载。
   * 占位用 public SVG，避免 loading GIF 进首屏图。
   */
import { PLACEHOLDER_FAILED, PLACEHOLDER_LOADING } from '@/utils/placeholder-images';
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
    default: PLACEHOLDER_LOADING,
  },
  failImg: {
    type: String,
    default: PLACEHOLDER_FAILED,
  },
  lazyload: {
    type: Boolean,
    default: false,
  },
});

const localSrc = ref(props.src);
const imageLoaded = ref(false);

const handleLoad = () => {
  imageLoaded.value = true;
};

const handleError = () => {
  localSrc.value = props.failImg;
  console.error('Image failed to load');
};

const xiaImage = ref(null);
const setLazyLoad = () => {
  if (!props.lazyload) return;
  const el = xiaImage.value;
  el.src = PLACEHOLDER_LOADING;
  const { stop } = useIntersectionObserver(xiaImage.value, ([{ isIntersecting }]) => {
    if (isIntersecting) {
      el.onerror = function () {
        el.src = props.failImg;
      };
      el.src = props.src;
      stop();
    }
  });
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
