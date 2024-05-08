// import { fileURLToPath } from 'node:url'
// import fs from 'fs'
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
  devtools: { enabled: false, },
  modules: [
    '@vueuse/nuxt',
    '~/modules/sitemap',
    '@tailvue/nuxt',
    '@pinia/nuxt'
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
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://cdn.staticfile.org/csshake/1.5.3/csshake.min.css', }
      ],
      script: [
        { defer: true, src: 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js', },
        { defer: true, src: 'https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.min.js', }
      ],
    },
    pageTransition: {
      name: 'scale',
      appear: true,
      mode: 'out-in',
    },
  },
  // build: {
  //   // 打开分析报告
  //   analyze: true,
  // },
  // buildDir: 'dist',
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  js: [],
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
  devServer: {
    // 证书安装 https://zhuanlan.zhihu.com/p/678165318
    https: true,
  },
})
