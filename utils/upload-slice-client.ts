/**
 * 分片上传 Worker 客户端。
 * 优先 Vite module worker + hash-wasm（WASM MD5）；失败回退 public 经典 SparkMD5 Worker。
 * 哈希算法仍为 MD5，与服务端 uploadBigFile 约定兼容（hash 仅作续传目录键）。
 */

export type UploadSliceChunk = {
  fileContents: Blob;
  index: number;
  hash: string;
  fileName: string;
};

export type UploadSliceResult = {
  chunkList: UploadSliceChunk[];
  hash: string;
};

type WorkerOk = UploadSliceResult;
type WorkerErr = { error: string };

/** 创建 WASM MD5 module worker */
function createModuleWorker(): Worker {
  return new Worker(new URL('../workers/upload-slice.worker.ts', import.meta.url), {
    type: 'module',
  });
}

/** 回退：public 经典 Worker + SparkMD5 */
function createClassicWorker(): Worker {
  return new Worker('/js/workers/upload-slice-worker.js');
}

function runWorker(worker: Worker, file: File, chunkSize: number): Promise<UploadSliceResult> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      worker.onmessage = null;
      worker.onerror = null;
      worker.terminate();
    };

    worker.onerror = (err) => {
      cleanup();
      reject(err);
    };

    worker.onmessage = (e: MessageEvent<WorkerOk | WorkerErr>) => {
      const data = e.data;
      cleanup();
      if (data && 'error' in data && data.error) {
        reject(new Error(data.error));
        return;
      }
      const ok = data as WorkerOk;
      if (!ok?.chunkList || !ok.hash) {
        reject(new Error('Invalid worker result'));
        return;
      }
      resolve(ok);
    };

    worker.postMessage({ file, chunkSize });
  });
}

/**
 * 在 Worker 中切片并计算整文件 MD5。
 * 先试 WASM；失败则 SparkMD5，保证工具页可用。
 */
export async function createChunksByWorker(
  file: File,
  chunkSize: number,
): Promise<UploadSliceResult> {
  if (!import.meta.client || typeof Worker === 'undefined') {
    throw new Error('Worker unavailable');
  }

  try {
    return await runWorker(createModuleWorker(), file, chunkSize);
  }
  catch (err) {
    console.warn('[upload-slice] WASM MD5 Worker 失败，回退 SparkMD5', err);
    return runWorker(createClassicWorker(), file, chunkSize);
  }
}
