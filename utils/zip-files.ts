/**
 * 浏览器端打包 ZIP（fflate），替代 CDN JSZip。
 * 用于摄影边框 / 水印工具批量导出。
 */
import { zip } from 'fflate';

/**
 * 将路径 → 文件内容映射打成 ZIP Blob。
 * @param files 键为 zip 内相对路径（可用 `/` 表示目录）
 */
export function zipFilesToBlob(files: Record<string, Uint8Array>): Promise<Blob> {
  return new Promise((resolve, reject) => {
    zip(files, { level: 6 }, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(new Blob([data], { type: 'application/zip' }));
    });
  });
}

/** Blob → Uint8Array，供写入 ZIP */
export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}
