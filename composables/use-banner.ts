import { useState } from '#app';
/* 该文件夹也就是写hooks的 */
const banners = reactive<BannerState[]>([
  {
    copyright: 'string',
    copyrightlink: 'string',
    title: 'string',
    url: 'https://jiang-xia.top/x-blog/api/v1/static/uploads/2022-09-22/yv1202s79jxh31qrg28xqk-%E9%87%91%E6%AF%9B.jpg',
  },
]);
// useState 的第一参数为 key，第二参数为初始化的工厂函数
export const useBanners = () => useState('banners', () => banners);

export default function () {
  return useState('banners', () => []);
}
