import { defineNuxtConfig } from "nuxt";
import Icons from "unplugin-icons/vite";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  /* 仅在开发和构建期间需要的模块 */
  modules: ["@vueuse/nuxt"],
  /* nuxt3构建时模块  */
  buildModules: ["~/modules/sitemap","@tailvue/nuxt"],
  sitemap: {
    hostname: "https://jiang-xia.top",
  },
  
  css: [
    "~/assets/css/main.css",
    "~/assets/font/iconfont.css",
  ],
  build: {
    postcss: {
      postcssOptions: {
          plugins: {
              tailwindcss: {},
              autoprefixer: {},
          },
      },
    },
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
