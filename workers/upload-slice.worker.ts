/**
 * 分片上传 Worker：按 chunk 切文件并用 hash-wasm（WASM MD5）算整文件指纹。
 * 输出仍为 MD5 hex，与原先 SparkMD5 一致，服务端仅把 hash 当续传键，无需改协议。
 */
/// <reference lib="webworker" />

import { createMD5 } from 'hash-wasm';

const DefaultChunkSize = 2097152; // 2MB

type ChunkItem = {
  fileContents: Blob;
  index: number;
  hash: string;
  fileName: string;
};

type WorkerRequest = {
  file?: File;
  chunkSize?: number;
};

/**
 * 顺序读切片：一边累计 MD5，一边组装待上传分片列表。
 */
async function createChunks(file: File, chunkSize: number) {
  const fileName = file.name;
  const chunkList: ChunkItem[] = [];
  const chunks = Math.ceil(file.size / chunkSize) || 1;
  const hasher = await createMD5();
  hasher.init();

  for (let currentChunk = 0; currentChunk < chunks; currentChunk++) {
    const start = currentChunk * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const sliceFile = file.slice(start, end);
    const buffer = await sliceFile.arrayBuffer();
    hasher.update(new Uint8Array(buffer));
    chunkList.push({
      fileContents: sliceFile,
      index: currentChunk,
      hash: '',
      fileName,
    });
  }

  const hash = hasher.digest();
  chunkList.forEach((v) => {
    v.hash = hash;
  });
  return { chunkList, hash };
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  try {
    const file = event.data?.file;
    if (!file) {
      throw new Error('file required');
    }
    const chunkSize = event.data.chunkSize || DefaultChunkSize;
    const result = await createChunks(file, chunkSize);
    self.postMessage(result);
  }
  catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export {};
