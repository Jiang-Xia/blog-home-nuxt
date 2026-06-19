<!--
  AI 文章摘要工具：通过 Nitro SSE 代理 DeepSeek，密钥由服务端 AI_SUMMARY_API_KEY 持有。
  支持 ?params= 加密预填原文（与全站 aesEncrypt 约定一致）。
-->
<template>
  <div class="space-y-4">
    <div
      v-if="serviceConfigured === false"
      class="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning"
    >
      AI 摘要服务尚未配置。请在 <code class="text-xs">blog-home-nuxt/.env.development</code> 中设置
      <code class="text-xs">AI_SUMMARY_API_KEY</code>（DeepSeek API Key）后重启开发服务。
    </div>

    <CyberToolCard title="AI 文章摘要生成器" desc="将长文章转换为简洁摘要，支持多种摘要风格">
      <template #icon>
        <xia-icon icon="blog-ai" />
      </template>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="flex flex-wrap items-center gap-2">
          <span class="w-20 shrink-0 text-sm text-tech-muted">摘要风格</span>
          <select
            v-model="summaryStyle"
            class="select select-bordered login-input max-w-xs"
            :disabled="loading"
          >
            <option v-for="(label, key) in styleLabels" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="w-20 shrink-0 text-sm text-tech-muted">摘要长度</span>
          <select
            v-model="summaryLength"
            class="select select-bordered login-input max-w-xs"
            :disabled="loading"
          >
            <option v-for="(label, key) in lengthLabels" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>
      </div>
    </CyberToolCard>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <CyberToolCard title="原文内容">
        <textarea
          v-model="originalText"
          placeholder="粘贴您的文章内容..."
          class="textarea textarea-bordered login-input h-80 w-full text-sm"
          :disabled="loading"
          :maxlength="MAX_CONTENT_CHARS"
        />
        <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div class="text-xs" :class="wordCountClass">
            字数: {{ originalText.length }} / 推荐 500-3000，上限 {{ MAX_CONTENT_CHARS }}
          </div>
          <div class="flex flex-wrap gap-2">
            <CyberButton
              variant="secondary"
              class="!py-2 !text-sm"
              :disabled="loading || !originalText"
              @click="clearOriginal"
            >
              清空
            </CyberButton>
            <CyberButton
              variant="primary"
              class="!py-2 !text-sm"
              :disabled="loading || !canGenerate"
              @click="generateSummary"
            >
              <span v-if="loading" class="loading loading-spinner loading-sm" />
              {{ loading ? '生成中...' : '生成摘要' }}
            </CyberButton>
          </div>
        </div>
      </CyberToolCard>

      <CyberToolCard title="AI 摘要">
        <div
          v-if="!summary && !loading"
          class="flex h-80 items-center justify-center text-tech-faint"
        >
          <div class="text-center">
            <xia-icon icon="blog-ai" width="48px" height="48px" class="opacity-50" />
            <p class="mt-2">
              输入文章内容并点击生成摘要
            </p>
          </div>
        </div>

        <div v-else-if="loading && !summary" class="flex h-80 items-center justify-center">
          <div class="text-center">
            <span class="loading loading-dots loading-lg" />
            <p class="mt-2 text-tech-muted">
              AI 正在分析文章内容...
            </p>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="min-h-[200px] rounded-lg border border-tech bg-tech-header p-4">
            <p class="whitespace-pre-wrap text-sm leading-relaxed text-tech">
              {{ summary
              }}<span v-if="loading" class="inline-block w-0.5 animate-pulse bg-tech">|</span>
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <CyberButton
              variant="secondary"
              class="!py-2 !text-sm"
              :disabled="!summary"
              @click="copyToClipboard(summary)"
            >
              <xia-icon icon="blog-copy" />
              复制
            </CyberButton>
            <CyberButton
              variant="secondary"
              class="!py-2 !text-sm"
              :disabled="!summary"
              @click="exportAsMarkdown"
            >
              <xia-icon icon="blog-daochu" />
              导出
            </CyberButton>
            <CyberButton
              variant="secondary"
              class="!py-2 !text-sm"
              :disabled="loading"
              @click="regenerateSummary"
            >
              <xia-icon icon="blog-refresh" />
              重新生成
            </CyberButton>
          </div>
        </div>
      </CyberToolCard>
    </div>

    <CyberToolCard v-if="summaryHistory.length > 0" title="历史记录">
      <div class="mb-3 flex justify-end">
        <CyberButton variant="secondary" class="!py-1 !text-xs" @click="clearHistory">
          清空历史
        </CyberButton>
      </div>
      <div class="max-h-60 space-y-3 overflow-y-auto">
        <div
          v-for="item in summaryHistory"
          :key="item.timestamp"
          class="cursor-pointer rounded-lg border border-tech p-3 transition-colors hover:bg-tech-header"
          @click="loadFromHistory(item)"
        >
          <div class="mb-1 text-xs text-tech-subtle">
            {{ formatDate(item.timestamp) }} · {{ styleLabels[item.style] }} ·
            {{ lengthLabels[item.length] }}
          </div>
          <p class="line-clamp-2 text-sm text-tech-muted">
            {{ item.summary }}
          </p>
        </div>
      </div>
    </CyberToolCard>
  </div>
</template>

<script setup lang="ts">
import copy from 'copy-to-clipboard';
import { SSE } from 'sse.js';
import { messageSuccess, messageDanger } from '~/utils/toast';
import { aesDecrypt } from '~~/utils/crypto';

definePageMeta({
  title: 'AI 文章摘要生成器',
  description: '使用AI技术自动生成文章摘要，提升内容创作效率',
});

type SummaryStyle = 'concise' | 'detailed' | 'technical' | 'casual';
type SummaryLength = 'short' | 'medium' | 'long';

interface SummaryHistoryItem {
  summary: string;
  style: SummaryStyle;
  length: SummaryLength;
  timestamp: number;
  originalLength: number;
}

const MAX_CONTENT_CHARS = 8000;
const HISTORY_STORAGE_KEY = 'ai-summary-history';
const MIN_CONTENT_CHARS = 100;

const styleLabels: Record<SummaryStyle, string> = {
  concise: '简洁型',
  detailed: '详细型',
  technical: '技术型',
  casual: '轻松型',
};

const lengthLabels: Record<SummaryLength, string> = {
  short: '短摘要 (50字)',
  medium: '中摘要 (100字)',
  long: '长摘要 (200字)',
};

const stylePrompts: Record<SummaryStyle, string> = {
  concise: '简洁明了，突出核心要点',
  detailed: '详细完整，包含主要论点和支撑信息',
  technical: '专业术语准确，突出技术细节',
  casual: '轻松易懂，使用日常语言表达',
};

const lengthPrompts: Record<SummaryLength, string> = {
  short: '50字以内',
  medium: '100字左右',
  long: '200字左右',
};

const originalText = ref('');
const summary = ref('');
const loading = ref(false);
const serviceConfigured = ref<boolean | null>(null);

const summaryStyle = ref<SummaryStyle>('concise');
const summaryLength = ref<SummaryLength>('medium');
const summaryHistory = ref<SummaryHistoryItem[]>([]);

let activeSource: InstanceType<typeof SSE> | null = null;

const canGenerate = computed(() => {
  const len = originalText.value.trim().length;
  return (
    len >= MIN_CONTENT_CHARS && len <= MAX_CONTENT_CHARS && serviceConfigured.value !== false
  );
});

const wordCountClass = computed(() => {
  const len = originalText.value.length;
  if (len > MAX_CONTENT_CHARS) {
    return 'text-error';
  }
  if (len > 0 && len < MIN_CONTENT_CHARS) {
    return 'text-warning';
  }
  return 'text-tech-subtle';
});

/** 关闭当前 SSE 连接，避免重复请求或组件卸载后仍回调 */
function closeActiveSource() {
  if (activeSource) {
    activeSource.close();
    activeSource = null;
  }
}

/** 从 SSE error/open 事件中提取可读错误信息 */
function resolveStreamError(event: Event & { responseCode?: number; data?: string }) {
  const code = event.responseCode;

  if (code === 503) {
    return 'AI 摘要服务未配置，请设置 AI_SUMMARY_API_KEY 后重启服务';
  }
  if (code === 401 || code === 403) {
    return 'API 密钥无效或已过期，请检查 AI_SUMMARY_API_KEY';
  }
  if (code === 400) {
    return parseErrorPayload(event.data) || '请求参数无效';
  }
  if (code === 502) {
    return parseErrorPayload(event.data) || '上游 AI 服务暂时不可用';
  }

  return parseErrorPayload(event.data) || '生成摘要失败，请检查网络连接后重试';
}

function parseErrorPayload(raw?: string) {
  if (!raw) {
    return '';
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed.statusMessage || parsed.message || '';
  }
  catch {
    return raw.length < 120 ? raw : '';
  }
}

function buildPrompt() {
  return `请为以下文章生成摘要：

要求：
- 风格：${stylePrompts[summaryStyle.value]}
- 长度：${lengthPrompts[summaryLength.value]}
- 保持客观中性，突出主要观点
- 使用中文输出

文章内容：
${originalText.value}

请直接输出摘要内容，不要包含其他说明文字。`;
}

function persistHistory() {
  if (!import.meta.client) {
    return;
  }
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(summaryHistory.value));
}

function loadHistoryFromStorage() {
  if (!import.meta.client) {
    return;
  }
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as SummaryHistoryItem[];
    if (Array.isArray(parsed)) {
      summaryHistory.value = parsed.slice(0, 10);
    }
  }
  catch {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  }
}

function appendHistoryItem() {
  if (!summary.value.trim()) {
    return;
  }

  summaryHistory.value.unshift({
    summary: summary.value,
    style: summaryStyle.value,
    length: summaryLength.value,
    timestamp: Date.now(),
    originalLength: originalText.value.length,
  });

  if (summaryHistory.value.length > 10) {
    summaryHistory.value = summaryHistory.value.slice(0, 10);
  }

  persistHistory();
}

async function checkServiceStatus() {
  try {
    const result = await $fetch<{ configured: boolean }>('/api/ai-summary-status');
    serviceConfigured.value = result.configured;
  }
  catch {
    serviceConfigured.value = null;
  }
}

const generateSummary = async () => {
  if (!originalText.value.trim()) {
    messageDanger('请输入文章内容');
    return;
  }

  if (originalText.value.length < MIN_CONTENT_CHARS) {
    messageDanger(`文章内容太短，建议至少 ${MIN_CONTENT_CHARS} 字以上`);
    return;
  }

  if (originalText.value.length > MAX_CONTENT_CHARS) {
    messageDanger(`文章内容过长，请控制在 ${MAX_CONTENT_CHARS} 字以内`);
    return;
  }

  closeActiveSource();
  loading.value = true;
  summary.value = '';

  const payload = {
    messages: [{ role: 'user', content: buildPrompt() }],
    model: 'deepseek-chat',
  };

  try {
    const source = new SSE('/api/ai-summary-stream', {
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(payload),
      method: 'POST',
      start: false,
    });

    activeSource = source;

    source.addEventListener('open', (event: Event & { responseCode?: number; data?: string }) => {
      if (event.responseCode && event.responseCode >= 400) {
        loading.value = false;
        messageDanger(resolveStreamError(event));
        closeActiveSource();
      }
    });

    source.addEventListener('message', (event: MessageEvent) => {
      if (event.data === '[DONE]') {
        loading.value = false;
        appendHistoryItem();
        closeActiveSource();
        return;
      }

      try {
        const chunk = JSON.parse(event.data as string);
        const content = chunk?.choices?.[0]?.delta?.content;
        if (content) {
          summary.value += content;
        }
      }
      catch {
        // 忽略非 JSON 心跳片段
      }
    });

    source.addEventListener(
      'error',
      (event: Event & { responseCode?: number; data?: string }) => {
        loading.value = false;
        if (!summary.value.trim()) {
          messageDanger(resolveStreamError(event));
        }
        closeActiveSource();
      },
    );

    source.stream();
  }
  catch (error) {
    loading.value = false;
    messageDanger('生成摘要失败');
    console.error(error);
    closeActiveSource();
  }
};

const regenerateSummary = () => {
  if (loading.value) {
    return;
  }
  generateSummary();
};

const clearOriginal = () => {
  originalText.value = '';
};

const copyToClipboard = (text: string) => {
  if (copy(text)) {
    messageSuccess('摘要已复制到剪贴板');
  }
  else {
    messageDanger('复制失败');
  }
};

const exportAsMarkdown = () => {
  const markdown = `# 文章摘要

**摘要风格**: ${styleLabels[summaryStyle.value]}
**摘要长度**: ${lengthLabels[summaryLength.value]}
**生成时间**: ${new Date().toLocaleString()}

## 摘要内容

${summary.value}

## 原文信息

- 原文字数: ${originalText.value.length}
- 压缩比例: ${originalText.value.length ? Math.round((summary.value.length / originalText.value.length) * 100) : 0}%
`;

  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `文章摘要_${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);

  messageSuccess('摘要已导出为 Markdown 文件');
};

const loadFromHistory = (item: SummaryHistoryItem) => {
  summary.value = item.summary;
  summaryStyle.value = item.style;
  summaryLength.value = item.length;
};

const clearHistory = () => {
  summaryHistory.value = [];
  persistHistory();
  messageSuccess('历史记录已清空');
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function loadPrefillFromRoute() {
  const route = useRoute();
  const raw = route.query.params;
  const encrypted = Array.isArray(raw) ? raw[0] : raw;
  if (!encrypted) {
    return;
  }

  try {
    const params = JSON.parse(aesDecrypt(encrypted));
    if (typeof params?.content === 'string') {
      originalText.value = params.content;
    }
  }
  catch {
    messageDanger('预填参数解析失败，请手动粘贴文章内容');
  }
}

onMounted(() => {
  loadHistoryFromStorage();
  loadPrefillFromRoute();
  checkServiceStatus();
});

onUnmounted(() => {
  closeActiveSource();
});
</script>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
