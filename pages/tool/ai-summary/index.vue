<template>
  <div class="space-y-4">
    <CyberToolCard title="AI 文章摘要生成器" desc="将长文章转换为简洁摘要，支持多种摘要风格">
      <template #icon>
        <xia-icon icon="blog-ai" />
      </template>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="flex flex-wrap items-center gap-2">
          <span class="w-20 shrink-0 text-sm text-tech-muted">摘要风格</span>
          <select v-model="summaryStyle" class="select select-bordered login-input max-w-xs">
            <option value="concise">
              简洁型
            </option>
            <option value="detailed">
              详细型
            </option>
            <option value="technical">
              技术型
            </option>
            <option value="casual">
              轻松型
            </option>
          </select>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="w-20 shrink-0 text-sm text-tech-muted">摘要长度</span>
          <select v-model="summaryLength" class="select select-bordered login-input max-w-xs">
            <option value="short">
              短摘要 (50字)
            </option>
            <option value="medium">
              中摘要 (100字)
            </option>
            <option value="long">
              长摘要 (200字)
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
        />
        <div class="mt-4 flex items-center justify-between gap-2">
          <div class="text-xs text-tech-subtle">
            字数: {{ originalText.length }} / 推荐: 500-3000字
          </div>
          <CyberButton
            variant="primary"
            class="!py-2 !text-sm"
            :disabled="loading || !originalText.trim()"
            @click="generateSummary"
          >
            <span v-if="loading" class="loading loading-spinner loading-sm" />
            {{ loading ? '生成中...' : '生成摘要' }}
          </CyberButton>
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

        <div
          v-else-if="loading && summary.length < 6"
          class="flex h-80 items-center justify-center"
        >
          <div class="text-center">
            <span class="loading loading-dots loading-lg" />
            <p class="mt-2 text-tech-muted">
              AI 正在分析文章内容...
            </p>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="min-h-[200px] rounded-lg border border-tech bg-tech-header p-4">
            <p class="text-sm leading-relaxed text-tech">
              {{ summary }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <CyberButton
              variant="secondary"
              class="!py-2 !text-sm"
              @click="copyToClipboard(summary)"
            >
              <xia-icon icon="blog-copy" />
              复制
            </CyberButton>
            <CyberButton variant="secondary" class="!py-2 !text-sm" @click="exportAsMarkdown">
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
      <div class="max-h-60 space-y-3 overflow-y-auto">
        <div
          v-for="(item, index) in summaryHistory"
          :key="index"
          class="cursor-pointer rounded-lg border border-tech p-3 transition-colors hover:bg-tech-header"
          @click="loadFromHistory(item)"
        >
          <div class="mb-1 text-xs text-tech-subtle">
            {{ formatDate(item.timestamp) }} - {{ item.style }} - {{ item.length }}
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
import { messageSuccess, messageDanger } from '~/utils/toast';
import { SSE } from 'sse.js';
import { aesDecrypt } from '~~/utils/crypto';

definePageMeta({
  title: 'AI 文章摘要生成器',
  description: '使用AI技术自动生成文章摘要，提升内容创作效率',
});

const originalText = ref('');
const summary = ref('');
const loading = ref(false);
type SummaryStyle = 'concise' | 'detailed' | 'technical' | 'casual';
type SummaryLength = 'short' | 'medium' | 'long';

const summaryStyle = ref<SummaryStyle>('concise');
const summaryLength = ref<SummaryLength>('medium');

const summaryHistory = ref<any[]>([]);

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

const generateSummary = async () => {
  if (!originalText.value.trim()) {
    messageDanger('请输入文章内容');
    return;
  }

  if (originalText.value.length < 100) {
    messageDanger('文章内容太短，建议至少100字以上');
    return;
  }

  loading.value = true;
  summary.value = '';

  const prompt = `请为以下文章生成摘要：

要求：
- 风格：${stylePrompts[summaryStyle.value]}
- 长度：${lengthPrompts[summaryLength.value]}
- 保持客观中性，突出主要观点
- 使用中文输出

文章内容：
${originalText.value}

请直接输出摘要内容，不要包含其他说明文字。`;

  try {
    const payload = {
      messages: [{ role: 'user', content: prompt }],
      model: 'deepseek-chat',
    };

    const source = new SSE('/api/ai-summary-stream', {
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(payload),
      method: 'POST',
      start: false,
    });

    source.addEventListener('message', (event: any) => {
      if (event.data === '[DONE]') {
        loading.value = false;

        summaryHistory.value.unshift({
          summary: summary.value,
          style: summaryStyle.value,
          length: summaryLength.value,
          timestamp: new Date(),
          originalLength: originalText.value.length,
        });

        if (summaryHistory.value.length > 10) {
          summaryHistory.value = summaryHistory.value.slice(0, 10);
        }
      }
      else {
        const chunk = JSON.parse(event.data);
        const content = chunk.choices[0].delta.content || '';
        summary.value += content;
      }
    });

    source.addEventListener('error', () => {
      loading.value = false;
      messageDanger('生成摘要失败，请检查网络连接或API配置');
    });

    source.stream();
  }
  catch (error) {
    loading.value = false;
    messageDanger('生成摘要失败');
    console.error(error);
  }
};

const regenerateSummary = () => {
  summary.value = '';
  generateSummary();
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

**摘要风格**: ${summaryStyle.value}
**摘要长度**: ${summaryLength.value}
**生成时间**: ${new Date().toLocaleString()}

## 摘要内容

${summary.value}

## 原文信息

- 原文字数: ${originalText.value.length}
- 压缩比例: ${Math.round((summary.value.length / originalText.value.length) * 100)}%
`;

  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `文章摘要_${new Date().getTime()}.md`;
  a.click();
  URL.revokeObjectURL(url);

  messageSuccess('摘要已导出为 Markdown 文件');
};

const loadFromHistory = (item: any) => {
  summary.value = item.summary;
  summaryStyle.value = item.style;
  summaryLength.value = item.length;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  const route = useRoute();
  if (route.query.params) {
    const decrypt = aesDecrypt(route.query.params);
    const params = JSON.parse(decrypt);
    originalText.value = params.content;
  }
});
</script>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
