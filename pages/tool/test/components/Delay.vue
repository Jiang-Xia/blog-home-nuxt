<script setup lang="ts">
import { throttle, debounce } from '@/test/test3.js';

const inputValue = ref('');
const scrollCount = ref(0);
const inputCount = ref(0);
const scrollLogs = ref<string[]>([]);
const inputLogs = ref<string[]>([]);

const THROTTLE_MS = 800;
const DEBOUNCE_MS = 600;

function pushLog(bucket: typeof scrollLogs, label: string) {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  bucket.value = [`[${time}] ${label}`, ...bucket.value].slice(0, 6);
}

let throttledScroll: (() => void) | null = null;
let debouncedInput: (() => void) | null = null;

onMounted(() => {
  throttledScroll = throttle(() => {
    scrollCount.value += 1;
    pushLog(scrollLogs, `滚动触发（节流 ${THROTTLE_MS}ms）`);
  }, THROTTLE_MS);

  debouncedInput = debounce(() => {
    inputCount.value += 1;
    pushLog(inputLogs, `输入稳定：「${inputValue.value}」`);
  }, DEBOUNCE_MS);

  window.addEventListener('scroll', throttledScroll, { passive: true });

  const inputEl = document.getElementById('delay-test-input');
  inputEl?.addEventListener('input', debouncedInput);
});

onBeforeUnmount(() => {
  if (throttledScroll) {
    window.removeEventListener('scroll', throttledScroll);
  }
  const inputEl = document.getElementById('delay-test-input');
  if (debouncedInput) {
    inputEl?.removeEventListener('input', debouncedInput);
  }
});

const resetStats = () => {
  scrollCount.value = 0;
  inputCount.value = 0;
  scrollLogs.value = [];
  inputLogs.value = [];
  inputValue.value = '';
};
</script>

<template>
  <div class="delay-lab space-y-4">
    <div class="delay-grid">
      <div class="delay-panel">
        <div class="delay-panel-head">
          <span class="delay-tag delay-tag--throttle">节流</span>
          <span class="delay-meta">{{ THROTTLE_MS }}ms · 滚动窗口</span>
        </div>
        <p class="delay-tip">
          快速滚动页面，计数按间隔累加（非每次 scroll 都触发）。
        </p>
        <div class="delay-stat">
          已触发 <strong>{{ scrollCount }}</strong> 次
        </div>
        <ul class="delay-log">
          <li v-for="(line, i) in scrollLogs" :key="'s' + i">
            {{ line }}
          </li>
          <li v-if="!scrollLogs.length" class="delay-log-empty">
            暂无记录，试试滚动页面
          </li>
        </ul>
      </div>

      <div class="delay-panel">
        <div class="delay-panel-head">
          <span class="delay-tag delay-tag--debounce">防抖</span>
          <span class="delay-meta">{{ DEBOUNCE_MS }}ms · 输入框</span>
        </div>
        <input
          id="delay-test-input"
          v-model="inputValue"
          type="text"
          placeholder="输入文字，停顿后触发"
          class="input input-bordered input-sm w-full login-input"
        >
        <div class="delay-stat">
          已触发 <strong>{{ inputCount }}</strong> 次
        </div>
        <ul class="delay-log">
          <li v-for="(line, i) in inputLogs" :key="'i' + i">
            {{ line }}
          </li>
          <li v-if="!inputLogs.length" class="delay-log-empty">
            暂无记录，试试输入内容
          </li>
        </ul>
      </div>
    </div>

    <button type="button" class="btn btn-xs btn-ghost" @click="resetStats">
      清空记录
    </button>
  </div>
</template>

<style scoped>
  .delay-grid {
    display: grid;
    gap: 12px;
  }

  @media (min-width: 640px) {
    .delay-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .delay-panel {
    padding: 12px;
    border-radius: 10px;
    border: 1px solid oklch(var(--bc) / 0.12);
    background: oklch(var(--bc) / 0.04);
  }

  .delay-panel-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .delay-tag {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
  }

  .delay-tag--throttle {
    background: oklch(var(--wa) / 0.18);
    color: oklch(var(--wa));
  }

  .delay-tag--debounce {
    background: oklch(var(--in) / 0.18);
    color: oklch(var(--in));
  }

  .delay-meta {
    font-size: 11px;
    color: oklch(var(--bc) / 0.55);
  }

  .delay-tip {
    font-size: 12px;
    color: oklch(var(--bc) / 0.62);
    margin-bottom: 8px;
    line-height: 1.45;
  }

  .delay-stat {
    font-size: 13px;
    margin: 8px 0;
    color: oklch(var(--bc) / 0.78);
  }

  .delay-log {
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 120px;
    overflow-y: auto;
    font-size: 11px;
    font-family: ui-monospace, monospace;
    color: oklch(var(--bc) / 0.72);
  }

  .delay-log li {
    padding: 3px 0;
    border-bottom: 1px dashed oklch(var(--bc) / 0.08);
  }

  .delay-log-empty {
    color: oklch(var(--bc) / 0.45);
    font-style: italic;
  }
</style>
