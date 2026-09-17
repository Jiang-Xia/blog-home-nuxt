/**
 * 水印全分辨率导出 Worker 客户端。
 * 将原图解码、叠字与 JPEG WASM / PNG 编码卸到 Vite module worker，避免批量导出卡主线程；
 * Worker / OffscreenCanvas 不可用时由调用方回退主线程实现。
 */

import type { ExportOptions, WatermarkStyle } from './watermark-draw';

export interface WatermarkExportRequest {
  file: File;
  /** 完整水印文案（主线程生成，保证与预览日期一致） */
  text: string;
  style: WatermarkStyle;
  exportOptions: ExportOptions;
}

type WorkerReply = {
  id: string;
  type: string;
  mime?: string;
  buffer?: ArrayBuffer;
  error?: string;
};

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<
  string,
  { resolve: (v: WorkerReply) => void; reject: (e: Error) => void }
>();

/** 鸿蒙字体绝对 URL（Worker 内相对路径会相对 worker 脚本失效） */
export function getHarmonyWatermarkFontUrl(): string {
  if (!import.meta.client) return '';
  return new URL('/fonts/HarmonyOS_Sans_SC_Subset.woff2?v=1', window.location.origin).href;
}

/** 当前环境是否具备水印导出 Worker 所需能力 */
export function canUseWatermarkExportWorker(): boolean {
  return (
    import.meta.client
      && typeof Worker !== 'undefined'
      && typeof OffscreenCanvas !== 'undefined'
      && typeof createImageBitmap === 'function'
  );
}

/** 创建 Vite 打包的 module worker（内含 @jsquash/jpeg WASM） */
function createWatermarkExportWorker(): Worker {
  return new Worker(new URL('../workers/watermark-export.worker.ts', import.meta.url), {
    type: 'module',
  });
}

function ensureWorker(): Worker | null {
  if (!canUseWatermarkExportWorker()) return null;
  if (!worker) {
    worker = createWatermarkExportWorker();
    worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      const msg = event.data;
      const handler = pending.get(msg.id);
      if (!handler) return;
      pending.delete(msg.id);
      if (msg.error) {
        handler.reject(new Error(msg.error));
        return;
      }
      handler.resolve(msg);
    };
    worker.onerror = (ev) => {
      console.error('[watermark-export] Worker error', ev);
      pending.forEach(({ reject }) => reject(new Error('Watermark export worker error')));
      pending.clear();
      worker?.terminate();
      worker = null;
    };
  }
  return worker;
}

function runExport(req: WatermarkExportRequest): Promise<WorkerReply> {
  const w = ensureWorker();
  if (!w) return Promise.reject(new Error('Watermark export worker unavailable'));

  const id = `watermark-export-${++seq}`;
  return new Promise<WorkerReply>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({
      id,
      type: 'export',
      file: req.file,
      text: req.text,
      style: req.style,
      exportOptions: req.exportOptions,
      harmonyFontUrl: getHarmonyWatermarkFontUrl(),
    });
  });
}

/**
 * 在 Worker 中全分辨率叠水印并编码。
 * 失败时抛错，由上层回退主线程 Canvas 导出。
 */
export async function exportWatermarkInWorker(req: WatermarkExportRequest): Promise<Blob> {
  const reply = await runExport(req);
  if (!reply.buffer || !reply.mime) {
    throw new Error('Worker missing export buffer');
  }
  return new Blob([reply.buffer], { type: reply.mime });
}

/** 预热 Worker（进入水印页时可调用；首次 JPEG 导出还会触发 WASM 懒加载） */
export function initWatermarkExportWorker() {
  ensureWorker();
}

/** 释放 Worker（页面卸载时调用） */
export function terminateWatermarkExportWorker() {
  worker?.terminate();
  worker = null;
  pending.clear();
}
