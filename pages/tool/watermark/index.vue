<!--
  批量图片水印：本地选图后在 Canvas 绘制文字水印，支持预览、大图查看与 ZIP 打包下载。
  预览：主线程降采样（最长边 1280）+ 原生 JPEG，不走 WASM。
  单张下载：主线程导出（保住点击手势，避免 Worker 往返后 a.download 被静默拦截）。
  批量 ZIP：手势内 showSaveFilePicker 后可用 Worker；无该 API 时回退主线程。
  绘制逻辑见 utils/watermark-draw；导出客户端见 utils/watermark-export-client。
-->
<template>
  <div class="mx-auto w-full max-w-3xl space-y-4">
    <CyberToolCard title="批量加水印" desc="选择多张图片，添加自定义文字与时间水印，预览后打包下载">
      <div class="grid gap-2 pb-2 sm:grid-cols-2">
        <label class="form-control w-full">
          <span class="label py-1 text-xs text-tech-muted">自定义水印文字</span>
          <input
            v-model="customMark"
            class="input input-bordered login-input w-full"
            placeholder="我的水印"
          >
        </label>

        <label class="form-control w-full">
          <span class="label py-1 text-xs text-tech-muted">时间水印</span>
          <select v-model="timeMark" class="select select-bordered login-input w-full">
            <option value="no"> 无时间水印 </option>
            <option value="yes"> 有时间水印 </option>
          </select>
        </label>
      </div>

      <div class="grid gap-2 pb-2 sm:grid-cols-2">
        <label class="form-control w-full">
          <span class="label py-1 text-xs text-tech-muted">水印位置</span>
          <select v-model="watermarkPosition" class="select select-bordered login-input w-full">
            <option value="bottom"> 底部居中 </option>
            <option value="top"> 顶部居中 </option>
            <option value="center"> 正中央 </option>
            <option value="bottom-left"> 左下角 </option>
            <option value="bottom-right"> 右下角 </option>
            <option value="tile"> 平铺斜纹 </option>
          </select>
        </label>

        <label class="form-control w-full">
          <span class="label py-1 text-xs text-tech-muted">字体</span>
          <select
            v-model="watermarkFont"
            class="select select-bordered login-input w-full"
            :style="{ fontFamily: selectedFontFamily }"
          >
            <option
              v-for="opt in WATERMARK_FONT_OPTIONS"
              :key="opt.value"
              :value="opt.value"
              :style="{ fontFamily: opt.family }"
            >
              {{ opt.label }}
            </option>
          </select>
        </label>
      </div>

      <div class="grid gap-2 pb-2 sm:grid-cols-2">
        <label class="form-control w-full">
          <span class="label py-1 text-xs text-tech-muted">字号</span>
          <div class="join w-full">
            <select
              v-model="fontSizeMode"
              class="select select-bordered login-input join-item w-auto min-w-[7rem]"
            >
              <option value="auto"> 自适应 </option>
              <option value="manual"> 固定 </option>
            </select>
            <input
              v-model.number="customFontSize"
              type="number"
              min="12"
              max="120"
              class="input input-bordered login-input join-item min-w-0 flex-1"
              :disabled="fontSizeMode === 'auto'"
              placeholder="px"
            >
          </div>
        </label>
      </div>

      <div class="grid gap-2 pb-2 sm:grid-cols-2">
        <label class="form-control w-full">
          <span class="label py-1 text-xs text-tech-muted">文字颜色</span>
          <div class="flex w-full overflow-hidden rounded-lg border border-tech">
            <select
              v-model="watermarkColorMode"
              class="select select-bordered login-input h-12 min-h-12 w-auto min-w-[7rem] shrink-0 rounded-none border-0 border-r border-tech"
            >
              <option value="white"> 白色 </option>
              <option value="black"> 黑色 </option>
              <option value="custom"> 自定义 </option>
            </select>
            <input
              :value="displayWatermarkColor"
              type="color"
              class="h-12 min-h-12 min-w-0 flex-1 cursor-pointer border-0 bg-[var(--tech-input-bg)] p-1"
              :class="
                watermarkColorMode === 'custom'
                  ? 'cursor-pointer'
                  : 'cursor-default pointer-events-none'
              "
              @input="onWatermarkColorInput"
            >
          </div>
        </label>

        <label class="form-control w-full">
          <div class="label py-1">
            <span class="text-xs text-tech-muted">透明度</span>
            <span class="text-xs text-tech-subtle">{{ watermarkOpacity }}%</span>
          </div>
          <input
            v-model.number="watermarkOpacity"
            type="range"
            min="20"
            max="100"
            step="5"
            class="range range-primary range-xs mt-3"
          >
        </label>
      </div>

      <label class="form-control w-full pb-2">
        <div class="label py-1">
          <span class="text-xs text-tech-muted">旋转角度</span>
          <span class="text-xs text-tech-subtle">{{ watermarkRotation }}°</span>
        </div>
        <input
          v-model.number="watermarkRotation"
          type="range"
          min="-45"
          max="45"
          step="5"
          class="range range-primary range-xs"
        >
        <span class="label py-0 text-xs text-tech-muted"> 平铺模式未设置时默认 -30° </span>
      </label>

      <label class="mb-2 flex cursor-pointer items-center gap-2 text-sm text-tech-muted">
        <input v-model="appendMode" type="checkbox" class="checkbox checkbox-primary checkbox-sm">
        追加选图（不清空已有图片，最多 {{ MAX_PHOTOS }} 张）
      </label>

      <div
        class="relative rounded-lg border border-dashed border-tech transition"
        :class="{ 'border-primary bg-primary/5': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <input
          ref="fileInputRef"
          multiple
          type="file"
          class="file-input file-input-bordered login-input w-full"
          accept="image/*"
          @change="handleFileUpload"
        >
        <p
          v-if="isDragging"
          class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-primary/10 text-sm text-primary"
        >
          松开鼠标即可导入图片
        </p>
      </div>

      <p v-if="processing" class="mt-2 text-sm text-tech-muted">
        正在处理 {{ processedCount }}/{{ pendingCount }} 张…
      </p>
    </CyberToolCard>

    <CyberToolCard title="预览与下载">
      <div class="mb-4 grid gap-2 sm:grid-cols-2">
        <label class="form-control w-full">
          <span class="label py-1 text-xs text-tech-muted">导出格式</span>
          <select v-model="exportFormat" class="select select-bordered login-input w-full">
            <option value="png"> PNG（无损） </option>
            <option value="jpeg"> JPEG（体积更小） </option>
          </select>
        </label>

        <label class="form-control w-full">
          <div class="label py-1">
            <span class="text-xs text-tech-muted">JPEG 质量</span>
            <span class="text-xs text-tech-subtle">{{ jpegQuality }}%</span>
          </div>
          <input
            v-model.number="jpegQuality"
            type="range"
            min="60"
            max="100"
            step="5"
            class="range range-primary range-xs mt-3"
            :disabled="exportFormat !== 'jpeg'"
          >
        </label>
      </div>

      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span class="text-sm text-tech-subtle">
          {{ items.length ? `已选 ${items.length} / ${MAX_PHOTOS} 张` : '瀑布流展示已选照片' }}
        </span>
        <div class="flex flex-wrap gap-2">
          <CyberButton
            v-if="items.length"
            variant="secondary"
            class="!py-2 !text-sm"
            :disabled="processing"
            @click="clearAll"
          >
            清空
          </CyberButton>
          <CyberButton
            variant="secondary"
            class="!py-2 !text-sm"
            :disabled="!items.length || processing || loading"
            @click="downloadAllImages"
          >
            {{ loading ? '打包中…' : '下载所有图片' }}
          </CyberButton>
        </div>
      </div>

      <p v-if="!items.length && !processing" class="py-8 text-center text-sm text-tech-muted">
        请先选择或拖入图片，修改水印样式后会自动更新预览
      </p>

      <div v-else class="container mx-auto columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg border border-tech bg-[var(--tech-input-bg)] transition hover:border-primary/50"
        >
          <button type="button" class="block w-full cursor-zoom-in p-0" @click="openViewer(index)">
            <img :src="item.previewSrc" :alt="item.name" class="h-auto w-full" loading="lazy">
          </button>

          <div
            class="absolute right-2 top-2 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
          >
            <button
              type="button"
              class="btn btn-primary btn-xs"
              title="下载此图"
              :disabled="downloadingId === item.id"
              @click.stop="downloadSingle(item)"
            >
              {{ downloadingId === item.id ? '…' : '下载' }}
            </button>
            <button
              type="button"
              class="btn btn-warning btn-xs"
              title="移除此图"
              @click.stop="removeItem(index)"
            >
              移除
            </button>
          </div>

          <p class="truncate px-2 py-1 text-xs text-tech-muted">
            {{ item.name }}
          </p>
        </div>
      </div>
    </CyberToolCard>
  </div>
</template>

<script setup lang="ts">
import { messageDanger, messageSuccess } from '@/utils/toast';
import { debounce } from '@/utils/index';
import { blobToUint8Array, zipFilesToBlob } from '@/utils/zip-files';
import {
  WATERMARK_FONT_OPTIONS,
  buildWatermarkText,
  drawWatermarkLayer,
  ensureWatermarkFont,
  getExportExtension,
  resolveFontSize,
  type ExportFormat,
  type ExportOptions,
  type FontSizeMode,
  type WatermarkColorMode,
  type WatermarkFontKey,
  type WatermarkPosition,
  type WatermarkStyle,
} from '@/utils/watermark-draw';
import {
  canUseWatermarkExportWorker,
  exportWatermarkInWorker,
  initWatermarkExportWorker,
  terminateWatermarkExportWorker,
} from '@/utils/watermark-export-client';
import { isSaveAbortError, pickSaveFileHandle, saveBlob } from '@/utils/save-blob';

const { open: openImagePreview } = useImagePreview();

const MAX_PHOTOS = 50;
/** 预览最长边，与摄影边框页一致，避免全尺寸预览卡顿 */
const PREVIEW_MAX_DIM = 1280;
/** 预览 JPEG 质量（仅展示，导出另走原图编码） */
const PREVIEW_JPEG_QUALITY = 0.85;

interface WatermarkItem {
  id: string;
  name: string;
  /** 原图 File，供 createImageBitmap / 导出解码 */
  file: File;
  /** 原图 blob: URL */
  originalSrc: string;
  /** 加水印后的预览 blob: URL（降采样 JPEG） */
  previewSrc: string;
}

type TimeMark = 'yes' | 'no';

const customMark = ref('我的水印');
const timeMark = ref<TimeMark>('yes');
const watermarkPosition = ref<WatermarkPosition>('bottom');
const watermarkOpacity = ref(85);
const fontSizeMode = ref<FontSizeMode>('auto');
const customFontSize = ref(30);
const watermarkColorMode = ref<WatermarkColorMode>('white');
const customWatermarkColor = ref('#ffffff');
const watermarkRotation = ref(0);
const watermarkFont = ref<WatermarkFontKey>('harmony');
const appendMode = ref(false);
const exportFormat = ref<ExportFormat>('png');
const jpegQuality = ref(90);

const items = ref<WatermarkItem[]>([]);
const loading = ref(false);
const processing = ref(false);
const processedCount = ref(0);
const pendingCount = ref(0);
const isDragging = ref(false);
const downloadingId = ref('');

const fileInputRef = ref<HTMLInputElement | null>(null);

const viewerImages = computed(() => items.value.map(item => item.previewSrc));

const displayWatermarkColor = computed(() => {
  if (watermarkColorMode.value === 'black') {
    return '#000000';
  }
  if (watermarkColorMode.value === 'custom') {
    return customWatermarkColor.value;
  }
  return '#ffffff';
});

watch(watermarkColorMode, (mode) => {
  if (mode === 'white') {
    customWatermarkColor.value = '#ffffff';
  }
  else if (mode === 'black') {
    customWatermarkColor.value = '#000000';
  }
});

function onWatermarkColorInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  watermarkColorMode.value = 'custom';
  customWatermarkColor.value = value;
}

const selectedFontFamily = computed(
  () =>
    WATERMARK_FONT_OPTIONS.find(opt => opt.value === watermarkFont.value)?.family
    ?? WATERMARK_FONT_OPTIONS[0]!.family,
);

/** 从表单收集水印样式（预览与导出共用） */
function getWatermarkStyle(): WatermarkStyle {
  return {
    position: watermarkPosition.value,
    opacity: watermarkOpacity.value,
    fontSizeMode: fontSizeMode.value,
    customFontSize: customFontSize.value,
    colorMode: watermarkColorMode.value,
    customColor: customWatermarkColor.value,
    rotation: watermarkRotation.value,
    fontFamily: watermarkFont.value,
  };
}

/** 当前导出格式与 JPEG 质量 */
function getExportOptions(): ExportOptions {
  return {
    format: exportFormat.value,
    jpegQuality: jpegQuality.value,
  };
}

/** 当前水印完整文案（含可选日期） */
function getWatermarkText(): string {
  return buildWatermarkText(customMark.value, timeMark.value === 'yes');
}

/** 释放 blob: URL，忽略 data:/http: */
function revokeBlobUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/** 释放条目占用的 object URL（原图 + 预览） */
function revokeItemUrls(item: WatermarkItem): void {
  revokeBlobUrl(item.originalSrc);
  revokeBlobUrl(item.previewSrc);
}

/** 清空列表并释放全部 blob URL */
function clearItems(): void {
  for (const item of items.value) {
    revokeItemUrls(item);
  }
  items.value = [];
}

/**
   * 解码图片；maxDim 时优先 createImageBitmap 硬件缩放。
   * @returns bitmap 与相对原图的 scale（导出为 1）
   */
async function decodeImageSource(
  file: File,
  maxDim?: number,
): Promise<{ bitmap: ImageBitmap; scale: number }> {
  if (typeof createImageBitmap !== 'function') {
    throw new Error('createImageBitmap unsupported');
  }

  const full = await createImageBitmap(file);
  const longest = Math.max(full.width, full.height);
  if (!maxDim || longest <= maxDim) {
    return { bitmap: full, scale: 1 };
  }

  const scale = maxDim / longest;
  try {
    const resized = await createImageBitmap(file, {
      resizeWidth: Math.max(1, Math.round(full.width * scale)),
      resizeHeight: Math.max(1, Math.round(full.height * scale)),
      resizeQuality: 'medium',
    });
    full.close();
    return { bitmap: resized, scale };
  }
  catch {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(full.width * scale));
    canvas.height = Math.max(1, Math.round(full.height * scale));
    canvas.getContext('2d')?.drawImage(full, 0, 0, canvas.width, canvas.height);
    const resized = await createImageBitmap(canvas);
    full.close();
    return { bitmap: resized, scale };
  }
}

/** HTMLImageElement 回退解码（无 createImageBitmap 时） */
function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });
}

/**
   * 绘制加水印 canvas（主线程：预览降采样 / 导出回退全分辨率）。
   * @param maxDim 传入则降采样（预览）；省略则原图像素（导出）
   * @param text 完整水印文案
   */
async function renderWatermarkedCanvas(
  file: File,
  originalSrc: string,
  style = getWatermarkStyle(),
  text = getWatermarkText(),
  maxDim?: number,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('canvas unsupported');
  }

  let scale = 1;
  try {
    const decoded = await decodeImageSource(file, maxDim);
    canvas.width = decoded.bitmap.width;
    canvas.height = decoded.bitmap.height;
    scale = decoded.scale;
    ctx.drawImage(decoded.bitmap, 0, 0);
    decoded.bitmap.close();
  }
  catch {
    // createImageBitmap 不可用或失败时回退 Image + 软缩放
    const img = await loadImageElement(originalSrc);
    const longest = Math.max(img.width, img.height);
    if (maxDim && longest > maxDim) {
      scale = maxDim / longest;
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
    }
    else {
      canvas.width = img.width;
      canvas.height = img.height;
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  const fontSize = resolveFontSize(canvas.width, canvas.height, style, scale);
  await ensureWatermarkFont(document.fonts, style, fontSize);
  drawWatermarkLayer(ctx, canvas.width, canvas.height, style, text, scale);
  return canvas;
}

/** 预览：降采样 + 浏览器原生 JPEG blob URL（不拉 mozjpeg WASM） */
async function renderPreviewObjectUrl(
  file: File,
  originalSrc: string,
  style = getWatermarkStyle(),
): Promise<string> {
  const canvas = await renderWatermarkedCanvas(
    file,
    originalSrc,
    style,
    getWatermarkText(),
    PREVIEW_MAX_DIM,
  );
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('preview encode failed'))),
      'image/jpeg',
      PREVIEW_JPEG_QUALITY,
    );
  });
  return URL.createObjectURL(blob);
}

/** 导出用：JPEG 优先 mozjpeg WASM，PNG 用 toBlob（主线程回退） */
async function encodeCanvasBlob(
  canvas: HTMLCanvasElement,
  exportOptions: ExportOptions = { format: 'png', jpegQuality: 90 },
): Promise<Blob> {
  if (exportOptions.format === 'jpeg') {
    const quality = Math.min(1, Math.max(0.6, exportOptions.jpegQuality / 100));
    const { encodeCanvasToJpeg } = await import('@/utils/jpeg-encode');
    return encodeCanvasToJpeg(canvas, quality);
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('PNG 导出失败'))),
      'image/png',
    );
  });
}

function sanitizeFileName(name: string): string {
  return (
    [...name]
      .map((ch) => {
        const code = ch.charCodeAt(0);
        if (code < 32 || /[<>:"/\\|?*]/.test(ch)) return '_';
        return ch;
      })
      .join('')
      .slice(0, 80) || 'image'
  );
}

/** 主线程全分辨率导出（Worker 不可用或失败时） */
async function renderWatermarkedBlobOnMain(
  item: WatermarkItem,
  text: string,
  style: WatermarkStyle,
  exportOptions: ExportOptions,
): Promise<Blob> {
  const canvas = await renderWatermarkedCanvas(item.file, item.originalSrc, style, text);
  return encodeCanvasBlob(canvas, exportOptions);
}

/**
   * 导出加水印 Blob。
   * @param allowWorker 为 false 时强制主线程（无 File System Access 时保留用户手势，避免 a.download 被拦截）
   */
async function getExportBlob(item: WatermarkItem, allowWorker = true): Promise<Blob> {
  const style = getWatermarkStyle();
  const exportOptions = getExportOptions();
  const text = getWatermarkText();

  if (allowWorker && canUseWatermarkExportWorker()) {
    try {
      return await exportWatermarkInWorker({
        file: item.file,
        text,
        style,
        exportOptions,
      });
    }
    catch (err) {
      console.warn('[watermark] Worker 导出失败，回退主线程', err);
    }
  }

  return renderWatermarkedBlobOnMain(item, text, style, exportOptions);
}

/** 选图 / 拖入：blob URL 存原图，预览降采样后写入列表 */
async function processFiles(files: FileList | File[]) {
  const picked = Array.from(files).filter(file => file.type.startsWith('image/'));
  if (!picked.length) {
    messageDanger('请选择图片文件');
    return;
  }

  const remain = appendMode.value ? MAX_PHOTOS - items.value.length : MAX_PHOTOS;
  if (remain <= 0) {
    messageDanger(`最多处理 ${MAX_PHOTOS} 张图片`);
    return;
  }

  const toAdd = picked.slice(0, remain);
  if (picked.length > remain) {
    messageDanger(`最多 ${MAX_PHOTOS} 张，已添加 ${toAdd.length} 张`);
  }

  if (!appendMode.value) {
    clearItems();
  }

  processing.value = true;
  processedCount.value = 0;
  pendingCount.value = toAdd.length;
  const style = getWatermarkStyle();

  try {
    for (const file of toAdd) {
      const originalSrc = URL.createObjectURL(file);
      try {
        const previewSrc = await renderPreviewObjectUrl(file, originalSrc, style);
        const baseName = file.name.replace(/\.[^.]+$/, '') || `image-${items.value.length + 1}`;

        items.value.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: sanitizeFileName(baseName),
          file,
          originalSrc,
          previewSrc,
        });
      }
      catch (err) {
        revokeBlobUrl(originalSrc);
        throw err;
      }
      processedCount.value += 1;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  catch {
    messageDanger('图片处理失败，请重试');
    if (!appendMode.value) {
      clearItems();
    }
  }
  finally {
    processing.value = false;
    processedCount.value = 0;
    pendingCount.value = 0;
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  }
}

/** 样式变更：仅重绘预览，释放旧 preview URL */
const rerenderAll = debounce(async () => {
  if (!items.value.length || processing.value) {
    return;
  }

  processing.value = true;
  processedCount.value = 0;
  pendingCount.value = items.value.length;
  const style = getWatermarkStyle();

  try {
    const nextItems: WatermarkItem[] = [];
    for (const item of items.value) {
      const previewSrc = await renderPreviewObjectUrl(item.file, item.originalSrc, style);
      revokeBlobUrl(item.previewSrc);
      nextItems.push({ ...item, previewSrc });
      processedCount.value += 1;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    items.value = nextItems;
  }
  catch {
    messageDanger('水印更新失败，请重试');
  }
  finally {
    processing.value = false;
    processedCount.value = 0;
    pendingCount.value = 0;
  }
}, 300);

watch(
  [
    customMark,
    timeMark,
    watermarkPosition,
    watermarkOpacity,
    fontSizeMode,
    customFontSize,
    watermarkColorMode,
    customWatermarkColor,
    watermarkRotation,
    watermarkFont,
  ],
  () => {
    if (items.value.length) {
      rerenderAll();
    }
  },
);

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    processFiles(input.files);
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files?.length) {
    processFiles(event.dataTransfer.files);
  }
};

/** 清空已选并释放 blob URL */
const clearAll = () => {
  clearItems();
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

/** 移除单张并释放其 object URL */
const removeItem = (index: number) => {
  const [removed] = items.value.splice(index, 1);
  if (removed) {
    revokeItemUrls(removed);
  }
};

onMounted(() => {
  initWatermarkExportWorker();
});

onUnmounted(() => {
  clearItems();
  terminateWatermarkExportWorker();
});

const downloadSingle = async (item: WatermarkItem) => {
  if (processing.value) {
    messageDanger('图片仍在处理中，请稍候');
    return;
  }

  const ext = getExportExtension(exportFormat.value);
  const filename = `${item.name}-watermarked.${ext}`;

  downloadingId.value = item.id;
  try {
    // 单张强制主线程：Worker 往返会断开用户手势，导致 a.download 被浏览器静默拦截
    const blob = await getExportBlob(item, false);
    await saveBlob(blob, filename, null);
    messageSuccess('已开始下载');
  }
  catch {
    messageDanger('下载失败，请重试');
  }
  finally {
    downloadingId.value = '';
  }
};

const openViewer = (index: number) => {
  if (!items.value.length || processing.value) {
    return;
  }

  openImagePreview(viewerImages.value, {
    index,
    mode: 'full',
    fileNames: items.value.map(item => item.name),
    onDownload: (downloadIndex) => {
      const item = items.value[downloadIndex];
      if (item) {
        return downloadSingle(item);
      }
    },
  });
};

const downloadAllImages = async () => {
  if (!items.value.length) {
    messageDanger('请先选择图片');
    return;
  }
  if (processing.value) {
    messageDanger('图片仍在处理中，请稍候');
    return;
  }

  if (items.value.length === 1) {
    await downloadSingle(items.value[0]!);
    return;
  }

  // 批量 ZIP：手势内先选保存位置，后续可用 Worker 编码而不丢下载权限
  let saveHandle: FileSystemFileHandle | null = null;
  try {
    saveHandle = await pickSaveFileHandle('watermarked-images.zip', 'application/zip');
  }
  catch (err) {
    if (isSaveAbortError(err)) return;
  }

  loading.value = true;
  try {
    const files: Record<string, Uint8Array> = {};
    const ext = getExportExtension(exportFormat.value);
    // 已拿到句柄时用 Worker 减卡顿；否则主线程 + a.download
    const allowWorker = Boolean(saveHandle);

    for (let index = 0; index < items.value.length; index++) {
      const item = items.value[index]!;
      const blob = await getExportBlob(item, allowWorker);
      files[`${item.name}-watermarked-${index + 1}.${ext}`] = await blobToUint8Array(blob);
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const content = await zipFilesToBlob(files);
    await saveBlob(content, 'watermarked-images.zip', saveHandle);
    messageSuccess('已开始下载');
  }
  catch {
    messageDanger('打包下载失败，请重试');
  }
  finally {
    loading.value = false;
  }
};
</script>
