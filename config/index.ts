interface configState {
  iconfonrUrl: string
}
const config: configState = {
  // 阿里巴巴图标库链接，新添加图标需要重新生成 css 改成js
  iconfonrUrl: '//at.alicdn.com/t/c/font_3114416_6lowl4drli.js',
}

let baseUrl_: string
let adminUrl_: string
const mode = import.meta.env.MODE
console.log(mode)
// x-api 后端服务
if (mode === 'production') {
  // baseUrl = 'http://42.192.145.236:5000'
  baseUrl_ = 'https://jiang-xia.top/x-api/blog-server'
  adminUrl_ = 'https://admin.jiang-xia.top/login'
} else {
  adminUrl_ = 'http://localhost:9856/login'
  baseUrl_ = 'http://127.0.0.1:5000'
  // baseUrl_ = 'http://42.192.145.236:5000'
  // baseUrl_ = 'https://jiang-xia.top/x-api/blog-server'
}
const baseUrl: string = baseUrl_
const adminUrl: string = adminUrl_
export { baseUrl, adminUrl }
console.log('baseUrl: ', baseUrl)
export default config
