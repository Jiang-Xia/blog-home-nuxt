import Icons from 'unplugin-icons/vite'
const prefixPath: any = process.env.VITE_NUXT_PREFIX_PATH
console.warn({
  BASE_URL: process.env.VITE_NUXT_BASE_URL,
  当前环境: process.env.NODE_ENV,
  prefixPath,
})
// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  // debug: process.env.NODE_ENV !== 'production',
  debug: false,
  modules: [
    '@vueuse/nuxt',
    '~/modules/sitemap',
    '@tailvue/nuxt'
    //  '@kevinmarrec/nuxt-pwa'
  ],
  sitemap: {
    hostname: 'https://jiang-xia.top',
  },
  // pwa: {
  //   workbox: {
  //     enabled: process.env.NODE_ENV === 'production',
  //   },
  //   manifest: {
  //     name: 'Blog',
  //     short_name: 'Blog',
  //   },
  // },
  // app: {
  //   pageTransition: {
  //     name: 'scale',
  //     appear: true,
  //     mode: 'out-in',
  //    },
  // },
  css: ['~/assets/css/main.css', '~/assets/font/iconfont.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  vite: {
    define: {},
    plugins: [
      Icons({
        // the feature below is experimental ⬇️
        autoInstall: true,
      })
    ],
  },
  // head: {
  //   // 这里配置不生效
  //   script: [{ src: '', }],
  // },
  router: {},
  // 此文件只能用process
  nitro: {
    // 配置代理
    devProxy: {
      [prefixPath]: {
        target: process.env.VITE_NUXT_BASE_URL,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(new RegExp(`^${prefixPath}`), ''),
      },
    },
  },
})
