<template>
  <div class="p-4 max-w-6xl mx-auto rounded-xl bg-base-100">
    <div class="card bg-base-100 shadow-xl mx-auto rounded-xl mb-4">
      <div class="card-body">
        <h2 class="card-title">
          <xia-icon icon="blog-ai" />
          AI 文章摘要生成器
        </h2>
        <p class="text-sm text-gray-600">
          将长文章转换为简洁摘要，支持多种摘要风格
        </p>

        <div class="pl-8 pt-4">
          <div class="flex items-center mb-4">
            <span class="w-20 text-sm font-medium">摘要风格</span>
            <select v-model="summaryStyle" class="select select-bordered select-sm max-w-xs">
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

          <div class="flex items-center mb-4">
            <span class="w-20 text-sm font-medium">摘要长度</span>
            <select v-model="summaryLength" class="select select-bordered select-sm max-w-xs">
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
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 输入区域 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h3 class="card-title text-lg">
            原文内容
          </h3>
          <textarea
            v-model="originalText"
            placeholder="粘贴您的文章内容..."
            class="textarea textarea-bordered w-full h-80 text-sm"
            :disabled="loading"
          />
          <div class="card-actions justify-between">
            <div class="text-xs text-gray-500">
              字数: {{ originalText.length }} / 推荐: 500-3000字
            </div>
            <button
              class="btn btn-primary btn-sm"
              :disabled="loading || !originalText.trim()"
              @click="generateSummary"
            >
              <span v-if="loading" class="loading loading-spinner loading-sm" />
              {{ loading ? '生成中...' : '生成摘要' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 输出区域 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h3 class="card-title text-lg">
            AI 摘要
          </h3>
          <div
            v-if="!summary && !loading"
            class="flex items-center justify-center h-80 text-gray-400"
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
            class="flex items-center justify-center h-80"
          >
            <div class="text-center">
              <span class="loading loading-dots loading-lg" />
              <p class="mt-2 text-gray-600">
                AI 正在分析文章内容...
              </p>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="bg-gray-50 rounded-lg p-4 min-h-[200px]">
              <p class="text-sm leading-relaxed">
                {{ summary }}
              </p>
            </div>

            <div class="flex gap-2">
              <button class="btn btn-outline btn-sm" @click="copyToClipboard(summary)">
                <xia-icon icon="blog-copy" />
                复制
              </button>
              <button class="btn btn-outline btn-sm" @click="exportAsMarkdown">
                <xia-icon icon="blog-daochu" />
                导出
              </button>
              <button class="btn btn-outline btn-sm" :disabled="loading" @click="regenerateSummary">
                <xia-icon icon="blog-refresh" />
                重新生成
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录 -->
    <div v-if="summaryHistory.length > 0" class="card bg-base-100 shadow-xl mt-6">
      <div class="card-body">
        <h3 class="card-title text-lg">
          历史记录
        </h3>
        <div class="space-y-3 max-h-60 overflow-y-auto">
          <div
            v-for="(item, index) in summaryHistory"
            :key="index"
            class="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
            @click="loadFromHistory(item)"
          >
            <div class="text-xs text-gray-500 mb-1">
              {{ formatDate(item.timestamp) }} - {{ item.style }} - {{ item.length }}
            </div>
            <p class="text-sm line-clamp-2">
              {{ item.summary }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import copy from 'copy-to-clipboard';
import { messageSuccess, messageDanger } from '~/utils/toast';
import { SSE } from 'sse.js';
import { baseUrl } from '~/config';

definePageMeta({
  title: 'AI 文章摘要生成器',
  description: '使用AI技术自动生成文章摘要，提升内容创作效率',
});

const originalText = ref('');
const summary = ref('');
const loading = ref(false);
// 定义类型
type SummaryStyle = 'concise' | 'detailed' | 'technical' | 'casual';
type SummaryLength = 'short' | 'medium' | 'long';

const summaryStyle = ref<SummaryStyle>('concise');
const summaryLength = ref<SummaryLength>('medium');

// 历史记录
const summaryHistory = ref<any[]>([]);

// 摘要风格映射
const stylePrompts: Record<SummaryStyle, string> = {
  concise: '简洁明了，突出核心要点',
  detailed: '详细完整，包含主要论点和支撑信息',
  technical: '专业术语准确，突出技术细节',
  casual: '轻松易懂，使用日常语言表达',
};

// 长度映射
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
      baseURL: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      apiKey: 'sk-4da6f1b1e1a04084869c8c28c874bd14', // 需要用户配置
    };

    const source = new SSE(baseUrl + '/pub/ai-stream', {
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(payload),
      method: 'POST',
      start: false,
    });

    source.addEventListener('message', (event: any) => {
      if (event.data === '[DONE]') {
        loading.value = false;

        // 保存到历史记录
        summaryHistory.value.unshift({
          summary: summary.value,
          style: summaryStyle.value,
          length: summaryLength.value,
          timestamp: new Date(),
          originalLength: originalText.value.length,
        });

        // 限制历史记录数量
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

// 加载历史记录
onMounted(() => {
  const saved = localStorage.getItem('ai-summary-history');
  if (saved) {
    summaryHistory.value = JSON.parse(saved);
  }
});

// 保存历史记录
watch(
  summaryHistory,
  (newVal) => {
    localStorage.setItem('ai-summary-history', JSON.stringify(newVal));
  },
  { deep: true },
);
</script>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
