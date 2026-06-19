<script setup lang="ts">
import { loadScript } from '~/utils/script-loader';
import { messageError, messageInfo, messageSuccess } from '~~/utils/toast';

type BridgeStatus = 'loading' | 'ready' | 'unavailable';

const bridgeStatus = ref<BridgeStatus>('loading');
const lastPayload = ref('');
const messageLogs = ref<string[]>([]);

const statusText = computed(() => {
  switch (bridgeStatus.value) {
    case 'ready':
      return 'uni 桥接可用';
    case 'unavailable':
      return '非 UniApp WebView 环境';
    default:
      return 'SDK 加载中…';
  }
});

function pushLog(text: string) {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  messageLogs.value = [`[${time}] ${text}`, ...messageLogs.value].slice(0, 5);
}

function detectBridge() {
  const uniBridge = (window as any).uni;
  if (uniBridge?.postMessage) {
    bridgeStatus.value = 'ready';
    pushLog('检测到 uni.postMessage');
  }
  else {
    bridgeStatus.value = 'unavailable';
    pushLog('当前为普通浏览器，桥接不可用');
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      loadScript('https://res.wx.qq.com/open/js/jweixin-1.4.0.js'),
      loadScript('/js/uni.webview.min.js'),
    ]);
    detectBridge();
  }
  catch (e) {
    console.error(e);
    bridgeStatus.value = 'unavailable';
    messageError('Uni SDK 加载失败');
  }

  document.addEventListener('UniAppJSBridgeReady', detectBridge);
});

onBeforeUnmount(() => {
  document.removeEventListener('UniAppJSBridgeReady', detectBridge);
});

const sendMessage = () => {
  const uniBridge = (window as any).uni;
  const payload = {
    action: 'message',
    message: 'Hello from blog-home test page',
    at: Date.now(),
  };
  lastPayload.value = JSON.stringify(payload, null, 2);

  if (!uniBridge?.postMessage) {
    messageInfo('浏览器中无法真正 postMessage，已记录模拟 payload');
    pushLog('模拟发送 postMessage（非 WebView）');
    return;
  }

  uniBridge.postMessage({ data: payload });
  messageSuccess('postMessage 已发送');
  pushLog('postMessage 已发送');
};

const tryNavigateBack = () => {
  const uniBridge = (window as any).uni;
  if (!uniBridge?.navigateBack) {
    messageInfo('navigateBack 仅在 UniApp WebView 内可用');
    pushLog('navigateBack 不可用');
    return;
  }
  uniBridge.navigateBack({ delta: 1 });
  pushLog('调用 navigateBack({ delta: 1 })');
};
</script>

<template>
  <div class="uniapp-lab space-y-3">
    <div class="uniapp-status" :class="`uniapp-status--${bridgeStatus}`">
      <span class="uniapp-status-dot" />
      {{ statusText }}
    </div>

    <p class="uniapp-tip">
      在 UniApp WebView 内打开本页时，可测试
      <code class="uniapp-code">uni.postMessage</code>
      与
      <code class="uniapp-code">uni.navigateBack</code>。 普通浏览器会走模拟提示。
    </p>

    <div class="uniapp-actions">
      <button type="button" class="btn btn-sm btn-primary" @click="sendMessage">
        发送 postMessage
      </button>
      <button type="button" class="btn btn-sm btn-outline" @click="tryNavigateBack">
        navigateBack
      </button>
    </div>

    <pre v-if="lastPayload" class="uniapp-payload">{{ lastPayload }}</pre>

    <ul class="uniapp-log">
      <li v-for="(line, i) in messageLogs" :key="i">
        {{ line }}
      </li>
      <li v-if="!messageLogs.length" class="uniapp-log-empty">
        操作日志将显示在这里
      </li>
    </ul>
  </div>
</template>

<style scoped>
  .uniapp-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 999px;
    background: oklch(var(--bc) / 0.06);
    color: oklch(var(--bc) / 0.72);
  }

  .uniapp-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: oklch(var(--bc) / 0.35);
  }

  .uniapp-status--ready {
    background: oklch(var(--su) / 0.12);
    color: oklch(var(--su));
  }

  .uniapp-status--ready .uniapp-status-dot {
    background: oklch(var(--su));
  }

  .uniapp-status--unavailable .uniapp-status-dot {
    background: oklch(var(--wa));
  }

  .uniapp-tip {
    font-size: 12px;
    line-height: 1.5;
    color: oklch(var(--bc) / 0.62);
  }

  .uniapp-code {
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 11px;
    background: oklch(var(--bc) / 0.08);
  }

  .uniapp-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .uniapp-payload {
    margin: 0;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 11px;
    line-height: 1.5;
    overflow-x: auto;
    background: oklch(var(--bc) / 0.06);
    border: 1px solid oklch(var(--bc) / 0.1);
  }

  .uniapp-log {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 11px;
    font-family: ui-monospace, monospace;
    color: oklch(var(--bc) / 0.65);
  }

  .uniapp-log li {
    padding: 3px 0;
    border-bottom: 1px dashed oklch(var(--bc) / 0.08);
  }

  .uniapp-log-empty {
    font-style: italic;
    color: oklch(var(--bc) / 0.42);
  }
</style>
