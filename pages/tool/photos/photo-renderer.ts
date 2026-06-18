import { getLogoUrl, resolveLogoName, type PhotoSettings } from './constants';
import { LRUCache } from './photo-cache';
import { createBlurInWorker, parseExifInWorker } from './photo-worker-client';

export interface RenderSize {
  width: number;
  height: number;
}

export interface RenderInput {
  src: string;
  settings: PhotoSettings;
  size: RenderSize;
}

const PREVIEW_MAX_DIM = 1280;
const EXPORT_MAX_DIM = 2560;

const fileRegistry = new Map<string, File>();
const exifCache = new LRUCache<string, Record<string, string>>(40);
const previewBitmapCache = new LRUCache<string, ImageBitmap>(12, b => b.close());
const exportBitmapCache = new LRUCache<string, ImageBitmap>(6, b => b.close());
const blurBitmapCache = new LRUCache<string, ImageBitmap>(16, b => b.close());
const logoImageCache = new LRUCache<string, HTMLImageElement | null>(24);

let sharedExportCanvas: HTMLCanvasElement | null = null;

export { initPhotoWorker, terminatePhotoWorker } from './photo-worker-client';

export function registerPhotoFile(url: string, file: File) {
  fileRegistry.set(url, file);
}

export function unregisterPhotoFile(url: string) {
  fileRegistry.delete(url);
  exifCache.delete(url);
  previewBitmapCache.delete(url);
  exportBitmapCache.delete(url);
}

export function clearPhotoCaches() {
  fileRegistry.clear();
  exifCache.clear();
  previewBitmapCache.clear();
  exportBitmapCache.clear();
  blurBitmapCache.clear();
  logoImageCache.clear();
}

async function readArrayBuffer(src: string): Promise<ArrayBuffer> {
  const file = fileRegistry.get(src);
  if (file) return file.arrayBuffer();

  if (src.startsWith('blob:')) {
    return fetch(src).then(r => r.arrayBuffer());
  }
  if (src.startsWith('http')) {
    return fetch(src).then(r => r.arrayBuffer());
  }
  throw new Error('Unsupported image source');
}

async function decodeBitmap(blob: Blob, maxDim: number): Promise<ImageBitmap> {
  if (typeof createImageBitmap !== 'function') {
    throw new Error('createImageBitmap not supported');
  }

  const bitmap = await createImageBitmap(blob);
  const longest = Math.max(bitmap.width, bitmap.height);
  if (longest <= maxDim) return bitmap;

  try {
    const resized = await createImageBitmap(blob, {
      resizeWidth: Math.round(bitmap.width * (maxDim / longest)),
      resizeHeight: Math.round(bitmap.height * (maxDim / longest)),
      resizeQuality: 'medium',
    });
    bitmap.close();
    return resized;
  }
  catch {
    const scale = maxDim / longest;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const resized = await createImageBitmap(canvas);
    bitmap.close();
    return resized;
  }
}

async function loadBitmap(src: string, maxDim: number, cache: LRUCache<string, ImageBitmap>) {
  const cached = cache.get(src);
  if (cached) return cached;

  const file = fileRegistry.get(src);
  const blob = file ? file : await fetch(src).then(r => r.blob());
  const bitmap = await decodeBitmap(blob, maxDim);
  cache.set(src, bitmap);
  return bitmap;
}

export function loadPreviewBitmap(src: string) {
  return loadBitmap(src, PREVIEW_MAX_DIM, previewBitmapCache);
}

function loadExportBitmap(src: string) {
  return loadBitmap(src, EXPORT_MAX_DIM, exportBitmapCache);
}

export async function getPhotoExif(src: string): Promise<Record<string, string>> {
  const cached = exifCache.get(src);
  if (cached) return cached;

  try {
    const buffer = await readArrayBuffer(src);
    const copy = buffer.slice(0);
    const data = await parseExifInWorker(copy);
    exifCache.set(src, data);
    return data;
  }
  catch (error) {
    console.warn('EXIF 读取失败:', error);
    const empty: Record<string, string> = {};
    exifCache.set(src, empty);
    return empty;
  }
}

function loadLogoImage(url: string): Promise<HTMLImageElement | null> {
  const cached = logoImageCache.get(url);
  if (cached !== undefined) return Promise.resolve(cached);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      logoImageCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => {
      logoImageCache.set(url, null);
      resolve(null);
    };
    img.src = url;
  });
}

export async function loadBrandLogo(
  make: string,
  logoBrand: string,
): Promise<HTMLImageElement | null> {
  const logoName = resolveLogoName(make, logoBrand);
  if (!logoName) return null;
  return loadLogoImage(getLogoUrl(logoName));
}

export function preloadPhotoAssets(src: string) {
  const run = () => {
    void loadPreviewBitmap(src).catch(() => {});
    void getPhotoExif(src).catch(() => {});
  };
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(run, { timeout: 2000 });
  }
  else {
    setTimeout(run, 0);
  }
}

export interface LayoutRect {
  containerWidth: number;
  containerHeight: number;
  displayX: number;
  displayY: number;
  displayWidth: number;
  displayHeight: number;
}

export function calcDisplayRect(
  imgWidth: number,
  imgHeight: number,
  containerWidth: number,
  containerHeight: number,
  padding: number,
): LayoutRect {
  const availW = containerWidth - padding * 2;
  const availH = containerHeight - padding * 2;
  const scale = Math.min(availW / imgWidth, availH / imgHeight, 1);
  const displayWidth = imgWidth * scale;
  const displayHeight = imgHeight * scale;
  return {
    containerWidth,
    containerHeight,
    displayX: (containerWidth - displayWidth) / 2,
    displayY: (containerHeight - displayHeight) / 2,
    displayWidth,
    displayHeight,
  };
}

function drawGradientBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0a0a12');
  gradient.addColorStop(0.55, '#12121f');
  gradient.addColorStop(1, '#080810');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

async function getBlurredBackground(
  src: string,
  previewBitmap: ImageBitmap,
  width: number,
  height: number,
  blur: number,
): Promise<ImageBitmap | null> {
  if (blur <= 0) return null;

  const cacheKey = `${src}|${width}|${height}|${blur}`;
  const cached = blurBitmapCache.get(cacheKey);
  if (cached) return cached;

  const clone = await createImageBitmap(previewBitmap);
  try {
    const blurred = await createBlurInWorker(clone, width, height, blur);
    blurBitmapCache.set(cacheKey, blurred);
    return blurred;
  }
  catch {
    clone.close();
    return null;
  }
}

function drawBlurOnCanvas(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  width: number,
  height: number,
  blur: number,
) {
  const scale = Math.min(1, 280 / Math.max(bitmap.width, bitmap.height));
  const sw = Math.max(1, Math.round(bitmap.width * scale));
  const sh = Math.max(1, Math.round(bitmap.height * scale));
  const tmp = document.createElement('canvas');
  tmp.width = sw;
  tmp.height = sh;
  tmp.getContext('2d')?.drawImage(bitmap, 0, 0, sw, sh);

  const coverScale = Math.max(width / sw, height / sh);
  const coverW = sw * coverScale;
  const coverH = sh * coverScale;

  ctx.save();
  ctx.filter = `blur(${Math.min(blur, 20)}px)`;
  ctx.globalAlpha = 0.45;
  ctx.drawImage(tmp, (width - coverW) / 2, (height - coverH) / 2, coverW, coverH);
  ctx.restore();
}

function formatExposure(exif: Record<string, string>) {
  const parts: string[] = [];
  const focal = exif.FocalLengthIn35mmFilm || exif.FocalLength;
  if (focal) parts.push(focal);
  if (exif.FNumber) parts.push(exif.FNumber);
  if (exif.ExposureTime) parts.push(`${exif.ExposureTime}s`);
  if (exif.ISOSpeedRatings) parts.push(`ISO ${exif.ISOSpeedRatings}`);
  return parts.join('  ·  ');
}

export function getExifDisplayName(exif: Record<string, string>) {
  return exif.Make || exif.Model || '';
}

export function formatExposureText(exif: Record<string, string>) {
  return formatExposure(exif);
}

export async function drawPhotoFrameCanvas(
  ctx: CanvasRenderingContext2D,
  src: string,
  bitmap: ImageBitmap,
  logo: HTMLImageElement | null,
  exif: Record<string, string>,
  settings: PhotoSettings,
  size: RenderSize,
  options: { drawExifOnCanvas?: boolean; withShadow?: boolean } = {},
) {
  const { width, height } = size;
  const layout = calcDisplayRect(bitmap.width, bitmap.height, width, height, settings.padding);

  ctx.clearRect(0, 0, width, height);
  drawGradientBackground(ctx, width, height);

  if (settings.blur > 0) {
    const blurred = await getBlurredBackground(src, bitmap, width, height, settings.blur);
    if (blurred) {
      ctx.drawImage(blurred, 0, 0, width, height);
    }
    else {
      drawBlurOnCanvas(ctx, bitmap, width, height, settings.blur);
    }
  }

  ctx.save();
  if (options.withShadow && settings.shadow > 0) {
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = settings.shadow;
    ctx.shadowOffsetY = 6;
  }
  roundRectPath(
    ctx,
    layout.displayX,
    layout.displayY,
    layout.displayWidth,
    layout.displayHeight,
    settings.borderRadius,
  );
  ctx.clip();
  ctx.drawImage(
    bitmap,
    layout.displayX,
    layout.displayY,
    layout.displayWidth,
    layout.displayHeight,
  );
  ctx.restore();

  if (options.drawExifOnCanvas && settings.showExif) {
    const displayName = getExifDisplayName(exif);
    const exposure = formatExposure(exif);
    if (displayName || exposure) {
      const panelX = layout.displayX + 12;
      const panelY = layout.displayY + layout.displayHeight - (exposure ? 56 : 36);
      const panelW = Math.min(layout.displayWidth - 24, 280);
      const panelH = exposure ? 44 : 28;

      ctx.save();
      roundRectPath(ctx, panelX, panelY, panelW, panelH, 8);
      ctx.fillStyle = 'rgba(8, 8, 16, 0.72)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      let textX = panelX + 10;
      if (logo) {
        ctx.drawImage(logo, panelX + 8, panelY + (panelH - 28) / 2, 28, 28);
        textX = panelX + 44;
      }
      if (displayName) {
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(displayName, textX, panelY + (exposure ? 18 : 20));
      }
      if (exposure) {
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.font = '11px sans-serif';
        ctx.fillText(exposure, textX, panelY + 36);
      }
      ctx.restore();
    }
  }
}

function getExportCanvas(width: number, height: number) {
  if (!sharedExportCanvas) {
    sharedExportCanvas = document.createElement('canvas');
  }
  sharedExportCanvas.width = width;
  sharedExportCanvas.height = height;
  return sharedExportCanvas;
}

export async function exportPhotoBlob(input: RenderInput): Promise<Blob> {
  const [exif, bitmap] = await Promise.all([getPhotoExif(input.src), loadExportBitmap(input.src)]);
  const logo = await loadBrandLogo(exif.Make || '', input.settings.logoBrand);

  const canvas = getExportCanvas(input.size.width, input.size.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  await drawPhotoFrameCanvas(ctx, input.src, bitmap, logo, exif, input.settings, input.size, {
    drawExifOnCanvas: true,
    withShadow: true,
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('导出失败'))),
      'image/jpeg',
      0.92,
    );
  });
}

export async function drawPreviewBlurBackground(
  ctx: CanvasRenderingContext2D,
  src: string,
  width: number,
  height: number,
  blur: number,
): Promise<void> {
  if (blur <= 0) return;

  const bitmap = await loadPreviewBitmap(src);
  const blurred = await getBlurredBackground(src, bitmap, width, height, blur);
  if (blurred) {
    ctx.drawImage(blurred, 0, 0, width, height);
    return;
  }
  drawBlurOnCanvas(ctx, bitmap, width, height, blur);
}

export const EXPORT_SIZE: RenderSize = { width: 1280, height: 800 };
