// import vueQr from 'vue-qr'
// vue-qr.client.js client代表仅客户端引入 server代表仅服务端引入
export default defineNuxtPlugin(() => {
  // vue 实例使用组件库
  // 自定义组件可以显示
  // const XiaQr = defineComponent({
  //   name: 'XiaQr',
  //   setup (props, context) {
  //     console.log('XiaQr')
  //     return () => vueQr
  //   },
  // })
  // console.log(vueQr.name)
  /*
  使用组件都会报错 vue-qr本身不支持nuxt3
  const qr = nuxtApp.vueApp.use(vueQr)
  nuxtApp.vueApp.component(vueQr.name, vueQr) */
});
