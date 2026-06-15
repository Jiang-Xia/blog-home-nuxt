type WorkerReply = {
  id: string;
  type: string;
  data?: Record<string, string>;
  bitmap?: ImageBitmap;
  error?: string;
};

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<string, { resolve: (v: any) => void; reject: (e: Error) => void }>();

function ensureWorker(): Worker | null {
  if (!import.meta.client || typeof Worker === 'undefined') return null;
  if (!worker) {
    worker = new Worker('/js/workers/photo-worker.js');
    worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      const msg = event.data;
      const handler = pending.get(msg.id);
      if (!handler) return;
      pending.delete(msg.id);
      if (msg.error) {
        handler.reject(new Error(msg.error));
        return;
      }
      if (msg.type === 'exif') handler.resolve(msg.data || {});
      else if (msg.type === 'blur') handler.resolve(msg.bitmap);
      else handler.resolve(msg);
    };
    worker.onerror = () => {
      pending.forEach(({ reject }) => reject(new Error('Photo worker error')));
      pending.clear();
    };
  }
  return worker;
}

function runWorkerTask<T>(
  type: string,
  payload: Record<string, unknown>,
  transfer?: Transferable[],
): Promise<T> {
  const w = ensureWorker();
  if (!w) return Promise.reject(new Error('Worker unavailable'));

  const id = `${type}-${++seq}`;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ id, type, ...payload }, transfer || []);
  });
}

export function initPhotoWorker() {
  ensureWorker();
}

export function terminatePhotoWorker() {
  worker?.terminate();
  worker = null;
  pending.clear();
}

export function parseExifInWorker(buffer: ArrayBuffer): Promise<Record<string, string>> {
  return runWorkerTask<Record<string, string>>('exif', { buffer }, [buffer]);
}

export function createBlurInWorker(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  blur: number,
): Promise<ImageBitmap> {
  return runWorkerTask<ImageBitmap>('blur', { bitmap, width, height, blur, maxDim: 280 }, [bitmap]);
}
