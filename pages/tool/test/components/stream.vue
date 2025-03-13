<template>
  <div>
    <input
      v-model="input"
      type="text"
      class="input"
      placeholder="请输入问题"
      @keyup.enter="onChange"
    >
    <div class="rounded-md border-x-4 border-y-4 w-64">
      {{ content }}
    </div>
  </div>

  <h1>{{ typedText }}</h1>
  <button @click="startTyping">
    Start Typing
  </button><br>
  <button @click="startTyping2">
    Start Typing2
  </button>
</template>

<script setup>
import { SSE } from 'sse.js';

const input = ref('');
const allInput = ref('');
const content = ref('');
const onChange = () => {
  content.value = '';
  allInput.value = allInput.value + input.value;
  const eventSource = new EventSource(
    'http://127.0.0.1:5000/api/v1/pub/ai-stream?content=' + allInput.value,
  );
  eventSource.onmessage = (event) => {
    console.log(event);
    if (event.data === '[DONE]') {
      // 完成时，可以做一些处理
      console.log('Typing done!');
      eventSource.close();
    }
    else {
      content.value = content.value + event.data; // 更新显示的打字文本
    }
  };

  eventSource.onerror = (err) => {
    console.error('EventSource failed:', err);
    eventSource.close();
  };
};
const typedText = ref('');

const startTyping = () => {
  const eventSource = new EventSource('http://127.0.0.1:5000/api/v1/pub/stream'); // 连接后端的 SSE 接口

  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
      // 完成时，可以做一些处理
      console.log('Typing done!');
      eventSource.close();
    }
    else {
      console.log(event.data);
      typedText.value = event.data; // 更新显示的打字文本
    }
  };

  eventSource.onerror = (err) => {
    console.error('EventSource failed:', err);
    eventSource.close();
  };
};
const startTyping2 = () => {
  const payload = {
    messages: '',
    baseURL: 'baseURL.value',
    model: 'model.value',
    apiKey: 'apiKey.value',
  };
  const source = new SSE('http://127.0.0.1:5000/api/v1/pub/stream', {
    headers: { 'Content-Type': 'application/json' },
    payload: JSON.stringify(payload), // 请求体
    method: 'POST',
    start: false,
    debug: true,
  });
  source.stream();
  source.addEventListener('message', (event) => {
    if (event.data === '[DONE]') {
      // 完成时，可以做一些处理
    }
    else {
      // console.log('========', event.data)
      typedText.value = event.data; // 更新显示的打字文本
    }
  });
};
</script>
