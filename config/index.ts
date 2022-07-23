interface configState {
  iconfonrUrl: string
}
const config: configState = {
  // 阿里巴巴图标库链接，新添加图标需要重新生成 css 改成js
  iconfonrUrl: '//at.alicdn.com/t/font_3114416_q86z969eeh.js'
}

export let baseUrl: string
const mode = import.meta.env.MODE
console.log(mode)
// x-api 后端服务
if (mode === 'production') {
  // baseUrl = 'http://42.192.145.236:5000'
  baseUrl = 'https://jiang-xia.top/x-api/blog-server'
} else {
  baseUrl = 'http://localhost:5000'
  // baseUrl = 'http://42.192.145.236:5000'
  // baseUrl = 'https://jiang-xia.top/x-api/blog-server'
}
console.log('baseUrl: ', baseUrl)
export default config
