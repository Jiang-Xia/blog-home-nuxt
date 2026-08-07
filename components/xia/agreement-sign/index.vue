<!--
  H5 协议阅读 + 手写签署组件（移动端场景）。
  流程：加载 PDF → 滚到文档底部 + 倒计时结束 →「我已完成阅读」→ 签字板（竖屏弹层 / 全屏横签）→ 合成 PDF。
  横签布局对齐 smooth-signature 官方 mbDemo：canvas 不旋转，导出 getRotateCanvas(-90)。
  父组件传 pdf-src；签署完成 emit success(Blob)。纯前端合成，无独立 API。
-->
<template>
  <div class="agreement-sign flex h-full min-h-0 flex-col bg-[#f5f6f8] text-[#1a1a1a]">
    <!-- 顶栏 -->
    <header class="flex shrink-0 items-center gap-2 border-b border-[#e8e8e8] bg-white px-3 py-3">
      <button
        v-if="showBack"
        type="button"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full active:bg-black/5"
        aria-label="返回"
        @click="emits('back')"
      >
        <span class="text-xl leading-none">‹</span>
      </button>
      <div class="min-w-0 flex-1">
        <h1 class="truncate text-base font-semibold">
          {{ title }}
        </h1>
        <p class="truncate text-xs text-[#8c8c8c]">
          {{ subtitle }}
        </p>
      </div>
      <span
        class="shrink-0 rounded-full bg-[#f0f0f0] px-2 py-0.5 text-xs tabular-nums text-[#595959]"
      >
        {{ currentPage }}/{{ totalPageCount }}
      </span>
    </header>

    <!-- PDF 阅读区 -->
    <div
      ref="scrollContainer"
      class="scroll-area min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3"
      @scroll="onScroll"
    >
      <div v-if="loading" class="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <span class="loading loading-spinner loading-md text-primary" />
        <p class="text-sm text-[#8c8c8c]">
          正在加载协议…
        </p>
      </div>

      <div
        v-else-if="loadError"
        class="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-4 text-center"
      >
        <p class="text-sm text-error">
          {{ loadError }}
        </p>
        <p class="text-xs text-[#8c8c8c]">
          请检查 PDF 地址或网络后重试
        </p>
      </div>

      <div
        v-show="!loading && !loadError"
        ref="pdfContainer"
        class="pdf-container mx-auto w-full max-w-[720px]"
      />

      <p
        v-if="!loading && !loadError && !scrolledToEnd"
        class="py-4 text-center text-xs text-[#8c8c8c]"
      >
        请继续下滑阅读至文档底部
      </p>
      <p
        v-else-if="!loading && !loadError && scrolledToEnd"
        class="py-4 text-center text-xs text-success"
      >
        已阅读至底部
      </p>
    </div>

    <!-- 底部操作栏 -->
    <footer class="safe-bottom shrink-0 border-t border-[#e8e8e8] bg-white px-4 pb-3 pt-3">
      <div v-if="remainSecond > 0" class="mb-3 space-y-1.5">
        <div class="flex items-center justify-between text-xs text-[#8c8c8c]">
          <span>请认真阅读协议</span>
          <span class="tabular-nums">{{ remainSecond }}s</span>
        </div>
        <div class="h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
          <div
            class="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
            :style="{ width: `${countdownProgress}%` }"
          />
        </div>
      </div>

      <button
        type="button"
        class="btn btn-primary btn-block h-11 text-base font-medium"
        :disabled="!canConfirmRead || signing"
        @click="openSignatureSheet"
      >
        {{ confirmButtonText }}
      </button>
    </footer>

    <!--
      签字板：对齐 smooth-signature 官方 mbDemo
      - 竖屏：底部弹层，canvas 不旋转
      - 横屏/全屏：整屏 flex，仅侧边按钮 rotate(90deg)，canvas 不旋转（触点正常）；
        导出时 getRotateCanvas(-90) 把笔迹转正
    -->
    <Teleport to="body">
      <div
        v-if="showSignatureSheet"
        class="signature-mask"
        :class="useLandscapePad ? 'mode-landscape' : 'mode-portrait'"
        @click.self="onMaskClick"
      >
        <div
          class="signature-sheet"
          :class="useLandscapePad ? 'mode-landscape' : 'mode-portrait'"
          role="dialog"
          aria-modal="true"
          aria-label="手写签名"
        >
          <!-- 竖屏：顶栏 + 提示 -->
          <template v-if="!useLandscapePad">
            <div class="sheet-toolbar">
              <p class="sheet-title">
                竖屏签名
              </p>
              <div class="sheet-toolbar-actions">
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  :disabled="signing"
                  @click="toggleOrientation"
                >
                  全屏横签
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm"
                  :disabled="signing"
                  @click="closeSignatureSheet()"
                >
                  关闭
                </button>
              </div>
            </div>
            <p class="sheet-tip">
              竖屏书写；需要更大区域可点「全屏横签」
            </p>
          </template>

          <div class="sheet-body">
            <!-- 横屏：侧边操作区（按钮自身旋转，canvas 不转） -->
            <div v-if="useLandscapePad" class="landscape-actions-wrap">
              <div class="landscape-actions">
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  :disabled="signing"
                  @click="handleClear"
                >
                  清除
                </button>
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  :disabled="signing"
                  @click="handleUndo"
                >
                  上一步
                </button>
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  :disabled="signing"
                  @click="toggleOrientation"
                >
                  竖屏
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm"
                  :disabled="signing"
                  @click="closeSignatureSheet()"
                >
                  关闭
                </button>
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  :disabled="signing"
                  @click="handleFinish"
                >
                  {{ signing ? '合成中…' : '确认签署' }}
                </button>
              </div>
            </div>

            <div ref="signatureCanvasWrap" class="sheet-canvas-wrap">
              <canvas :key="padKey" ref="signatureCanvas" class="signature-canvas" />
            </div>
          </div>

          <!-- 竖屏：底部操作 -->
          <div v-if="!useLandscapePad" class="sheet-actions">
            <button
              type="button"
              class="btn btn-outline flex-1"
              :disabled="signing"
              @click="handleClear"
            >
              清除
            </button>
            <button
              type="button"
              class="btn btn-outline flex-1"
              :disabled="signing"
              @click="handleUndo"
            >
              上一步
            </button>
            <button
              type="button"
              class="btn btn-primary flex-[1.4]"
              :disabled="signing"
              @click="handleFinish"
            >
              {{ signing ? '合成中…' : '确认签署' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import dayjs from 'dayjs';
import sealLogo from '@/assets/images/logo/person/jiang.png';
import { loadPdfScripts } from '~/utils/script-loader';
import { cloneArrayBuffer, fetchPdfBuffer } from '~/utils/pdf-buffer';
import { messageDanger } from '@/utils/toast';

const props = withDefaults(
  defineProps<{
    /** PDF 地址或 Blob URL */
    pdfSrc: string;
    /** 顶栏标题 */
    title?: string;
    /** 顶栏副标题 */
    subtitle?: string;
    /** 最短阅读倒计时（秒） */
    second?: number;
    /** 是否显示返回按钮 */
    showBack?: boolean;
    /** 是否必须滚到文档底部才能点「我已完成阅读」 */
    requireScrollToEnd?: boolean;
    /**
       * 打开签字板时的默认方向：'landscape' | 'portrait' | 'auto'
       * auto = 窄屏竖持默认横屏，宽屏默认竖屏；用户仍可在弹层内随时切换。
       */
    defaultOrientation?: 'landscape' | 'portrait' | 'auto';
  }>(),
  {
    title: '协议签署',
    subtitle: '请仔细阅读全文后再签名',
    second: 10,
    showBack: false,
    requireScrollToEnd: true,
    defaultOrientation: 'portrait',
  },
);

const emits = defineEmits<{
  success: [blob: Blob];
  back: [];
}>();

const scrollContainer = ref<HTMLElement>();
const pdfContainer = ref<HTMLElement>();
const signatureCanvas = ref<HTMLCanvasElement>();
const signatureCanvasWrap = ref<HTMLElement>();
/** 切换横竖屏时递增，强制重建 canvas DOM */
const padKey = ref(0);

const loading = ref(true);
const loadError = ref('');
const signing = ref(false);
const scrolledToEnd = ref(false);
const showSignatureSheet = ref(false);
const remainSecond = ref(props.second);
const currentPage = ref(1);
const totalPageCount = ref(1);
const pageHeight = ref(0);
/** 当前是否横屏签署布局（用户可切换） */
const useLandscapePad = ref(false);

/** 缓存原始/已签 PDF 字节，与传给 pdf.js 的副本分离 */
const pdfSourceBuffer = ref<ArrayBuffer | null>(null);

const signature = ref<{
  clear: () => void;
  undo: () => void;
  isEmpty: () => boolean;
  toDataURL: (type?: string) => string;
  getRotateCanvas?: (angle: number) => HTMLCanvasElement;
} | null>(null);
let countdownTimer: ReturnType<typeof setInterval> | null = null;
let prevBodyOverflow = '';

/** 按 prop / 视口决定打开时的默认横竖屏 */
const resolveDefaultLandscape = (): boolean => {
  if (props.defaultOrientation === 'landscape') {
    return true;
  }
  if (props.defaultOrientation === 'portrait') {
    return false;
  }
  if (typeof window === 'undefined') {
    return false;
  }
  const w = window.innerWidth;
  const h = window.innerHeight;
  // auto：窄屏竖持默认横屏，便于手写；宽屏默认竖屏弹层
  return w < 768 && w < h;
};

/** 倒计时进度 0–100 */
const countdownProgress = computed(() => {
  if (props.second <= 0) {
    return 100;
  }
  return Math.round(((props.second - remainSecond.value) / props.second) * 100);
});

/** 是否可点击「我已完成阅读」 */
const canConfirmRead = computed(() => {
  if (loading.value || loadError.value || signing.value) {
    return false;
  }
  if (remainSecond.value > 0) {
    return false;
  }
  if (props.requireScrollToEnd && !scrolledToEnd.value) {
    return false;
  }
  return true;
});

/** 底部主按钮文案 */
const confirmButtonText = computed(() => {
  if (signing.value) {
    return '处理中…';
  }
  if (remainSecond.value > 0) {
    return `请阅读协议（${remainSecond.value}s）`;
  }
  if (props.requireScrollToEnd && !scrolledToEnd.value) {
    return '请先阅读至文档底部';
  }
  return '我已完成阅读';
});

/** 检测是否滚到文档底部；短文档无需滚动则直接视为完成 */
const checkScrolledToEnd = () => {
  const el = scrollContainer.value;
  if (!el) {
    return;
  }
  const threshold = 32;
  if (el.scrollHeight <= el.clientHeight + threshold) {
    scrolledToEnd.value = true;
    return;
  }
  scrolledToEnd.value = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
};

/** 滚动时更新页码与底部到达状态 */
const onScroll = () => {
  const el = scrollContainer.value;
  if (!el) {
    return;
  }
  checkScrolledToEnd();
  if (!pageHeight.value) {
    return;
  }
  const next = Math.ceil((el.scrollTop + 80) / pageHeight.value) || 1;
  currentPage.value = Math.min(Math.max(next, 1), totalPageCount.value);
};

/** 归一化入参并缓存独立 buffer，再拷贝一份给 pdf.js */
const normalizePdfInput = async (
  pdfData: string | ArrayBuffer | Uint8Array,
): Promise<Uint8Array> => {
  let source: ArrayBuffer;
  if (typeof pdfData === 'string') {
    source = await fetchPdfBuffer(pdfData);
  }
  else if (pdfData instanceof ArrayBuffer) {
    source = pdfData;
  }
  else {
    source = cloneArrayBuffer(pdfData);
  }
  pdfSourceBuffer.value = cloneArrayBuffer(source);
  return new Uint8Array(cloneArrayBuffer(source));
};

/** 按容器宽度渲染 PDF 各页到 canvas */
const reloadPdf = async (pdfData: string | ArrayBuffer | Uint8Array = props.pdfSrc) => {
  if (!pdfData) {
    loadError.value = '未指定 PDF 文件';
    loading.value = false;
    return;
  }

  loading.value = true;
  loadError.value = '';
  scrolledToEnd.value = false;

  try {
    const data = await normalizePdfInput(pdfData);
    const pdfDocument = await pdfjsLib.getDocument({ data }).promise;

    if (!pdfContainer.value) {
      return;
    }

    pdfContainer.value.innerHTML = '';
    totalPageCount.value = pdfDocument.numPages;
    currentPage.value = 1;

    const containerWidth = scrollContainer.value?.clientWidth || window.innerWidth;
    // 预留左右 padding，按设备宽适配一页宽度
    const targetWidth = Math.max(containerWidth - 24, 280);

    for (let pageIndex = 1; pageIndex <= pdfDocument.numPages; pageIndex++) {
      const page = await pdfDocument.getPage(pageIndex);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = (targetWidth / baseViewport.width) * 2;
      const viewport = page.getViewport({ scale });
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

    await nextTick();
    checkScrolledToEnd();
  }
  catch (err) {
    console.error('[xia-agreement-sign] PDF 渲染失败:', err);
    const message = err instanceof Error ? err.message : 'PDF 加载失败';
    loadError.value = message.includes('fetch') ? 'PDF 加载失败，请检查网络' : message;
    messageDanger(loadError.value);
  }
  finally {
    loading.value = false;
  }
};

/** 启动阅读倒计时 */
const startCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  remainSecond.value = props.second;
  if (props.second <= 0) {
    return;
  }
  countdownTimer = setInterval(() => {
    if (remainSecond.value > 0) {
      remainSecond.value -= 1;
    }
    else if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
};

/** 等两帧，确保横竖屏 CSS 布局完成后再量尺寸 / 挂载签字板 */
const waitLayout = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

/** 初始化 / 重建签字板（canvas 本身不 CSS 旋转，触点与官方 demo 一致） */
const initSignaturePad = () => {
  if (!signatureCanvas.value) {
    return;
  }

  let width: number;
  let height: number;

  if (useLandscapePad.value) {
    // 全屏横签：与官方 mbDemo wrap2 一致，用视口减侧栏
    width = Math.max(200, window.innerWidth - 100);
    height = Math.max(200, window.innerHeight - 50);
  }
  else {
    const wrap = signatureCanvasWrap.value;
    if (wrap && wrap.clientWidth > 0) {
      width = Math.max(200, Math.floor(wrap.clientWidth - 8));
      height = Math.max(160, Math.min(220, Math.floor(wrap.clientHeight || 200)));
    }
    else {
      width = Math.min(window.innerWidth - 32, 400);
      height = 200;
    }
  }

  signature.value = new SmoothSignature(signatureCanvas.value, {
    width,
    height,
    minWidth: 2,
    maxWidth: 8,
    color: '#1a1a1a',
    bgColor: '#fafafa',
  });
};

/** 销毁旧实例并 remount canvas 后重新初始化 */
const remountSignaturePad = async () => {
  signature.value = null;
  padKey.value += 1;
  await nextTick();
  await waitLayout();
  initSignaturePad();
};

/** 打开签字板弹层 */
const openSignatureSheet = async () => {
  if (!canConfirmRead.value) {
    return;
  }
  useLandscapePad.value = resolveDefaultLandscape();
  showSignatureSheet.value = true;
  prevBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  await nextTick();
  await remountSignaturePad();
};

/** 横/竖屏切换：重新渲染签字板 */
const toggleOrientation = async () => {
  if (signing.value) {
    return;
  }
  useLandscapePad.value = !useLandscapePad.value;
  await remountSignaturePad();
};

/** 关闭签字板；force 用于合成成功后忽略 signing 拦截 */
const closeSignatureSheet = (force = false) => {
  if (signing.value && !force) {
    return;
  }
  signature.value?.clear();
  signature.value = null;
  showSignatureSheet.value = false;
  document.body.style.overflow = prevBodyOverflow;
};

/** 点击遮罩关闭（避免把 PointerEvent 当成 force） */
const onMaskClick = () => {
  closeSignatureSheet();
};

const handleClear = () => {
  signature.value?.clear();
};

const handleUndo = () => {
  signature.value?.undo();
};

/** 将手写签名与印章写入 PDF 最后一页并回传 Blob */
const editPdf = async (signaturePng: string) => {
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

    const emblemImageBytes = await fetch(signaturePng).then(res => res.arrayBuffer());
    const img = await pdfDoc.embedPng(emblemImageBytes);

    const sealImageBytes = await fetch(sealLogo).then(res => res.arrayBuffer());
    const sealImg = await pdfDoc.embedPng(sealImageBytes);

    // 先签后章：签名在下层，印章盖在上面
    lastPage.drawImage(img, {
      x,
      y,
      width: 160,
      height: 60,
    });

    lastPage.drawImage(sealImg, {
      x,
      y: y - 40,
      width: 140,
      height: 140,
      opacity: 1,
    });

    lastPage.drawText(dayjs().format('YYYY MM DD'), {
      x: x + 20,
      y: y - 20,
      size: 18,
    });

    const pdfBytes = await pdfDoc.save();
    pdfSourceBuffer.value = cloneArrayBuffer(pdfBytes);
    await reloadPdf(new Uint8Array(cloneArrayBuffer(pdfBytes)));
    closeSignatureSheet(true);
    emits('success', new Blob([pdfBytes], { type: 'application/pdf' }));
  }
  catch (err) {
    console.error('[xia-agreement-sign] 签名合成失败:', err);
    messageDanger('签名写入 PDF 失败，请重试');
  }
  finally {
    signing.value = false;
  }
};

/** 确认签署：校验笔迹后合成；横签用 getRotateCanvas(-90) 转正（同官方 demo） */
const handleFinish = async () => {
  if (!signature.value || signature.value.isEmpty()) {
    messageDanger('请先完成手写签名');
    return;
  }

  let png: string;
  if (useLandscapePad.value && typeof signature.value.getRotateCanvas === 'function') {
    png = signature.value.getRotateCanvas(-90).toDataURL('image/png');
  }
  else {
    png = signature.value.toDataURL();
  }
  await editPdf(png);
};

watch(
  () => props.pdfSrc,
  async (src) => {
    if (!src) {
      return;
    }
    startCountdown();
    showSignatureSheet.value = false;
    await reloadPdf(src);
  },
);

onMounted(async () => {
  try {
    await loadPdfScripts();
  }
  catch (err) {
    console.error('[xia-agreement-sign] 脚本加载失败:', err);
    loadError.value = '签署组件加载失败，请刷新重试';
    loading.value = false;
    return;
  }
  startCountdown();
  await reloadPdf();
});

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  if (showSignatureSheet.value) {
    document.body.style.overflow = prevBodyOverflow;
  }
});
</script>

<style lang="less" scoped>
  .agreement-sign {
    height: 100%;
  }

  .scroll-area {
    -webkit-overflow-scrolling: touch;
  }

  .pdf-container {
    :deep(canvas) {
      display: block;
      width: 100%;
      height: auto;
      margin-bottom: 0.75rem;
      border-radius: 4px;
      background: #fff;
      box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
    }
  }

  .signature-mask {
    position: fixed;
    inset: 0;
    z-index: 10050;
    background: rgb(0 0 0 / 45%);

    &.mode-portrait {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    &.mode-landscape {
      background: #fff;
    }
  }

  .signature-sheet {
    background: #fff;

    &.mode-portrait {
      display: flex;
      max-height: 85vh;
      flex-direction: column;
      border-radius: 16px 16px 0 0;
      padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
    }

    /* 全屏横签：不旋转整板，与官方 mbDemo.wrap2 一致 */
    &.mode-landscape {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      padding: 12px;
    }
  }

  .sheet-toolbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border-bottom: 1px solid #f0f0f0;
    padding: 12px 16px;
  }

  .sheet-toolbar-actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
  }

  .sheet-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .sheet-tip {
    margin: 0;
    padding: 8px 16px 0;
    font-size: 12px;
    color: #8c8c8c;
    text-align: center;
  }

  .sheet-body {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .mode-portrait .sheet-body {
    padding: 16px;
  }

  .mode-landscape .sheet-body {
    height: 100%;
    align-items: stretch;
  }

  /* 侧栏按钮区：仅操作条 rotate，canvas 保持不转 */
  .landscape-actions-wrap {
    display: flex;
    width: 50px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }

  .landscape-actions {
    display: flex;
    white-space: nowrap;
    transform: rotate(90deg);
    gap: 8px;
  }

  .sheet-canvas-wrap {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  .sheet-actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    padding: 0 16px 16px;
  }

  .signature-canvas {
    display: block;
    border-radius: 12px;
    border: 1.5px dashed #bfbfbf;
    background: #fafafa;
    touch-action: none;
  }
</style>
