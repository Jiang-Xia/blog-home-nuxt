interface configState {
  iconfonrUrl: string,
  gifError: string,
  gif404: string,
}
const config: configState = {
  // 阿里巴巴图标库链接，新添加图标需要重新生成 css 改成js
  // 新增图标记得批量去色，不然修改不了图标颜色
  iconfonrUrl: '//at.alicdn.com/t/c/font_3114416_yf6c649zhse.js',
  // 500 error页动图
  gifError: 'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-09-12/nm2t4fs18ix5ld2w6g1j1b-error.gif',
  // 404 页动图
  gif404: 'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-09-12/hoyusqf2d051wy59rhmr26-404.gif',
}

let baseUrl: string
let adminUrl: string
const mode = import.meta.env.MODE
console.log(mode)
// x-api 后端服务
if (mode === 'production') {
  // baseUrl = 'http://42.192.145.236:5000'
  baseUrl = 'https://jiang-xia.top/x-blog/api/v1'
  adminUrl = 'https://admin.jiang-xia.top/login'
} else {
  // adminUrl = 'http://localhost:9856/login'
  // baseUrl = 'http://127.0.0.1:5000/api/v1'
  // baseUrl = 'http://42.192.145.236:5000'

  baseUrl = 'https://jiang-xia.top/x-blog/api/v1'
}
export { baseUrl, adminUrl }
console.log('baseUrl: ', baseUrl)
export default config
