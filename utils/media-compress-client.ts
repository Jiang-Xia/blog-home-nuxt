/**
 * 媒体压缩 Worker 客户端。
 * 将头像/封面/文章图的缩放与 WASM WebP 编码、原图 SHA-256 卸到 Vite module worker；
 * Worker / OffscreenCanvas 不可用时由调用方回退主线程实现。
 */

export type MediaCompressFit = 'cover' | 'inside';

/** 与 image-compress 预设一致，由主线程下发避免 Worker 双份配置漂移 */
export interface MediaCompressConfig {
  maxWidth: number;
  maxHeight?: number;
  quality: number;
  fit: MediaCompressFit;
}

export interface CompressAndHashResult {
  /** 压缩后文件；skipped 时为原文件 */
  file: File;
  /** 原图 SHA-256（hex），供 upload-media contentHash */
  contentHash: string;
  /** true 表示未压缩（跳过类型 / 体积未减小） */
  skipped: boolean;
}

type WorkerReply = {
  id: string;
  type: string;
  contentHash?: string;
  skipped?: boolean;
  mime?: string;
  fileName?: string;
  size?: number;
  buffer?: ArrayBuffer;
  error?: string;
};

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<
  string,
  { resolve: (v: WorkerReply) => void; reject: (e: Error) => void }
>();

/** 当前环境是否具备媒体 Worker 所需能力 */
export function canUseMediaCompressWorker(): boolean {
  return (
    import.meta.client
      && typeof Worker !== 'undefined'
      && typeof OffscreenCanvas !== 'undefined'
      && typeof createImageBitmap === 'function'
  );
}

/** 创建 Vite 打包的 module worker（内含 @jsquash/webp WASM） */
function createMediaCompressWorker(): Worker {
  return new Worker(new URL('../workers/media-compress.worker.ts', import.meta.url), {
    type: 'module',
  });
}

function ensureWorker(): Worker | null {
  if (!canUseMediaCompressWorker()) return null;
  if (!worker) {
    worker = createMediaCompressWorker();
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
      console.error('[media-compress] Worker error', ev);
      pending.forEach(({ reject }) => reject(new Error('Media compress worker error')));
      pending.clear();
      worker?.terminate();
      worker = null;
    };
  }
  return worker;
}

function runCompressAndHash(file: File, config: MediaCompressConfig): Promise<WorkerReply> {
  const w = ensureWorker();
  if (!w) return Promise.reject(new Error('Media compress worker unavailable'));

  const id = `compress-and-hash-${++seq}`;
  return new Promise<WorkerReply>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    // File 可结构化克隆，无需 Transferable
    w.postMessage({ id, type: 'compress-and-hash', file, config });
  });
}

/**
 * 在 Worker 中 WASM 压缩图片并计算原图 SHA-256。
 * 失败时抛错，由上层回退主线程 compress + hash。
 */
export async function compressAndHashInWorker(
  file: File,
  config: MediaCompressConfig,
): Promise<CompressAndHashResult> {
  const reply = await runCompressAndHash(file, config);
  if (!reply.contentHash) {
    throw new Error('Worker missing contentHash');
  }
  if (reply.skipped || !reply.buffer || !reply.mime || !reply.fileName) {
    return { file, contentHash: reply.contentHash, skipped: true };
  }
  const compressed = new File([reply.buffer], reply.fileName, {
    type: reply.mime,
    lastModified: Date.now(),
  });
  return { file: compressed, contentHash: reply.contentHash, skipped: false };
}

/** 预热 Worker（可选，进入编辑页时可调用；首次还会触发 WASM 懒加载） */
export function initMediaCompressWorker() {
  ensureWorker();
}

/** 释放 Worker（页面卸载时可选调用） */
export function terminateMediaCompressWorker() {
  worker?.terminate();
  worker = null;
  pending.clear();
}
