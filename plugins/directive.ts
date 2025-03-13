import { useIntersectionObserver } from '@vueuse/core';
import loadingImg from '@/assets/images/gif/loading3-min.gif';
import errorImg from '@/assets/images/common/ErrorAlienSpaceship.svg';
// const loading8 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDMwIj48cGF0aCBmaWxsPSIjRkY2NzAwIiBvcGFjaXR5PSIuMiIgZD0iTTAgMTBoNHYxMEgweiI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgYXR0cmlidXRlVHlwZT0iWE1MIiB2YWx1ZXM9IjAuMjsgMTsgLjIiIGJlZ2luPSIwcyIgZHVyPSIwLjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImhlaWdodCIgYXR0cmlidXRlVHlwZT0iWE1MIiB2YWx1ZXM9IjEwOyAyMDsgMTAiIGJlZ2luPSIwcyIgZHVyPSIwLjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InkiIGF0dHJpYnV0ZVR5cGU9IlhNTCIgdmFsdWVzPSIxMDsgNTsgMTAiIGJlZ2luPSIwcyIgZHVyPSIwLjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvcGF0aD48cGF0aCBmaWxsPSIjRkY2NzAwIiBvcGFjaXR5PSIuMiIgZD0iTTggMTBoNHYxMEg4eiI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgYXR0cmlidXRlVHlwZT0iWE1MIiB2YWx1ZXM9IjAuMjsgMTsgLjIiIGJlZ2luPSIwLjE1cyIgZHVyPSIwLjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImhlaWdodCIgYXR0cmlidXRlVHlwZT0iWE1MIiB2YWx1ZXM9IjEwOyAyMDsgMTAiIGJlZ2luPSIwLjE1cyIgZHVyPSIwLjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InkiIGF0dHJpYnV0ZVR5cGU9IlhNTCIgdmFsdWVzPSIxMDsgNTsgMTAiIGJlZ2luPSIwLjE1cyIgZHVyPSIwLjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvcGF0aD48cGF0aCBmaWxsPSIjRkY2NzAwIiBvcGFjaXR5PSIuMiIgZD0iTTE2IDEwaDR2MTBoLTR6Ij48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiBhdHRyaWJ1dGVUeXBlPSJYTUwiIHZhbHVlcz0iMC4yOyAxOyAuMiIgYmVnaW49IjAuM3MiIGR1cj0iMC42cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJoZWlnaHQiIGF0dHJpYnV0ZVR5cGU9IlhNTCIgdmFsdWVzPSIxMDsgMjA7IDEwIiBiZWdpbj0iMC4zcyIgZHVyPSIwLjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InkiIGF0dHJpYnV0ZVR5cGU9IlhNTCIgdmFsdWVzPSIxMDsgNTsgMTAiIGJlZ2luPSIwLjNzIiBkdXI9IjAuNnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9wYXRoPjwvc3ZnPg=='
export default defineNuxtPlugin((nuxtApp) => {
  // 图片懒加载
  nuxtApp.vueApp.directive('lazyImg', {
    mounted(el, binding) {
      // console.log(el)
      el.src = loadingImg;
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
