const ViteEnv: any = import.meta.env;
const isEnv = ViteEnv.MODE === 'development';
let baseUrl: string;
let adminUrl: string;
let originUrl: string;
let apiPrefix: string;
// console.warn({ ViteEnv });
if (ViteEnv.MODE === 'production') {
  originUrl = ViteEnv.VITE_NUXT_ORIGIN_URL;
  apiPrefix = ViteEnv.VITE_NUXT_API_PREFIX;
  baseUrl = originUrl + apiPrefix;
  adminUrl = ViteEnv.VITE_NUXT_ADMIN_URL;
}
else {
  // 开代理本地报错非常多
  originUrl = ViteEnv.VITE_NUXT_ORIGIN_URL;
  apiPrefix = ViteEnv.VITE_NUXT_API_PREFIX;
  baseUrl = originUrl + apiPrefix;
  adminUrl = ViteEnv.VITE_NUXT_ADMIN_URL;
}

const scripts = [
  // 百度统计脚本
  { defer: true, src: 'https://hm.baidu.com/hm.js?9c1165af167360b492031753308c3878' },
  {
    defer: true,
    src: 'https://cdn.staticfile.net/pdf-lib/1.17.1/pdf-lib.min.js',
  },
  {
    defer: true,
    src: 'https://cdn.staticfile.net/pdf.js/3.9.179/pdf.min.js',
  },
  { defer: true, src: 'https://cdn.staticfile.net/jsencrypt/3.3.2/jsencrypt.min.js' },
  { defer: true, src: 'https://cdn.staticfile.net/jszip/3.10.1/jszip.min.js' },
  { defer: true, src: 'https://cdn.staticfile.net/jsbarcode/3.11.6/JsBarcode.all.min.js' },
  { defer: true, src: 'https://cdn.staticfile.net/html2pdf.js/0.10.1/html2pdf.bundle.min.js' },
  { defer: true, src: 'https://cdn.staticfile.net/html2canvas/1.4.1/html2canvas.min.js' },

  { defer: true, src: 'https://unpkg.com/konva@9/konva.min.js' },
  { defer: true, src: 'https://unpkg.com/qrcode@1.5.0/build/qrcode.js' },
  { defer: true, src: 'https://unpkg.com/smooth-signature/dist/index.umd.min.js' },

  { defer: true, src: '/js/cdn/exif-reader.min.js' },
  { defer: true, src: '/js/cdn/sm-crypto/sm2.min.js' },
];

interface configState {
  iconfonrUrl: string;
  gifError: string;
  gif404: string;
}
const config: configState = {
  // 阿里巴巴图标库链接，新添加图标需要重新生成 css 改成js
  // 新增图标记得批量去色，不然修改不了图标颜色
  iconfonrUrl: '//at.alicdn.com/t/c/font_3114416_u8bojntxov.js',
  // 500 error页动图
  gifError:
    originUrl + '/x-api/blog-server/static/uploads/2022-09-12/nm2t4fs18ix5ld2w6g1j1b-error.gif',
  // 404 页动图
  gif404: originUrl + '/x-api/blog-server/static/uploads/2022-09-12/hoyusqf2d051wy59rhmr26-404.gif',
};

export { baseUrl, originUrl, apiPrefix, adminUrl, isEnv, scripts };
export default config;
