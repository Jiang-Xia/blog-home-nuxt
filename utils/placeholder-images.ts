/**
 * 站点图片 URL 常量（路径字符串，按需请求；勿静态 import 大图进 modulepreload）。
 * 列表占位、失败图、错误页/404 装饰图统一放这里，勿再塞进 ~/config。
 */

/** 列表/卡片加载中占位 */
export const PLACEHOLDER_LOADING = '/img/loading3-min.gif';
/** 破图兜底 */
export const PLACEHOLDER_FAILED = '/img/load-failed.svg';

/** 全局 error 页（非 404）装饰图 — 仅 error.vue 使用 */
export const PAGE_ERROR_GIF
  = '/x-api/blog-server/static/uploads/2022-09-12/nm2t4fs18ix5ld2w6g1j1b-error.gif';
/** 404 页装饰图 — 仅 error.vue / pages/404 使用 */
export const PAGE_404_GIF
  = '/x-api/blog-server/static/uploads/2022-09-12/hoyusqf2d051wy59rhmr26-404.gif';
