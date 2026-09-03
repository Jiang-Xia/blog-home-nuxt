/**
 * 媒体压缩 Worker（Vite module worker）。
 * OffscreenCanvas 缩放后用 @jsquash/webp（libwebp WASM）编码；失败回退 convertToBlob。
 * 原图 SHA-256 与压缩并行，供 upload-media contentHash。
 */
/// <reference lib="webworker" />

import type { MediaCompressConfig } from '../utils/media-compress-client';

const SKIP_TYPES = new Set(['image/gif', 'image/svg+xml']);

type EncodeFn = (data: ImageData, options?: { quality?: number }) => Promise<ArrayBuffer>;

let webpEncode: EncodeFn | null = null;

/** 懒加载 WASM WebP 编码器（仅 encode，首次上传才拉 codec） */
async function getWebpEncode(): Promise<EncodeFn> {
  if (!webpEncode) {
    const mod = await import('@jsquash/webp/encode');
    webpEncode = mod.default as EncodeFn;
  }
  return webpEncode;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i]!.toString(16).padStart(2, '0');
  }
  return hex;
}

async function sha256Hex(blob: Blob): Promise<string> {
  if (!self.crypto?.subtle) {
    throw new Error('crypto.subtle unavailable');
  }
  const digest = await self.crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return bufferToHex(digest);
}

/** 与 utils/image-compress.ts calcTargetSize 保持一致 */
function calcTargetSize(sourceWidth: number, sourceHeight: number, preset: MediaCompressConfig) {
  const maxW = preset.maxWidth;
  const maxH = preset.maxHeight ?? maxW;
  if (preset.fit === 'cover') {
    const targetRatio = maxW / maxH;
    const sourceRatio = sourceWidth / sourceHeight;
    let sw = sourceWidth;
    let sh = sourceHeight;
    let sx = 0;
    let sy = 0;
    if (sourceRatio > targetRatio) {
      sw = sourceHeight * targetRatio;
      sx = (sourceWidth - sw) / 2;
    }
    else {
      sh = sourceWidth / targetRatio;
      sy = (sourceHeight - sh) / 2;
    }
    return { width: maxW, height: maxH, sx, sy, sw, sh };
  }
  const scale = Math.min(1, maxW / sourceWidth);
  return {
    width: Math.round(sourceWidth * scale),
    height: Math.round(sourceHeight * scale),
    sx: 0,
    sy: 0,
    sw: sourceWidth,
    sh: sourceHeight,
  };
}

/**
 * 优先 WASM WebP；失败则浏览器原生 WebP/JPEG（convertToBlob）
 * @param quality01 Canvas 约定 0–1，WASM 侧转为 0–100
 */
async function encodeCanvas(
  canvas: OffscreenCanvas,
  ctx: OffscreenCanvasRenderingContext2D,
  quality01: number,
): Promise<{ blob: Blob; mime: string } | null> {
  const quality100 = Math.round(Math.min(1, Math.max(0, quality01)) * 100);

  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const encode = await getWebpEncode();
    const buffer = await encode(imageData, { quality: quality100 });
    if (buffer && buffer.byteLength > 0) {
      return {
        blob: new Blob([new Uint8Array(buffer)], { type: 'image/webp' }),
        mime: 'image/webp',
      };
    }
  }
  catch (err) {
    console.warn('[media-compress-worker] WASM WebP 失败，回退 convertToBlob', err);
  }

  try {
    const webp = await canvas.convertToBlob({ type: 'image/webp', quality: quality01 });
    if (webp?.type === 'image/webp') {
      return { blob: webp, mime: 'image/webp' };
    }
  }
  catch {
    // 环境不支持 image/webp
  }

  try {
    const jpeg = await canvas.convertToBlob({ type: 'image/jpeg', quality: quality01 });
    if (jpeg) {
      return { blob: jpeg, mime: 'image/jpeg' };
    }
  }
  catch {
    // ignore
  }
  return null;
}

async function compressFile(
  file: File,
  config: MediaCompressConfig,
): Promise<{ buffer: ArrayBuffer; mime: string; fileName: string; size: number } | null> {
  if (!file.type?.startsWith('image/') || SKIP_TYPES.has(file.type)) {
    return null;
  }
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas === 'undefined') {
    throw new Error('OffscreenCanvas unavailable');
  }

  const bitmap = await createImageBitmap(file);
  try {
    const target = calcTargetSize(bitmap.width, bitmap.height, config);
    const canvas = new OffscreenCanvas(target.width, target.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2d context unavailable');
    }
    ctx.drawImage(
      bitmap,
      target.sx,
      target.sy,
      target.sw,
      target.sh,
      0,
      0,
      target.width,
      target.height,
    );

    const encoded = await encodeCanvas(canvas, ctx, config.quality);
    if (!encoded || encoded.blob.size >= file.size) {
      return null;
    }
    const ext = encoded.mime === 'image/webp' ? '.webp' : '.jpg';
    const baseName = (file.name || 'image').replace(/\.[^.]+$/, '') || 'image';
    return {
      buffer: await encoded.blob.arrayBuffer(),
      mime: encoded.mime,
      fileName: `${baseName}${ext}`,
      size: encoded.blob.size,
    };
  }
  finally {
    bitmap.close();
  }
}

type WorkerRequest = {
  id: string;
  type: string;
  file?: File;
  config?: MediaCompressConfig;
};

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data || ({} as WorkerRequest);
  const { id, type } = msg;

  try {
    if (type !== 'compress-and-hash') {
      self.postMessage({ id, type, error: 'Unknown task' });
      return;
    }

    const file = msg.file;
    const config = msg.config;
    if (!file || !config) {
      throw new Error('file/config required');
    }

    const hashPromise = sha256Hex(file);
    const compressed = await compressFile(file, config);
    const contentHash = await hashPromise;

    if (!compressed) {
      self.postMessage({
        id,
        type,
        contentHash,
        skipped: true,
      });
      return;
    }

    self.postMessage(
      {
        id,
        type,
        contentHash,
        skipped: false,
        mime: compressed.mime,
        fileName: compressed.fileName,
        size: compressed.size,
        buffer: compressed.buffer,
      },
      [compressed.buffer],
    );
  }
  catch (error) {
    self.postMessage({
      id,
      type,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export {};
