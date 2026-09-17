/**
 * Canvas → JPEG：优先 @jsquash/jpeg（mozjpeg WASM），失败回退浏览器原生编码。
 * 供摄影边框、水印导出（主线程 HTMLCanvas / Worker OffscreenCanvas）共用。
 */

type JpegEncodeFn = (data: ImageData, options?: { quality?: number }) => Promise<ArrayBuffer>;

type JpegCanvasLike = {
  width: number;
  height: number;
  getContext: (contextId: '2d') => {
    getImageData: (sx: number, sy: number, sw: number, sh: number) => ImageData;
  } | null;
  toBlob?: (callback: (blob: Blob | null) => void, type?: string, quality?: number) => void;
  convertToBlob?: (options?: { type?: string; quality?: number }) => Promise<Blob>;
};

let jpegEncode: JpegEncodeFn | null = null;

/** 懒加载 mozjpeg WASM 编码器 */
async function getJpegEncode(): Promise<JpegEncodeFn> {
  if (!jpegEncode) {
    const mod = await import('@jsquash/jpeg/encode');
    jpegEncode = mod.default as JpegEncodeFn;
  }
  return jpegEncode;
}

/** HTMLCanvasElement.toBlob 回退 */
function canvasToJpegBlob(canvas: JpegCanvasLike, quality01: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== 'function') {
      reject(new Error('toBlob unavailable'));
      return;
    }
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('JPEG 导出失败'))),
      'image/jpeg',
      quality01,
    );
  });
}

/** OffscreenCanvas.convertToBlob 回退（Worker） */
async function offscreenToJpegBlob(canvas: JpegCanvasLike, quality01: number): Promise<Blob> {
  if (typeof canvas.convertToBlob !== 'function') {
    throw new Error('convertToBlob unavailable');
  }
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: quality01 });
  if (!blob) {
    throw new Error('JPEG 导出失败');
  }
  return blob;
}

/**
 * 将已绘制完成的 Canvas 编码为 JPEG Blob。
 * @param quality01 0–1，与 toBlob 第三参一致（如 0.92）
 */
export async function encodeCanvasToJpeg(
  canvas: HTMLCanvasElement | OffscreenCanvas | JpegCanvasLike,
  quality01 = 0.92,
): Promise<Blob> {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (typeof (canvas as JpegCanvasLike).convertToBlob === 'function') {
      return offscreenToJpegBlob(canvas as JpegCanvasLike, quality01);
    }
    return canvasToJpegBlob(canvas as JpegCanvasLike, quality01);
  }

  const quality100 = Math.round(Math.min(1, Math.max(0, quality01)) * 100);

  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const encode = await getJpegEncode();
    const buffer = await encode(imageData, { quality: quality100 });
    if (buffer?.byteLength > 0) {
      return new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' });
    }
  }
  catch (err) {
    console.warn('[jpeg-encode] WASM JPEG 失败，回退原生编码', err);
  }

  if (typeof (canvas as JpegCanvasLike).convertToBlob === 'function') {
    return offscreenToJpegBlob(canvas as JpegCanvasLike, quality01);
  }
  return canvasToJpegBlob(canvas as JpegCanvasLike, quality01);
}
