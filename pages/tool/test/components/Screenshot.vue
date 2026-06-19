<script setup lang="ts">
import { captureHtmlElement } from '~/utils/dom-capture';
import { loadScreenshotScripts } from '~/utils/script-loader';
import { messageError, messageSuccess } from '~~/utils/toast';

const captureRef = ref<HTMLElement | null>(null);
const previewUrl = ref('');
const capturing = ref(false);
const exportingPdf = ref(false);
const scriptsReady = ref(false);

const sampleLines = [
  '江夏的 Blog · 开发测试',
  'DOM 截图 / PDF 导出',
  new Date().toLocaleString('zh-CN'),
];

onMounted(async () => {
  try {
    await loadScreenshotScripts();
    scriptsReady.value = true;
  }
  catch (e) {
    console.error(e);
    messageError('截图脚本加载失败');
  }
});

const capture = async () => {
  if (!captureRef.value || capturing.value) return;
  capturing.value = true;
  try {
    const dataUrl = await captureHtmlElement(captureRef.value, { scale: 2 });
    previewUrl.value = dataUrl;

    const link = document.createElement('a');
    link.download = `blog-lab-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    messageSuccess('PNG 已生成并触发下载');
  }
  catch (error) {
    console.error(error);
    messageError('截图失败');
  }
  finally {
    capturing.value = false;
  }
};

const generatePdf = async () => {
  if (!scriptsReady.value || !captureRef.value || exportingPdf.value) return;
  if (typeof window === 'undefined' || typeof html2pdf === 'undefined') {
    messageError('PDF 库未就绪');
    return;
  }
  exportingPdf.value = true;
  try {
    await html2pdf()
      .set({
        filename: `blog-lab-${Date.now()}.pdf`,
        pagebreak: { mode: 'avoid-all' },
      })
      .from(captureRef.value)
      .save();
    messageSuccess('PDF 已导出');
  }
  catch (error) {
    console.error(error);
    messageError('PDF 导出失败');
  }
  finally {
    exportingPdf.value = false;
  }
};
</script>

<template>
  <div class="screenshot-lab space-y-4">
    <div class="screenshot-toolbar">
      <button
        type="button"
        class="btn btn-sm btn-primary"
        :disabled="!scriptsReady || capturing"
        @click="capture"
      >
        <span v-if="capturing" class="loading loading-spinner loading-xs" />
        {{ capturing ? '截图中…' : '导出 PNG' }}
      </button>
      <button
        type="button"
        class="btn btn-sm btn-outline"
        :disabled="!scriptsReady || exportingPdf"
        @click="generatePdf"
      >
        <span v-if="exportingPdf" class="loading loading-spinner loading-xs" />
        {{ exportingPdf ? '生成中…' : '导出 PDF' }}
      </button>
      <span v-if="!scriptsReady" class="text-xs text-base-content/50">脚本加载中…</span>
    </div>

    <div ref="captureRef" class="capture-card">
      <div class="capture-card-glow" />
      <p class="capture-card-title">
        Capture Target
      </p>
      <ul class="capture-card-lines">
        <li v-for="(line, i) in sampleLines" :key="i">
          {{ line }}
        </li>
      </ul>
      <div class="capture-card-badge">
        modern-screenshot + html2pdf
      </div>
    </div>

    <div v-if="previewUrl" class="screenshot-preview">
      <p class="screenshot-preview-label">
        最近一次截图预览
      </p>
      <img :src="previewUrl" alt="截图预览" class="screenshot-preview-img">
    </div>
  </div>
</template>

<style scoped>
  .screenshot-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .capture-card {
    position: relative;
    overflow: hidden;
    padding: 20px 22px;
    border-radius: 14px;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%);
    color: #f8fafc;
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.35);
  }

  .capture-card-glow {
    position: absolute;
    top: -40px;
    right: -20px;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.35), transparent 70%);
    pointer-events: none;
  }

  .capture-card-title {
    font-size: 18px;
    font-weight: 800;
    margin-bottom: 10px;
    letter-spacing: 0.02em;
  }

  .capture-card-lines {
    margin: 0;
    padding-left: 18px;
    font-size: 13px;
    line-height: 1.7;
    color: #cbd5e1;
  }

  .capture-card-badge {
    display: inline-block;
    margin-top: 14px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    background: rgba(56, 189, 248, 0.18);
    color: #7dd3fc;
  }

  .screenshot-preview-label {
    font-size: 12px;
    color: oklch(var(--bc) / 0.55);
    margin-bottom: 6px;
  }

  .screenshot-preview-img {
    max-width: 220px;
    border-radius: 8px;
    border: 1px solid oklch(var(--bc) / 0.12);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
</style>
