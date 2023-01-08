import Icons from 'unplugin-icons/vite'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ['@vueuse/nuxt', '~/modules/sitemap', '@tailvue/nuxt'], // '@kevinmarrec/nuxt-pwa'
  sitemap: {
    hostname: 'https://jiang-xia.top',
  },
  // pwa: {
  //   workbox: {
  //     enabled: false, // 开发模式也启动
  //   },
  //   manifest: {
  //     name: 'xia',
  //     short_name: 'xia',
  //     icons: [
  //       {
  //         src: '/android-chrome-192x192.png',
  //         sizes: '192x192',
  //         type: 'image/png',
  //         purpose: 'any',
  //       },
  //       {
  //         src: '/android-chrome-512x512.png',
  //         sizes: '512x512',
  //         type: 'image/png',
  //         purpose: 'any',
  //       }
  //     ],
  //     theme_color: '#ffffff',
  //     background_color: '#ffffff',
  //     display: 'standalone',
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
})
