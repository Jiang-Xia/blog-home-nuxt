<template>
  <button class="btn" @click="sendMessage">
    webview通信
  </button>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { createScript } from '@/utils/tool';

onMounted(() => {
  /* 注意引用顺序先微信sdk在uni-sdk */
  const url2 = 'https://res.wx.qq.com/open/js/jweixin-1.4.0.js';
  // const url = 'https://gitcode.net/dcloud/uni-app/-/raw/dev/dist/uni.webview.1.5.6.js';
  const url = '/js/uni.webview.min.js';

  createScript(url2);
  createScript(url);
});
const sendMessage = () => {
  uni.navigateBack({ delta: 1 });
  if (window.uni && window.uni.postMessage) {
    window.uni.postMessage({
      data: {
        action: 'message',
        message: 'Hello from webview',
      },
    });
    alert('postMessage');
  }
  else {
    console.error('uni.postMessage is not a function');
  }
  alert(uni.navigateBack);
};
</script>

<style lang="less" scoped></style>
