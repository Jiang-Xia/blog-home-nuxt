<!--
  PDF 预览 + 手写签名组件：pdf.js 渲染、smooth-signature 采集笔迹、pdf-lib 合成印章/签名/日期。
  父组件通过 pdf-src 传入 PDF 地址或 Blob URL；签名完成后 emit success(Blob)。
-->
<template>
  <div class="m-signature space-y-4">
    <!-- 预览区 -->
    <section
      class="pdf-viewer overflow-hidden rounded-lg border border-tech bg-[var(--tech-input-bg)]"
    >
      <div
        class="viewer-toolbar flex flex-wrap items-center justify-between gap-2 border-b border-tech bg-tech-header px-3 py-2"
      >
        <div class="flex items-center gap-2 text-sm text-tech-muted">
          <span
            class="rounded-md border border-tech bg-[var(--tech-input-bg)] px-2 py-0.5 tabular-nums"
          >
            {{ currentPage }} / {{ totalPageCount }}
          </span>
          <span v-if="loading" class="text-tech-subtle">加载中…</span>
        </div>
        <div class="join shrink-0">
          <button
            type="button"
            class="btn btn-sm join-item btn-outline"
            :disabled="minScale === scaleFactor || loading"
            @click="changeScale('-')"
          >
            缩小
          </button>
          <button
            type="button"
            class="btn btn-sm join-item btn-outline"
            :disabled="minScale * 4 === scaleFactor || loading"
            @click="changeScale('+')"
          >
            放大
          </button>
        </div>
      </div>

      <div ref="scrollContainer" class="scroll-container">
        <div
          class="pdf-wrap mx-auto"
          :style="{
            '--scale-factor': scaleFactor,
            '--page-count': totalPageCount,
          }"
        >
          <div
            v-if="loading"
            class="flex min-h-[320px] flex-col items-center justify-center gap-3 py-16"
          >
            <span class="loading loading-spinner loading-lg text-primary" />
            <p class="text-sm text-tech-muted">
              正在加载 PDF…
            </p>
          </div>

          <div
            v-else-if="loadError"
            class="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-16 text-center"
          >
            <xia-icon icon="blog-pdf1" width="40px" height="40px" class="opacity-40" />
            <p class="text-sm text-error">
              {{ loadError }}
            </p>
            <p class="max-w-sm text-xs text-tech-subtle">
              可尝试上传本地 PDF，或确认 blog-server 已启动且静态资源可访问。
            </p>
          </div>

          <div v-show="!loading && !loadError" ref="pdfContainer" class="pdf-container" />
        </div>
      </div>
    </section>

    <!-- 签名板 -->
    <section
      v-show="showSmoothSignatureWrap"
      class="signature-panel overflow-hidden rounded-lg border border-tech bg-tech-header"
    >
      <div class="flex flex-wrap items-center justify-center gap-2 border-b border-tech px-3 py-3">
        <button type="button" class="btn btn-sm btn-outline" @click="handleClear">
          清除
        </button>
        <button type="button" class="btn btn-sm btn-outline" @click="handleUndo">
          上一步
        </button>
        <button
          type="button"
          class="btn btn-sm btn-primary"
          :disabled="signing"
          @click="handleFinish"
        >
          {{ signing ? '处理中…' : '完成签名' }}
        </button>
        <button type="button" class="btn btn-sm btn-ghost" :disabled="signing" @click="handleClose">
          关闭
        </button>
      </div>
      <div class="flex justify-center p-4">
        <canvas ref="smoothSignatureCanvas" class="signature-canvas" />
      </div>
      <p class="pb-3 text-center text-xs text-tech-subtle">
        在虚线框内手写签名，完成后点击「完成签名」
      </p>
    </section>

    <!-- 阅读确认 / 开始签名 -->
    <section
      v-if="!showSmoothSignatureWrap"
      class="agree-bar flex flex-col items-center gap-3 rounded-lg border border-tech bg-tech-header px-4 py-5 sm:flex-row sm:justify-between"
    >
      <div v-if="localSecond" class="w-full space-y-2 sm:max-w-md">
        <div class="flex items-center justify-between text-sm text-tech-muted">
          <span>阅读确认</span>
          <span class="tabular-nums text-tech-subtle">{{ localSecond }}s</span>
        </div>
        <progress
          class="progress progress-primary h-2 w-full"
          :value="props.second - localSecond"
          :max="props.second"
        />
        <p class="text-xs text-tech-subtle">
          请完整阅读文档后再签名
        </p>
      </div>
      <template v-else>
        <p class="text-sm text-tech-muted">
          已完成阅读，可以开始手写签名
        </p>
        <CyberButton
          variant="primary"
          class="!py-2 !text-sm shrink-0"
          :disabled="!!loadError || loading"
          @click="showSmoothSignatureWrapHandle"
        >
          开始签名
        </CyberButton>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import dayjs from 'dayjs';
import sealLogo from '@/assets/images/logo/person/jiang.png';
import { loadPdfScripts } from '~/utils/script-loader';
import { messageDanger } from '@/utils/toast';

const emits = defineEmits<{ success: [blob: Blob] }>();
const props = defineProps({
  pdfSrc: {
    type: String,
    default: '',
  },
  second: {
    type: Number,
    default: 10,
  },
});

const smoothSignatureCanvas = ref<HTMLCanvasElement>();
const signature = ref<any>(null);
const signaturePng = ref('');
const showSmoothSignatureWrap = ref(false);
const localSecond = ref(props.second);
const loading = ref(true);
const loadError = ref('');
const signing = ref(false);

const scrollContainer = ref<HTMLElement>();
const pdfContainer = ref<HTMLElement>();
const totalPageCount = ref(1);
const currentPage = ref(1);
const pageHeight = ref(0);
const scaleFactor = ref(1);
const minScale = ref(1);

/** 缓存原始/已签名 PDF 字节，避免 editPdf 重复 fetch 及二次签名覆盖 */
const pdfSourceBuffer = ref<ArrayBuffer | null>(null);

let countdownTimer: ReturnType<typeof setInterval> | null = null;
let scrollHandler: (() => void) | null = null;

/** 将远程 URL / Blob URL 拉取为 ArrayBuffer */
const fetchPdfBuffer = async (src: string): Promise<ArrayBuffer> => {
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error(`PDF 加载失败（HTTP ${res.status}）`);
  }
  return res.arrayBuffer();
};

/** 归一化 reloadPdf 入参，统一走 pdf.js getDocument({ data }) */
const normalizePdfInput = async (
  pdfData: string | ArrayBuffer | Uint8Array,
): Promise<Uint8Array> => {
  if (typeof pdfData === 'string') {
    const buffer = await fetchPdfBuffer(pdfData);
    pdfSourceBuffer.value = buffer;
    return new Uint8Array(buffer);
  }
  if (pdfData instanceof ArrayBuffer) {
    pdfSourceBuffer.value = pdfData;
    return new Uint8Array(pdfData);
  }
  pdfSourceBuffer.value = pdfData.buffer.slice(
    pdfData.byteOffset,
    pdfData.byteOffset + pdfData.byteLength,
  );
  return pdfData;
};

/** 渲染 PDF 各页到 canvas */
const reloadPdf = async (pdfData: string | ArrayBuffer | Uint8Array = props.pdfSrc) => {
  if (!pdfData) {
    loadError.value = '未指定 PDF 文件';
    loading.value = false;
    return;
  }

  loading.value = true;
  loadError.value = '';

  try {
    const data = await normalizePdfInput(pdfData);
    const pdfDocument = await pdfjsLib.getDocument({ data }).promise;

    if (!pdfContainer.value) {
      return;
    }

    pdfContainer.value.innerHTML = '';
    totalPageCount.value = pdfDocument.numPages;
    currentPage.value = 1;

    for (let pageIndex = 1; pageIndex <= pdfDocument.numPages; pageIndex++) {
      const page = await pdfDocument.getPage(pageIndex);
      const viewport = page.getViewport({ scale: 2 });
      pageHeight.value = viewport.height / 2;

      const canvas = document.createElement('canvas');
      pdfContainer.value.appendChild(canvas);
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas 2D 上下文不可用');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
    }
  }
  catch (err) {
    console.error('[xia-signature] PDF 渲染失败:', err);
    const message = err instanceof Error ? err.message : 'PDF 加载失败';
    loadError.value = message.includes('fetch')
      ? 'PDF 加载失败，请检查网络或改用本地上传'
      : message;
    messageDanger(loadError.value);
  }
  finally {
    loading.value = false;
  }
};

/** 缩放 PDF 预览区域 */
const changeScale = (direction: '+' | '-') => {
  let num = scaleFactor.value;
  if (direction === '-') {
    num = num - num * 0.1;
    if (num <= 1) {
      num = minScale.value;
    }
  }
  else {
    num = num + num * 0.1;
    if (num >= minScale.value * 4) {
      num = minScale.value * 4;
    }
  }
  scaleFactor.value = num;
};

const handleClear = () => {
  signature.value?.clear();
};

const handleUndo = () => {
  signature.value?.undo();
};

/** 将手写签名与印章写入 PDF 最后一页 */
const editPdf = async () => {
  if (!pdfSourceBuffer.value) {
    messageDanger('PDF 尚未加载完成');
    return;
  }

  signing.value = true;
  try {
    const PDFDocument = PDFLib.PDFDocument;
    const pdfDoc = await PDFDocument.load(pdfSourceBuffer.value.slice(0));
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const width = lastPage.getWidth();
    const height = lastPage.getHeight();
    const x = width - 260;
    const y = height / 2 - 100;

    const emblemImageBytes = await fetch(signaturePng.value).then(res => res.arrayBuffer());
    const img = await pdfDoc.embedPng(emblemImageBytes);

    const sealImageBytes = await fetch(sealLogo).then(res => res.arrayBuffer());
    const sealImg = await pdfDoc.embedPng(sealImageBytes);
    lastPage.drawImage(sealImg, {
      x,
      y: y - 40,
      width: 140,
      height: 140,
      opacity: 1,
    });

    lastPage.drawImage(img, {
      x,
      y,
      width: 160,
      height: 60,
    });

    const dateText = dayjs().format('YYYY MM DD');
    lastPage.drawText(dateText, {
      x: x + 20,
      y: y - 20,
      size: 18,
    });

    const pdfBytes = await pdfDoc.save();
    pdfSourceBuffer.value = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength,
    );
    await reloadPdf(new Uint8Array(pdfBytes));
    emits('success', new Blob([pdfBytes], { type: 'application/pdf' }));
  }
  catch (err) {
    console.error('[xia-signature] 签名合成失败:', err);
    messageDanger('签名写入 PDF 失败，请重试');
  }
  finally {
    signing.value = false;
  }
};

const handleFinish = async () => {
  if (!signature.value || signature.value.isEmpty()) {
    messageDanger('请先完成手写签名');
    return;
  }
  signaturePng.value = signature.value.toDataURL();
  showSmoothSignatureWrap.value = false;
  await editPdf();
};

const handleClose = () => {
  handleClear();
  showSmoothSignatureWrap.value = false;
};

const showSmoothSignatureWrapHandle = () => {
  handleClear();
  showSmoothSignatureWrap.value = true;
};

/** 初始化签名板尺寸与滚动分页指示 */
const initSignaturePad = () => {
  if (!scrollContainer.value || !smoothSignatureCanvas.value) {
    return;
  }

  const { width, height } = scrollContainer.value.getBoundingClientRect();
  minScale.value = width / 612;
  scaleFactor.value = width / 612;

  const options = {
    width: Math.min(width - 24, 480),
    height: Math.max(160, Math.min(height / 3, 220)),
    minWidth: 3,
    maxWidth: 10,
    color: '#333333',
    bgColor: 'transparent',
  };
  signature.value = new SmoothSignature(smoothSignatureCanvas.value, options);

  scrollHandler = (e: Event) => {
    const target = e.target as HTMLElement;
    const scrollTop = target.scrollTop;
    if (!pageHeight.value) {
      return;
    }
    currentPage.value = Math.ceil(
      ((scrollTop + 100) * window.devicePixelRatio) / pageHeight.value,
    );
    if (currentPage.value > totalPageCount.value) {
      currentPage.value = totalPageCount.value;
    }
    if (currentPage.value < 1) {
      currentPage.value = 1;
    }
  };
  scrollContainer.value.addEventListener('scroll', scrollHandler);
};

onMounted(async () => {
  try {
    await loadPdfScripts();
  }
  catch (err) {
    console.error('[xia-signature] 脚本加载失败:', err);
    loadError.value = 'PDF 组件加载失败，请刷新页面重试';
    loading.value = false;
    return;
  }

  countdownTimer = setInterval(() => {
    if (localSecond.value > 0) {
      localSecond.value--;
    }
    else if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);

  initSignaturePad();
  await reloadPdf();
});

watch(
  () => props.pdfSrc,
  async (src) => {
    if (src) {
      localSecond.value = props.second;
      showSmoothSignatureWrap.value = false;
      await reloadPdf(src);
    }
  },
);

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  if (scrollContainer.value && scrollHandler) {
    scrollContainer.value.removeEventListener('scroll', scrollHandler);
  }
});
</script>

<style lang="less" scoped>
  .m-signature {
    .scroll-container {
      overflow: auto;
      max-height: min(65vh, 640px);
      padding: 1rem;
    }

    .pdf-wrap {
      width: calc(var(--scale-factor) * 612px);
      min-height: calc(var(--scale-factor) * 792px * var(--page-count, 1));
      transition:
        width 0.25s ease,
        min-height 0.25s ease;
    }

    .pdf-container {
      :deep(canvas) {
        width: 100%;
        display: block;
        border-radius: 4px;
        box-shadow: 0 1px 4px rgb(0 0 0 / 8%);
      }

      :deep(canvas + canvas) {
        margin-top: 0.75rem;
      }
    }

    .signature-canvas {
      display: block;
      max-width: 100%;
      border-radius: 0.75rem;
      border: 2px dashed var(--tech-border);
      background: var(--tech-input-bg);
    }
  }
</style>
