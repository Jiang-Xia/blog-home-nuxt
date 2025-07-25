<template>
  <div class="p-4 max-w-6xl mx-auto rounded-xl bg-base-100">
    <div class="card bg-base-100 shadow-xl mx-auto rounded-xl mb-4">
      <div class="card-body">
        <h2 class="card-title">
          参数配置
        </h2>
        <div class="pl-8 pt-4">
          <div class="flex items-center mb-4">
            <span class="w-20"><span class="text-red-600">*</span>baseURL</span>
            <input
              v-model="baseURL"
              type="text"
              placeholder="baseURL"
              class="input input-bordered input-md max-w-xs w-5/6"
            >
          </div>
          <div class="flex items-center mb-4">
            <span class="w-20"><span class="text-red-600">*</span>model</span>
            <!-- <input
              v-model="model"
              type="text"
              placeholder="deepseek-reasoner或者deepseek-chat"
              class="input input-bordered input-md max-w-xs w-5/6"
            > -->
            <select
              v-model="model"
              placeholder="模型"
              class="select select-accent select-bordered max-w-xs w-5/6"
            >
              <option v-for="item in modelList" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </div>
          <div class="flex items-center mb-4">
            <span class="w-20"><span class="text-red-600">*</span>apiKey</span>
            <input
              v-model="apiKey"
              type="text"
              placeholder="apiKey"
              class="input input-bordered input-md max-w-xs w-5/6"
            >
          </div>
        </div>
      </div>
    </div>

    <div class="mockup-browser border-base-300 border mx-auto">
      <div class="mockup-browser-toolbar">
        <div class="input border-base-300 border">
          {{ model }}
        </div>
      </div>
      <div class="border-base-300 border-t px-4 py-16">
        <template v-for="(item, index) in chatList">
          <div v-if="item.role === 'assistant'" class="chat chat-start">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full">
                <xia-icon width="30px" height="30px" icon="blog-jiqiren" />
              </div>
            </div>
            <div class="chat-bubble">
              <div v-if="model === 'deepseek-reasoner'" class="opacity-50 text-xs mb-3">
                <p class="font-semibold">
                  深度思考{{ loading ? '中' : '' }}：
                </p>
                {{ item.reasoning_content || '' }}
              </div>
              <div>{{ item.content || '' }}</div>
              <div>
                <span
                  v-if="index === chatList.length - 1 && loading"
                  class="loading loading-infinity loading-md"
                />
              </div>
            </div>
            <!-- <div class="chat-footer opacity-50">Delivered</div> -->
          </div>

          <div v-if="item.role === 'user'" class="chat chat-end">
            <div class="chat-bubble bg-blue-200 text-accent-content">
              {{ item.content || '' }}
            </div>
          </div>
        </template>
      </div>

      <div class="flex justify-center pb-2 w-full items-center">
        <textarea
          v-model="inputText"
          placeholder="给AI发送消息"
          class="textarea textarea-bordered textarea-md w-3/5"
        />
        <div class="flex items-center">
          <span v-if="loading" class="loading loading-infinity loading-lg" />
          <button class="btn btn-neutral ml-2" :disabled="loading" @click="onChange">
            发 送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SSE } from 'sse.js';
import { messageDanger } from '~~/utils/toast';
import { baseUrl } from '~~/config';

const modelList = ref([
  {
    value: 'deepseek-reasoner',
    label: 'deepseek-reasoner',
  },
  {
    value: 'deepseek-chat',
    label: 'deepseek-chat',
  },
]);
const chatList = ref<any[]>([]);
const inputText = ref('你好，给我讲个冷笑话~');
const baseURL = ref('https://api.deepseek.com');
// const baseURL = ref('https://api.openai.com/v1')
const model = ref('deepseek-reasoner');
// const model = ref('deepseek-chat');

// const baseURL = ref('http://localhost:11434/api/chat')
// const model = ref('deepseek-r1:1.5b')
const apiKey = ref('');
const loading = ref(false);
const onChange = () => {
  if (!apiKey.value || !baseURL.value || !model.value) {
    messageDanger('请输入完整参数！');
    return;
  }
  if (!inputText.value) {
    messageDanger('请输入问题！');
    return;
  }
  chatList.value.push({ role: 'user', content: inputText.value });
  // chatList.value.push({ role: 'assistant', content: '给我写一篇关于爬墙出学校的300字检讨书给我写一篇关于爬墙出学校的300字检讨书给我写一篇关于爬墙出学校的300字检讨书给我写一篇关于爬墙出学校的300字检讨书', reasoning_content: '给我写一篇关于爬墙出学校的300字检讨书给我写一篇关于爬墙出学校的300字检讨书给我写一篇关于爬墙出学校的300字检讨书给我写一篇关于爬墙出学校的300字检讨书给我写一篇关于爬墙出学校的300字检讨书', })
  // return
  inputText.value = '';
  send();
};

const send = () => {
  loading.value = true;
  let messages = JSON.parse(JSON.stringify(chatList.value));
  messages = messages.map((v: any) => {
    v.reasoning_content = undefined;
    return v;
  });
  const payload = {
    messages,
    baseURL: baseURL.value,
    model: model.value,
    apiKey: apiKey.value,
  };
  try {
    const source: any = new SSE(baseUrl + '/pub/ai-stream', {
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(payload), // 请求体
      method: 'POST',
      start: false,
      debug: true,
    });
    chatList.value.push({ role: 'assistant', content: '', reasoning_content: '' });
    source.addEventListener('message', (event: any) => {
      if (event.data === '[DONE]') {
        loading.value = false;
        // 完成时，可以做一些处理
      }
      else {
        const chunk = JSON.parse(event.data);
        const reasoningContent = chunk.choices[0].delta.reasoning_content || '';
        const content = chunk.choices[0].delta.content || '';
        if (chunk.choices[0].delta.reasoning_content) {
          chatList.value[chatList.value.length - 1].reasoning_content
              = chatList.value[chatList.value.length - 1].reasoning_content + reasoningContent;
        }
        else {
          chatList.value[chatList.value.length - 1].content
              = chatList.value[chatList.value.length - 1].content + content;
        }
      }
    });
    source.stream(); // 开始连接

    source.addEventListener('error', (event: any) => {
      loading.value = false;
    });
  }
  catch (error) {
    console.error(error);
    loading.value = false;
  }
};
</script>

<style lang="less" scoped></style>
