import CryptoJS from 'crypto-js';
import { resolveStaticUrl } from '@/utils/static-url';
import { compressImageFile, type ImageCompressPreset } from '@/utils/image-compress';

function digestSha256Hex(buffer: ArrayBuffer): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    return crypto.subtle.digest('SHA-256', buffer).then(hashBuffer =>
      Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
    );
  }
  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buffer));
  return Promise.resolve(CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex));
}

/** 计算 Blob/File 的 SHA-256（非 HTTPS 环境回退 crypto-js） */
export async function computeFileSha256(file: Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  return digestSha256Hex(buffer);
}

/** 从完整 URL 或 /static 路径提取静态资源 pathname */
export function toStaticPath(url: string): string {
  if (!url) return '';
  if (url.startsWith('/static')) return url;
  try {
    const pathname = new URL(url).pathname;
    if (pathname.startsWith('/static')) return pathname;
  }
  catch {
    // 非绝对 URL，按原样返回
  }
  return url;
}

function basenameMatchesHash(basename: string, hash: string): boolean {
  if (!basename || !hash) return false;
  if (basename.startsWith(`${hash}.`)) return true;
  return basename === hash;
}

/**
 * 判断原图是否与当前已用媒体相同（基于原图 hash，不受 Canvas 压缩影响）
 */
export async function isSameMediaContent(
  originalFile: File,
  currentUrl: string,
  preset: ImageCompressPreset,
): Promise<boolean> {
  if (!currentUrl || (preset === 'avatar' && currentUrl.includes('default'))) {
    return false;
  }

  const originalHash = await computeFileSha256(originalFile);
  const basename = toStaticPath(currentUrl).split('/').pop() || '';
  if (basenameMatchesHash(basename, originalHash)) {
    return true;
  }

  // 兼容旧版 UUID 命名：压缩后与线上已存文件字节比对
  try {
    const compressed = await compressImageFile(originalFile, preset);
    const res = await fetch(resolveStaticUrl(currentUrl));
    if (!res.ok) return false;
    const blob = await res.blob();
    const [remoteHash, localHash] = await Promise.all([
      computeFileSha256(blob),
      computeFileSha256(compressed),
    ]);
    return remoteHash === localHash;
  }
  catch {
    return false;
  }
}

/** 判断原图是否与当前头像相同 */
export function isSameAvatarContent(
  originalFile: File,
  currentAvatarUrl: string,
): Promise<boolean> {
  return isSameMediaContent(originalFile, currentAvatarUrl, 'avatar');
}

/** 判断原图是否与当前封面相同 */
export function isSameCoverContent(originalFile: File, currentCoverUrl: string): Promise<boolean> {
  return isSameMediaContent(originalFile, currentCoverUrl, 'cover');
}
