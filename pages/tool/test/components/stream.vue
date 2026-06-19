<script setup lang="ts">
import { SSE } from 'sse.js';
import { baseUrl } from '~~/config';
import { messageError, messageInfo } from '~~/utils/toast';

type StreamStatus = 'idle' | 'connecting' | 'streaming' | 'done' | 'error';

const typedText = ref('');
const status = ref<StreamStatus>('idle');
const statusLabel = computed(() => {
  switch (status.value) {
    case 'connecting':
      return '连接中…';
    case 'streaming':
      return '接收中…';
    case 'done':
      return '已完成';
    case 'error':
      return '连接失败';
    default:
      return '待命';
  }
});

let activeSource: InstanceType<typeof SSE> | null = null;

const closeSource = () => {
  if (activeSource) {
    activeSource.close();
    activeSource = null;
  }
};

const startTypewriterDemo = () => {
  closeSource();
  typedText.value = '';
  status.value = 'connecting';

  const source = new SSE(`${baseUrl}/pub/stream`, {
    headers: { 'Content-Type': 'application/json' },
    payload: JSON.stringify({}),
    method: 'POST',
    start: false,
  });
  activeSource = source;

  source.addEventListener('open', () => {
    status.value = 'streaming';
  });

  source.addEventListener('message', (event: MessageEvent) => {
    if (event.data === '[DONE]') {
      status.value = 'done';
      closeSource();
      return;
    }
    typedText.value = event.data;
  });

  source.addEventListener('error', () => {
    status.value = 'error';
    messageError('SSE 连接失败，请确认 blog-server 已启动');
    closeSource();
  });

  source.stream();
  messageInfo('已连接 POST /pub/stream 打字机演示');
};

const resetOutput = () => {
  closeSource();
  typedText.value = '';
  status.value = 'idle';
};

onBeforeUnmount(closeSource);
</script>

<template>
  <div class="stream-lab space-y-3">
    <div class="stream-toolbar">
      <button
        type="button"
        class="btn btn-sm btn-primary"
        :disabled="status === 'connecting' || status === 'streaming'"
        @click="startTypewriterDemo"
      >
        启动打字机 SSE
      </button>
      <button type="button" class="btn btn-sm btn-ghost" @click="resetOutput">
        重置
      </button>
      <span class="stream-status" :class="`stream-status--${status}`">
        {{ statusLabel }}
      </span>
    </div>

    <p class="stream-tip">
      调用后端 <code class="stream-code">POST /pub/stream</code>，逐字推送
      <em>Hello, how are you today?</em>。完整 AI 流式对话请用
      <NuxtLink to="/tool/ai" class="link link-primary"> AI 工具页 </NuxtLink>。
    </p>

    <div class="stream-output" :class="{ 'stream-output--empty': !typedText }">
      <span v-if="typedText">{{ typedText }}</span>
      <span v-else class="stream-placeholder">输出区域</span>
      <span v-if="status === 'streaming'" class="stream-cursor">|</span>
    </div>
  </div>
</template>

<style scoped>
  .stream-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .stream-status {
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 999px;
    background: oklch(var(--bc) / 0.08);
    color: oklch(var(--bc) / 0.65);
  }

  .stream-status--streaming {
    background: oklch(var(--p) / 0.15);
    color: oklch(var(--p));
  }

  .stream-status--done {
    background: oklch(var(--su) / 0.15);
    color: oklch(var(--su));
  }

  .stream-status--error {
    background: oklch(var(--er) / 0.15);
    color: oklch(var(--er));
  }

  .stream-tip {
    font-size: 12px;
    line-height: 1.5;
    color: oklch(var(--bc) / 0.62);
  }

  .stream-code {
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 11px;
    background: oklch(var(--bc) / 0.08);
  }

  .stream-output {
    min-height: 72px;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid oklch(var(--bc) / 0.14);
    background: oklch(var(--bc) / 0.04);
    font-size: 15px;
    line-height: 1.6;
    word-break: break-word;
  }

  .stream-output--empty {
    color: oklch(var(--bc) / 0.4);
  }

  .stream-placeholder {
    font-size: 13px;
  }

  .stream-cursor {
    display: inline-block;
    margin-left: 2px;
    animation: blink 0.8s step-end infinite;
    color: oklch(var(--p));
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }
</style>
