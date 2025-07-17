type BannerState = {
  copyright: string;
  copyrightlink: string;
  title: string;
  url: string;
};

interface queryState {
  page: number;
  pageSize: number;
  title: string;
  description: string;
  content: string;
}

interface StringKey {
  [propName: string]: any;
}

interface userInfoState {
  nickname: string;
  homepage: string;
  intro: string;
  avatar: string;
  uid: number | null;
  role: string;
}

declare const window: Window | any;

declare module 'js-cookie';

/* cdn start 以下全局对象由node_modules依赖改为cdn引入或者浏览器script脚本引入，全局对象使用。 */
// pdf.js全局对象
declare const pdfjsLib: any;
// pdf-lib全局对象
declare const PDFLib: any;
// rsa加密库全局对象
declare const JSEncrypt: any;

declare const SSE: any; // /tool/ai 用到
declare const Konva: any; // /photos 用到
declare const ExifReader: any; // photos 用到
declare const JSZip: any; // /tool/watermark 用到
declare const JsBarcode: any; // /tool/codes 用到
declare const html2canvas: any; // /tool/test 用到
declare const html2pdf: any; // /tool/test 用到
declare const SmoothSignature: any; // /tool/pdf 用到
declare const QRCode: any; // /tool/codes 用到
declare const sm2: any; // /tool/sm 用到

/* cdn end */
