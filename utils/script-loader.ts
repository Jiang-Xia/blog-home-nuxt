/**
 * 动态脚本加载工具
 * 用于按需加载第三方脚本（优先本地 /js/cdn），避免首页加载过多脚本
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
  // PDF 相关（本地静态资源，避免 CDN 不可用）
  PDF_LIB: '/js/cdn/pdf-lib.min.js',
  PDF_JS: '/js/cdn/pdf.min.js',
  PDF_JS_WORKER: '/js/cdn/pdf.worker.min.js',

  // 加密相关
  JSENCRYPT: '/js/cdn/jsencrypt.min.js',
  SM2: '/js/cdn/sm-crypto/sm2.min.js',
  SM4: '/js/cdn/sm-crypto/sm4.min.js',

  // 工具类
  JSZIP: '/js/cdn/jszip.min.js',
  JSBARCODE: '/js/cdn/JsBarcode.all.min.js',
  HTML2PDF: '/js/cdn/html2pdf.bundle.min.js',

  // 图形图像相关
  KONVA: '/js/cdn/konva.min.js',
  QRCODE: '/js/cdn/qrcode.min.js',
  SMOOTH_SIGNATURE: '/js/cdn/smooth-signature.umd.min.js',
  EXIF_READER: '/js/cdn/exif-reader.min.js',
};

/**
 * 加载 PDF 相关脚本，并在 pdf.js 就绪后配置 Worker（v3 必需）
 */
export async function loadPdfScripts(): Promise<void> {
  await loadScripts([SCRIPTS.PDF_LIB, SCRIPTS.PDF_JS, SCRIPTS.SMOOTH_SIGNATURE]);
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = SCRIPTS.PDF_JS_WORKER;
  }
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
 * 加载国密 SM4 脚本（对称加密工具按需加载）
 */
export function loadSm4Script(): Promise<void> {
  return loadScript(SCRIPTS.SM4);
}

/**
 * 加载水印工具脚本（历史 CDN JSZip；批量导出已改用 fflate，一般无需再调）
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
 * 摄影工具脚本（历史 CDN JSZip；批量导出已改用 utils/zip-files + fflate，一般无需再调）
 */
export function loadPhotoScripts(): Promise<Array<void>> {
  return loadScripts([SCRIPTS.JSZIP]);
}
