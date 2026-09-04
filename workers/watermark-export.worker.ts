/**
 * 水印全分辨率导出 Worker（Vite module worker）。
 * OffscreenCanvas 叠字后 JPEG 走 @jsquash/jpeg（mozjpeg WASM），PNG 走 convertToBlob。
 * 鸿蒙字体需主线程传入绝对 URL，在 Worker 内 FontFace 注册（相对路径相对 worker 脚本会失效）。
 */
/// <reference lib="webworker" />

import {
  drawWatermarkLayer,
  ensureWatermarkFont,
  resolveFontSize,
  type ExportOptions,
  type WatermarkStyle,
} from '../utils/watermark-draw';
import { encodeCanvasToJpeg } from '../utils/jpeg-encode';

let harmonyFontReady: Promise<void> | null = null;

/**
 * 在 Worker 注册鸿蒙子集字体（仅 harmony 选项需要）。
 * @param fontUrl 绝对 URL（含 ?v=）
 */
async function ensureHarmonyFont(fontUrl?: string): Promise<void> {
  if (!fontUrl || !self.fonts) return;
  if (!harmonyFontReady) {
    harmonyFontReady = (async () => {
      const face = new FontFace('HarmonyOS-Sans', `url(${fontUrl})`);
      await face.load();
      self.fonts.add(face);
    })().catch((err) => {
      harmonyFontReady = null;
      throw err;
    });
  }
  await harmonyFontReady;
}

/** 全分辨率解码（导出不降采样） */
async function decodeFullBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap !== 'function') {
    throw new Error('createImageBitmap unsupported');
  }
  return createImageBitmap(file);
}

/**
 * 绘制加水印 OffscreenCanvas 并编码为 Blob。
 */
async function renderWatermarkedBlob(
  file: File,
  text: string,
  style: WatermarkStyle,
  exportOptions: ExportOptions,
  harmonyFontUrl?: string,
): Promise<{ buffer: ArrayBuffer; mime: string }> {
  if (typeof OffscreenCanvas === 'undefined') {
    throw new Error('OffscreenCanvas unavailable');
  }

  const bitmap = await decodeFullBitmap(file);
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2d context unavailable');
    }

    ctx.drawImage(bitmap, 0, 0);

    const fontSize = resolveFontSize(canvas.width, canvas.height, style, 1);
    if (style.fontFamily === 'harmony') {
      try {
        await ensureHarmonyFont(harmonyFontUrl);
      }
      catch (err) {
        console.warn('[watermark-export-worker] HarmonyOS font load failed', err);
      }
    }
    await ensureWatermarkFont(self.fonts, style, fontSize);
    drawWatermarkLayer(ctx, canvas.width, canvas.height, style, text, 1);

    if (exportOptions.format === 'jpeg') {
      const quality = Math.min(1, Math.max(0.6, exportOptions.jpegQuality / 100));
      const blob = await encodeCanvasToJpeg(canvas, quality);
      return { buffer: await blob.arrayBuffer(), mime: 'image/jpeg' };
    }

    const png = await canvas.convertToBlob({ type: 'image/png' });
    if (!png) {
      throw new Error('PNG 导出失败');
    }
    return { buffer: await png.arrayBuffer(), mime: 'image/png' };
  }
  finally {
    bitmap.close();
  }
}

type WorkerRequest = {
  id: string;
  type: string;
  file?: File;
  text?: string;
  style?: WatermarkStyle;
  exportOptions?: ExportOptions;
  harmonyFontUrl?: string;
};

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data || ({} as WorkerRequest);
  const { id, type } = msg;

  try {
    if (type !== 'export') {
      self.postMessage({ id, type, error: 'Unknown task' });
      return;
    }

    const { file, text, style, exportOptions } = msg;
    if (!file || text === undefined || !style || !exportOptions) {
      throw new Error('file/text/style/exportOptions required');
    }

    const result = await renderWatermarkedBlob(
      file,
      text,
      style,
      exportOptions,
      msg.harmonyFontUrl,
    );

    self.postMessage(
      {
        id,
        type,
        mime: result.mime,
        buffer: result.buffer,
      },
      [result.buffer],
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
