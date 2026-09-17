/**
 * 前端图片压缩：头像/封面/文章图上传前缩放编码。
 * 优先走 Vite module worker（OffscreenCanvas + @jsquash/webp WASM），不可用时回退主线程 Canvas。
 * 数据流：File → compressImageFile / compressAndHashImage → api/resources 上传。
 */
import {
  canUseMediaCompressWorker,
  compressAndHashInWorker,
  type MediaCompressConfig,
} from '@/utils/media-compress-client';

export type ImageCompressPreset = 'avatar' | 'cover' | 'article';

interface PresetConfig {
  maxWidth: number;
  maxHeight?: number;
  quality: number;
  fit: 'cover' | 'inside';
}

/** 封面压缩输出尺寸（Open Graph 分享图标准 1200×630），也是各端封面展示宽高比的唯一来源 */
export const COVER_IMAGE = {
  maxWidth: 1200,
  maxHeight: 630,
} as const;

/** 供 CSS `aspect-ratio: v-bind(...)` 使用 */
export const coverAspectRatio = `${COVER_IMAGE.maxWidth} / ${COVER_IMAGE.maxHeight}`;

const PRESET_MAP: Record<ImageCompressPreset, PresetConfig> = {
  avatar: { maxWidth: 400, maxHeight: 400, quality: 0.82, fit: 'cover' },
  cover: {
    maxWidth: COVER_IMAGE.maxWidth,
    maxHeight: COVER_IMAGE.maxHeight,
    quality: 0.82,
    fit: 'cover',
  },
  article: { maxWidth: 800, quality: 0.75, fit: 'inside' },
};

const SKIP_TYPES = new Set(['image/gif', 'image/svg+xml']);

/** 取出与 Worker 约定一致的压缩配置 */
export function getImageCompressConfig(preset: ImageCompressPreset): MediaCompressConfig {
  return { ...PRESET_MAP[preset] };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function logCompressResult(preset: ImageCompressPreset, file: File, result: File, skipped = false) {
  if (skipped) {
    console.log(
      `[image-compress:${preset}] ${file.name}: 跳过压缩 (${file.type || 'unknown'})，${formatFileSize(file.size)}`,
    );
    return;
  }
  const ratio = file.size > 0 ? ((1 - result.size / file.size) * 100).toFixed(1) : '0.0';
  console.log(
    `[image-compress:${preset}] ${file.name}: ${formatFileSize(file.size)} → ${formatFileSize(result.size)} (减小 ${ratio}%)`,
  );
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };
    img.src = url;
  });
}

function calcTargetSize(
  sourceWidth: number,
  sourceHeight: number,
  preset: PresetConfig,
): { width: number; height: number; sx: number; sy: number; sw: number; sh: number } {
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
 * 主线程 Canvas 压缩（Worker 不可用或失败时的回退路径）
 */
async function compressImageFileOnMain(file: File, preset: ImageCompressPreset): Promise<File> {
  if (!file.type.startsWith('image/') || SKIP_TYPES.has(file.type)) {
    logCompressResult(preset, file, file, true);
    return file;
  }
  const beforeSize = file.size;
  const config = PRESET_MAP[preset];
  const image = await loadImageFromFile(file);
  const { width, height, sx, sy, sw, sh } = calcTargetSize(
    image.naturalWidth,
    image.naturalHeight,
    config,
  );
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    logCompressResult(preset, file, file, true);
    return file;
  }
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);

  const mime = canvas.toDataURL('image/webp').startsWith('data:image/webp')
    ? 'image/webp'
    : 'image/jpeg';
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(result => resolve(result), mime, config.quality);
  });
  if (!blob) {
    logCompressResult(preset, file, file, true);
    return file;
  }

  const ext = mime === 'image/webp' ? '.webp' : '.jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  const compressed = new File([blob], `${baseName}${ext}`, {
    type: mime,
    lastModified: Date.now(),
  });
  if (compressed.size >= beforeSize) {
    console.log(
      `[image-compress:${preset}] ${file.name}: 压缩后体积未减小，保留原文件 ${formatFileSize(beforeSize)}`,
    );
    return file;
  }
  logCompressResult(preset, file, compressed);
  return compressed;
}

/**
 * 压缩图片并计算原图 SHA-256（上传主路径：一次任务完成两件事）。
 * 优先 Worker；失败回退主线程压缩 + subtle/crypto-js 哈希。
 */
export async function compressAndHashImage(
  file: File,
  preset: ImageCompressPreset,
): Promise<{ file: File; contentHash: string }> {
  if (canUseMediaCompressWorker()) {
    try {
      const result = await compressAndHashInWorker(file, getImageCompressConfig(preset));
      if (result.skipped) {
        logCompressResult(preset, file, result.file, true);
      }
      else {
        logCompressResult(preset, file, result.file);
      }
      return { file: result.file, contentHash: result.contentHash };
    }
    catch (err) {
      console.warn('[image-compress] Worker 失败，回退主线程', err);
    }
  }

  const [contentHash, compressed] = await Promise.all([
    sha256HexOnMain(file),
    compressImageFileOnMain(file, preset),
  ]);
  return { file: compressed, contentHash };
}

/** 主线程 SHA-256（与 file-hash 行为一致，避免循环依赖） */
async function sha256HexOnMain(file: Blob): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // 非安全上下文：与 file-hash 相同回退 crypto-js
  const CryptoJS = (await import('crypto-js')).default;
  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(await file.arrayBuffer()));
  return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
}

/** 前端压缩图片，输出 WebP（不支持时回退 JPEG）；优先 Worker */
export async function compressImageFile(file: File, preset: ImageCompressPreset): Promise<File> {
  const { file: compressed } = await compressAndHashImage(file, preset);
  return compressed;
}
