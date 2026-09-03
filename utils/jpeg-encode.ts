/**
 * Canvas → JPEG：优先 @jsquash/jpeg（mozjpeg WASM），失败回退 canvas.toBlob。
 * 供摄影边框等导出路径使用；quality 与 Canvas 约定一致（0–1）。
 */

type JpegEncodeFn = (data: ImageData, options?: { quality?: number }) => Promise<ArrayBuffer>;

let jpegEncode: JpegEncodeFn | null = null;

/** 懒加载 mozjpeg WASM 编码器 */
async function getJpegEncode(): Promise<JpegEncodeFn> {
  if (!jpegEncode) {
    const mod = await import('@jsquash/jpeg/encode');
    jpegEncode = mod.default as JpegEncodeFn;
  }
  return jpegEncode;
}

/** Canvas toBlob 回退（浏览器原生 JPEG） */
function canvasToJpegBlob(canvas: HTMLCanvasElement, quality01: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('JPEG 导出失败'))),
      'image/jpeg',
      quality01,
    );
  });
}

/**
 * 将已绘制完成的 Canvas 编码为 JPEG Blob。
 * @param quality01 0–1，与原先 toBlob 第三参一致（如 0.92）
 */
export async function encodeCanvasToJpeg(
  canvas: HTMLCanvasElement,
  quality01 = 0.92,
): Promise<Blob> {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvasToJpegBlob(canvas, quality01);
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
    console.warn('[jpeg-encode] WASM JPEG 失败，回退 toBlob', err);
  }

  return canvasToJpegBlob(canvas, quality01);
}
