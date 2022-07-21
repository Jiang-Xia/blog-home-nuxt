import { defineNuxtConfig } from "nuxt";
const lifecycle = process.env.npm_lifecycle_event;

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  css: [
    "element-plus/dist/index.css",
    // 'vant/lib/index.css'
    "@/assets/font/iconfont.css",
    "@/assets/css/atom-one-dark.css",
    "@arco-design/web-vue/dist/arco.css",
  ],
  build: {
    // Babel 转译特定的依赖关系（解决element-plus vue版本不一致打包报错问题）
    transpile:
      lifecycle === "build" || lifecycle === "generate"
        ? ["element-plus"]
        : ["compute-scroll-into-view"],
  },
  router: {
    // 改配置无效
    // scrollBehavior(to, from, savedPosition) {
    //   return { top: 0, left: 0, behavior: "smooth" };
    // },
  },
});
