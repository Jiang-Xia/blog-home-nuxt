import { defineNuxtConfig } from "nuxt";
import Icons from "unplugin-icons/vite";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  /* 仅在开发和构建期间需要的模块 */
  modules: ["@vueuse/nuxt"],
  /* nuxt3构建时模块  */
  buildModules: ["~/modules/sitemap", "@nuxtjs/tailwindcss", "@tailvue/nuxt"],
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
  vite: {
    plugins: [
      Icons({
        // the feature below is experimental ⬇️
        autoInstall: true,
      }),
    ],
  },
  head: {
    // 这里配置不生效
    script: [{ src: "" }],
  },
  router: {},
});
