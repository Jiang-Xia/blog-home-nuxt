interface configState {
  iconfonrUrl: string
  gifError: string
  gif404: string
}
const config: configState = {
  // 阿里巴巴图标库链接，新添加图标需要重新生成 css 改成js
  // 新增图标记得批量去色，不然修改不了图标颜色
  iconfonrUrl: '//at.alicdn.com/t/c/font_3114416_0ahervd1m007.js',
  // 500 error页动图
  gifError:
    'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-09-12/nm2t4fs18ix5ld2w6g1j1b-error.gif',
  // 404 页动图
  gif404:
    'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-09-12/hoyusqf2d051wy59rhmr26-404.gif',
}
const metaEnv: any = import.meta.env
const isEnv = metaEnv.MODE === 'development'
let baseUrl: string
let adminUrl: string
console.log({ metaEnv, })
if (metaEnv.MODE === 'production') {
  baseUrl = metaEnv.VITE_NUXT_BASE_URL
  adminUrl = metaEnv.VITE_NUXT_ADMIN_URL
} else {
  // 开代理本地报错非常多
  // baseUrl = metaEnv.VITE_NUXT_PREFIX_PATH
  // baseUrl = metaEnv.VITE_NUXT_BASE_URL
  baseUrl = metaEnv.VITE_NUXT_BASE_URL
  adminUrl = metaEnv.VITE_NUXT_ADMIN_URL
}
export { baseUrl, adminUrl, isEnv }
export default config
