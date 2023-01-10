import Icons from 'unplugin-icons/vite'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ['@vueuse/nuxt', '~/modules/sitemap', '@tailvue/nuxt','@kevinmarrec/nuxt-pwa'], // 
  sitemap: {
    hostname: 'https://jiang-xia.top',
  },
  pwa: {
    workbox: {
      enabled: false, // 开发模式也启动
    }
  },
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
