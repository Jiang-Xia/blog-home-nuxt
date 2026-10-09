import { useIntersectionObserver } from '@vueuse/core';
import { PLACEHOLDER_FAILED } from '@/utils/placeholder-images';

export default defineNuxtPlugin((nuxtApp) => {
  // 图片懒加载（失败图用 public 路径，不打包大 GIF）
  nuxtApp.vueApp.directive('lazyImg', {
    mounted(el, binding) {
      const { stop } = useIntersectionObserver(el, ([{ isIntersecting }]) => {
        if (isIntersecting) {
          el.onerror = function () {
            el.src = PLACEHOLDER_FAILED;
          };
          el.src = binding.value;
          stop();
        }
      });
    },
  });
  // 聚焦
  nuxtApp.vueApp.directive('focus', {
    mounted: el => el.focus(),
  });
});
