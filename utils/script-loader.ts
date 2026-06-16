/**
 * 动态脚本加载工具
 * 用于按需加载第三方 CDN 脚本，避免首页加载过多脚本
 */

// 脚本加载状态缓存
const scriptStatus: Record<string, 'loading' | 'loaded' | 'error'> = {};
const scriptPromises: Record<string, Promise<void>> = {};

/**
 * 动态加载脚本
 * @param src 脚本地址
 * @param defer 是否延迟加载
 * @returns Promise
 */
export function loadScript(src: string, defer = true): Promise<void> {
  // 如果已经加载或正在加载,返回缓存的 Promise
  if (scriptStatus[src] === 'loaded') {
    return Promise.resolve();
  }
  if (scriptStatus[src] === 'loading' && scriptPromises[src]) {
    return scriptPromises[src];
  }

  // 创建新的加载 Promise
  scriptStatus[src] = 'loading';
  scriptPromises[src] = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = defer;

    script.onload = () => {
      scriptStatus[src] = 'loaded';
      resolve();
    };

    script.onerror = () => {
      scriptStatus[src] = 'error';
      reject(new Error(`Failed to load script: ${src}`));
    };

    document.head.appendChild(script);
  });

  return scriptPromises[src];
}

/**
 * 批量加载脚本
 * @param scripts 脚本地址数组
 * @returns Promise
 */
export function loadScripts(scripts: string[]): Promise<Array<void>> {
  return Promise.all(scripts.map(src => loadScript(src)));
}

/**
 * 预定义的脚本映射
 */
export const SCRIPTS = {
  // PDF 相关
  PDF_LIB: 'https://cdn.staticfile.net/pdf-lib/1.17.1/pdf-lib.min.js',
  PDF_JS: 'https://cdn.staticfile.net/pdf.js/3.9.179/pdf.min.js',

  // 加密相关
  JSENCRYPT:
    'https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-10/7746c5c31ccc4ae0b972fc1a5b8f1152-jsencrypt.min.js',
  SM2: '/js/cdn/sm-crypto/sm2.min.js',

  // 工具类
  JSZIP: 'https://cdn.staticfile.net/jszip/3.10.1/jszip.min.js',
  JSBARCODE: 'https://cdn.staticfile.net/jsbarcode/3.11.6/JsBarcode.all.min.js',
  HTML2PDF: 'https://cdn.staticfile.net/html2pdf.js/0.10.1/html2pdf.bundle.min.js',

  // 图形图像相关
  KONVA: 'https://unpkg.com/konva@9/konva.min.js',
  QRCODE: 'https://cdn.staticfile.net/qrcodejs/1.0.0/qrcode.min.js',
  SMOOTH_SIGNATURE: 'https://unpkg.com/smooth-signature/dist/index.umd.min.js',
  EXIF_READER: '/js/cdn/exif-reader.min.js',
};

/**
 * 加载 PDF 相关脚本
 */
export function loadPdfScripts(): Promise<Array<void>> {
  return loadScripts([SCRIPTS.PDF_LIB, SCRIPTS.PDF_JS, SCRIPTS.SMOOTH_SIGNATURE]);
}

/**
 * 加载 RSA 加密脚本
 */
export function loadRsaScript(): Promise<void> {
  return loadScript(SCRIPTS.JSENCRYPT);
}

/**
 * 加载国密 SM2 脚本
 */
export function loadSm2Script(): Promise<void> {
  return loadScript(SCRIPTS.SM2);
}

/**
 * 加载水印工具脚本
 */
export function loadWatermarkScripts(): Promise<Array<void>> {
  return loadScripts([SCRIPTS.JSZIP]);
}

/**
 * 加载条码生成脚本
 */
export function loadBarcodeScripts(): Promise<Array<void>> {
  return loadScripts([SCRIPTS.JSBARCODE, SCRIPTS.QRCODE]);
}

/**
 * 加载截图/导出脚本
 */
export function loadScreenshotScripts(): Promise<Array<void>> {
  return loadScripts([SCRIPTS.HTML2PDF]);
}

/**
 * 摄影工具：仅导出 ZIP 需要 JSZip（EXIF/模糊在 Web Worker 内处理）
 */
export function loadPhotoScripts(): Promise<Array<void>> {
  return loadScripts([SCRIPTS.JSZIP]);
}
