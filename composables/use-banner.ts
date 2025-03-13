import { useState } from '#app';
/* 该文件夹也就是写hooks的 */
const banners = reactive<BannerState[]>([]);
// useState 的第一参数为 key，第二参数为初始化的工厂函数
export const useBanners = () => useState('banners', () => banners);

export default function () {
  return useState('banners', () => []);
}
