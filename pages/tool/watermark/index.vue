<!--
  批量图片水印：本地选图后在 Canvas 绘制文字水印，支持预览、大图查看与 ZIP 打包下载。
  水印文案或样式变更时会基于原图重新渲染；导出时可选择 PNG/JPEG 与质量。
-->
<template>
  <div class="mx-auto w-full max-w-3xl space-y-4">
    <CyberToolCard title="批量加水印" desc="选择多张图片，添加自定义文字与时间水印，预览后打包下载">
      <div class="join w-full pb-2">
        <select v-model="timeMark" class="select select-bordered login-input join-item">
          <option value="no">
            无时间水印
          </option>
          <option value="yes">
            有时间水印
          </option>
        </select>
        <input
          v-model="customMark"
          class="input input-bordered login-input join-item min-w-0 flex-1"
          placeholder="输入自定义水印描述（可选）"
        >
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
          <div class="join w-full">
            <select
              v-model="watermarkColorMode"
              class="select select-bordered login-input join-item w-auto min-w-[7rem]"
            >
              <option value="white"> 白色 </option>
              <option value="black"> 黑色 </option>
              <option value="custom"> 自定义 </option>
            </select>
            <input
              v-model="customWatermarkColor"
              type="color"
              class="h-12 min-w-0 flex-1 cursor-pointer rounded-r-lg border border-tech bg-[var(--tech-input-bg)] px-1"
              :disabled="watermarkColorMode !== 'custom'"
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

    <BaseImageViewer
      v-if="isViewerOpen"
      :images="viewerImages"
      :initial-index="initialIndex"
      @close="isViewerOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { messageDanger, messageSuccess } from '@/utils/toast';
import { debounce } from '@/utils/index';
import { loadWatermarkScripts } from '~/utils/script-loader';

const MAX_PHOTOS = 50;

interface WatermarkItem {
  id: string;
  name: string;
  originalSrc: string;
  previewSrc: string;
}

type TimeMark = 'yes' | 'no';
type WatermarkPosition = 'bottom' | 'top' | 'center' | 'bottom-left' | 'bottom-right' | 'tile';
type FontSizeMode = 'auto' | 'manual';
type WatermarkColorMode = 'white' | 'black' | 'custom';
type ExportFormat = 'png' | 'jpeg';

interface WatermarkStyle {
  position: WatermarkPosition;
  opacity: number;
  fontSizeMode: FontSizeMode;
  customFontSize: number;
  colorMode: WatermarkColorMode;
  customColor: string;
  rotation: number;
}

interface ExportOptions {
  format: ExportFormat;
  jpegQuality: number;
}

interface WatermarkColors {
  fill: string;
  shadow: string;
}

const customMark = ref('');
const timeMark = ref<TimeMark>('yes');
const watermarkPosition = ref<WatermarkPosition>('bottom');
const watermarkOpacity = ref(85);
const fontSizeMode = ref<FontSizeMode>('auto');
const customFontSize = ref(30);
const watermarkColorMode = ref<WatermarkColorMode>('white');
const customWatermarkColor = ref('#ffffff');
const watermarkRotation = ref(0);
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
const isViewerOpen = ref(false);
const initialIndex = ref(0);

const viewerImages = computed(() => items.value.map(item => item.previewSrc));

function getWatermarkStyle(): WatermarkStyle {
  return {
    position: watermarkPosition.value,
    opacity: watermarkOpacity.value,
    fontSizeMode: fontSizeMode.value,
    customFontSize: customFontSize.value,
    colorMode: watermarkColorMode.value,
    customColor: customWatermarkColor.value,
    rotation: watermarkRotation.value,
  };
}

function getExportOptions(): ExportOptions {
  return {
    format: exportFormat.value,
    jpegQuality: jpegQuality.value,
  };
}

function getExportExtension(format: ExportFormat): string {
  return format === 'jpeg' ? 'jpg' : 'png';
}

function resolveRotationDeg(style: WatermarkStyle): number {
  if (style.position === 'tile' && style.rotation === 0) {
    return -30;
  }
  return style.rotation;
}

function buildWatermarkText(): string {
  const parts: string[] = [];
  const text = customMark.value.trim();
  if (text) {
    parts.push(text);
  }
  if (timeMark.value === 'yes') {
    parts.push(new Date().toLocaleDateString('zh-CN'));
  }
  return parts.join('  ');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    return {
      r: Number.parseInt(normalized[0]! + normalized[0]!, 16),
      g: Number.parseInt(normalized[1]! + normalized[1]!, 16),
      b: Number.parseInt(normalized[2]! + normalized[2]!, 16),
    };
  }
  if (normalized.length === 6) {
    return {
      r: Number.parseInt(normalized.slice(0, 2), 16),
      g: Number.parseInt(normalized.slice(2, 4), 16),
      b: Number.parseInt(normalized.slice(4, 6), 16),
    };
  }
  return null;
}

function getWatermarkColors(style: WatermarkStyle): WatermarkColors {
  const alpha = Math.min(100, Math.max(20, style.opacity)) / 100;

  if (style.colorMode === 'black') {
    return {
      fill: `rgba(0, 0, 0, ${alpha})`,
      shadow: `rgba(255, 255, 255, ${alpha * 0.45})`,
    };
  }

  if (style.colorMode === 'custom') {
    const rgb = hexToRgb(style.customColor) ?? { r: 255, g: 255, b: 255 };
    return {
      fill: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
      shadow: `rgba(0, 0, 0, ${alpha * 0.4})`,
    };
  }

  return {
    fill: `rgba(255, 255, 255, ${alpha})`,
    shadow: `rgba(0, 0, 0, ${alpha * 0.5})`,
  };
}

function resolveFontSize(width: number, height: number, style: WatermarkStyle): number {
  if (style.fontSizeMode === 'manual') {
    return Math.min(120, Math.max(12, style.customFontSize || 30));
  }
  return Math.max(16, Math.round(Math.min(width, height) * 0.04));
}

function drawTextWithShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  colors: WatermarkColors,
): void {
  ctx.fillStyle = colors.shadow;
  ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = colors.fill;
  ctx.fillText(text, x, y);
}

function drawSingleWatermark(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  style: WatermarkStyle,
): void {
  const fontSize = resolveFontSize(width, height, style);
  const pad = Math.round(fontSize * 0.65);
  const colors = getWatermarkColors(style);
  const rotationRad = (resolveRotationDeg(style) * Math.PI) / 180;

  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.textBaseline = 'middle';

  let x = width / 2;
  let y = height - pad - fontSize / 2;
  let textAlign: 'left' | 'right' | 'center' | 'start' | 'end' = 'center';

  switch (style.position) {
    case 'top':
      y = pad + fontSize / 2;
      break;
    case 'center':
      y = height / 2;
      break;
    case 'bottom-left':
      x = pad;
      y = height - pad - fontSize / 2;
      textAlign = 'left';
      break;
    case 'bottom-right':
      x = width - pad;
      y = height - pad - fontSize / 2;
      textAlign = 'right';
      break;
    default:
      break;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotationRad);
  ctx.textAlign = textAlign;
  drawTextWithShadow(ctx, text, 0, 0, colors);
  ctx.restore();
}

function drawTiledWatermark(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  style: WatermarkStyle,
): void {
  const fontSize = resolveFontSize(width, height, style);
  const colors = getWatermarkColors(style);
  const rotationRad = (resolveRotationDeg(style) * Math.PI) / 180;

  ctx.save();
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textWidth = ctx.measureText(text).width;
  const gapX = textWidth + fontSize * 2;
  const gapY = fontSize * 3;
  const radius = Math.sqrt(width * width + height * height);

  ctx.translate(width / 2, height / 2);
  ctx.rotate(rotationRad);

  for (let y = -radius; y < radius; y += gapY) {
    for (let x = -radius; x < radius; x += gapX) {
      drawTextWithShadow(ctx, text, x, y, colors);
    }
  }

  ctx.restore();
}

function drawWatermarkLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: WatermarkStyle,
): void {
  const text = buildWatermarkText();
  if (!text) {
    return;
  }

  if (style.position === 'tile') {
    drawTiledWatermark(ctx, text, width, height, style);
    return;
  }

  drawSingleWatermark(ctx, text, width, height, style);
}

function encodeCanvas(
  canvas: HTMLCanvasElement,
  exportOptions: ExportOptions = { format: 'png', jpegQuality: 90 },
): string {
  if (exportOptions.format === 'jpeg') {
    const quality = Math.min(1, Math.max(0.6, exportOptions.jpegQuality / 100));
    return canvas.toDataURL('image/jpeg', quality);
  }
  return canvas.toDataURL('image/png');
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
        return;
      }
      reject(new Error('read failed'));
    };
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

function renderWatermarkedCanvas(
  src: string,
  style = getWatermarkStyle(),
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('canvas unsupported'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      drawWatermarkLayer(ctx, canvas.width, canvas.height, style);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });
}

async function renderWatermarkedImage(
  src: string,
  style = getWatermarkStyle(),
  exportOptions: ExportOptions = { format: 'png', jpegQuality: 90 },
): Promise<string> {
  const canvas = await renderWatermarkedCanvas(src, style);
  return encodeCanvas(canvas, exportOptions);
}

async function getExportDataUrl(item: WatermarkItem): Promise<string> {
  return renderWatermarkedImage(item.originalSrc, getWatermarkStyle(), getExportOptions());
}

async function ensureJsZipReady(): Promise<boolean> {
  if (typeof JSZip !== 'undefined') {
    return true;
  }
  try {
    await loadWatermarkScripts();
    return typeof JSZip !== 'undefined';
  }
  catch {
    messageDanger('打包组件加载失败，请刷新页面后重试');
    return false;
  }
}

function downloadBlob(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

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
    items.value = [];
  }

  processing.value = true;
  processedCount.value = 0;
  pendingCount.value = toAdd.length;
  const style = getWatermarkStyle();

  try {
    for (const file of toAdd) {
      const originalSrc = await readFileAsDataUrl(file);
      const previewSrc = await renderWatermarkedImage(originalSrc, style);
      const baseName = file.name.replace(/\.[^.]+$/, '') || `image-${items.value.length + 1}`;

      items.value.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: sanitizeFileName(baseName),
        originalSrc,
        previewSrc,
      });
      processedCount.value += 1;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  catch {
    messageDanger('图片处理失败，请重试');
    if (!appendMode.value) {
      items.value = [];
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
      const previewSrc = await renderWatermarkedImage(item.originalSrc, style);
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

const clearAll = () => {
  items.value = [];
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
  if (isViewerOpen.value && initialIndex.value >= items.value.length) {
    isViewerOpen.value = false;
  }
};

const downloadSingle = async (item: WatermarkItem) => {
  if (processing.value) {
    messageDanger('图片仍在处理中，请稍候');
    return;
  }

  downloadingId.value = item.id;
  try {
    const dataUrl = await getExportDataUrl(item);
    const ext = getExportExtension(exportFormat.value);
    downloadBlob(dataUrl, `${item.name}-watermarked.${ext}`);
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
  initialIndex.value = index;
  isViewerOpen.value = true;
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

  loading.value = true;
  try {
    const ready = await ensureJsZipReady();
    if (!ready) {
      return;
    }

    const zip = new JSZip();
    const ext = getExportExtension(exportFormat.value);

    for (let index = 0; index < items.value.length; index++) {
      const item = items.value[index]!;
      const dataUrl = await getExportDataUrl(item);
      const base64 = dataUrl.split(',')[1];
      if (!base64) {
        continue;
      }
      zip.file(`${item.name}-watermarked-${index + 1}.${ext}`, base64, { base64: true });
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(content);
    link.href = objectUrl;
    link.download = 'watermarked-images.zip';
    link.click();
    URL.revokeObjectURL(objectUrl);
    messageSuccess('已开始下载');
  }
  catch {
    messageDanger('打包下载失败，请重试');
  }
  finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    await loadWatermarkScripts();
  }
  catch {
    // 下载时再尝试加载
  }
});
</script>
