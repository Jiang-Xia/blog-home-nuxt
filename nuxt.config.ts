import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ["~/modules/sitemap", "@nuxtjs/tailwindcss"],
  sitemap: {
    hostname: "https://jiang-xia.top",
  },
  css: [
    // 'vant/lib/index.css'
    "@/assets/font/iconfont.css",
  ],
  build: {
    // Babel 转译特定的依赖关系（解决element-plus vue版本不一致打包报错问题）
  },
  head: {
    // 这里配置不生效
    script:[{ src: '' }]
  },
  router: {},
});
