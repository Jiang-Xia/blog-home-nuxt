<template>
  <div>
    <input
      type="text"
      placeholder="input here"
      class="input input-bordered input-secondary w-full max-w-xs"
    >
  </div>
</template>
<script setup>
  // 节流和防抖测试
  import { throttle, debounce } from '@/test/test3.js'
  onMounted(() => {
    // Example usage:
    function handleThrottledScroll (event) {
      console.log('Scrolling...')
    }

    const throttledScroll = throttle(handleThrottledScroll, 3000) // 300ms 的节流延迟
    // window.addEventListener('scroll', function(e){
    //   throttledScroll(e,222,333)
    // })
    window.addEventListener('scroll', throttledScroll)

    // Example usage:
    function handleDebouncedInput (event) {
      console.log('Input debounced...')
    }
    const debouncedInput = throttle(handleDebouncedInput, 2000) // 500ms 的防抖延迟
    document.getElementById('inputField').addEventListener('input', debouncedInput)
  })
</script>
<style lang="less"></style>
