import { useIntersectionObserver } from '@vueuse/core'
import loadingImg from '@/assets/images/gif/loading3.gif'
import errorImg from '@/assets/images/common/ErrorAlienSpaceship.svg'
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('lazyImg', {
    mounted (el, binding) {
      // console.log(el)
      el.src = loadingImg
      const { stop, } = useIntersectionObserver(
        // 监听目标元素
        el,
        ([{ isIntersecting, }]) => {
          // console.log(isIntersecting, observerElement)
          // 正在和root viewport相交
          if (isIntersecting) {
            // 图片加载失败显示默认图片
            el.onerror = function () {
              el.src = errorImg
            }
            // 这里显示传过来的图片数据
            el.src = binding.value
            stop() // 中止监听
          }
        }
      )
    },
  })
})
