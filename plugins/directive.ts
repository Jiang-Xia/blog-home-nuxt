import { useIntersectionObserver } from '@vueuse/core';
import loadingImgGif from '@/assets/images/gif/loading-dna-min.gif';
import errorImg from '@/assets/images/common/LoadFailed.svg';

export default defineNuxtPlugin((nuxtApp) => {
  // 图片懒加载
  nuxtApp.vueApp.directive('lazyImg', {
    mounted(el, binding) {
      // console.log('lazyImg-mounted', el);
      // el.src = loadingImgGif;
      const { stop } = useIntersectionObserver(
        // 监听目标元素
        el,
        ([{ isIntersecting }]) => {
          // console.log(isIntersecting, observerElement)
          // 正在和root viewport相交
          if (isIntersecting) {
            // 图片加载失败显示默认图片
            el.onerror = function () {
              el.src = errorImg;
            };
            // 这里显示传过来的图片数据
            el.src = binding.value;
            stop(); // 中止监听
          }
        },
      );
    },
  });
  // 聚焦
  nuxtApp.vueApp.directive('focus', {
    mounted: el => el.focus(),
  });
});
