/**
 * PDF 字节缓冲工具：pdf.js getDocument({ data }) 可能把 ArrayBuffer transfer 给 worker 并 detach，
 * 业务侧缓存必须与传给 pdf.js 的副本分离，否则后续 pdf-lib 会报 detached ArrayBuffer。
 */

/** 将远程 URL / Blob URL 拉取为 ArrayBuffer */
export async function fetchPdfBuffer(src: string): Promise<ArrayBuffer> {
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error(`PDF 加载失败（HTTP ${res.status}）`);
  }
  return res.arrayBuffer();
}

/** 拷贝出独立 ArrayBuffer，避免与 pdf.js worker 共享同一块内存 */
export function cloneArrayBuffer(data: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (data instanceof ArrayBuffer) {
    return data.slice(0);
  }
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}
