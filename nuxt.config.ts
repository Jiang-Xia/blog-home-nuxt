import { defineNuxtConfig } from "nuxt";
const lifecycle = process.env.npm_lifecycle_event;

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ['~/modules/sitemap'],
  sitemap: {
    hostname: 'https://jiang-xia.top',
  },
  css: [
    "element-plus/dist/index.css",
    "element-plus/theme-chalk/dark/css-vars.css",
    // 'vant/lib/index.css'
    "@/assets/font/iconfont.css",
  ],
  build: {
    // Babel 转译特定的依赖关系（解决element-plus vue版本不一致打包报错问题）
    transpile:
      lifecycle === "build" || lifecycle === "generate"
        ? ["element-plus"]
        : ["compute-scroll-into-view"],
  },
  router: {
  },
});
