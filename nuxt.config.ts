// https://nuxt.com/docs/api/configuration/nuxt-config
import Icons from 'unplugin-icons/vite';
import tailwindcss from '@tailwindcss/vite';

const prefixPath: any = process.env.VITE_NUXT_PREFIX_PATH;
// const configs = Object.keys(process.env)
//   .filter(k => k.toLocaleUpperCase().includes('VITE'))
//   .map((k) => {
//     return {
//       [k]: process.env[k],
//     };
//   });
console.warn('当前环境: ', process.env.VITE_ENV);
// console.warn({ 当前环境自定义配置: configs });
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '~/modules/sitemap',
    '~/modules/inspria-ui',
    '@tailvue/nuxt',
    '@pinia/nuxt',
  ],
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.staticfile.org/csshake/1.5.3/csshake.min.css',
        },
      ],
      script: [
        {
          defer: true,
          src: 'https://cdn.staticfile.net/pdf-lib/1.17.1/pdf-lib.min.js',
        },
        {
          defer: true,
          src: 'https://cdn.staticfile.net/pdf.js/3.9.179/pdf.min.js',
        },
        // { defer: true, src: 'jsencrypt.min.js' },
        { defer: true, src: 'https://cdn.staticfile.net/jsencrypt/3.3.2/jsencrypt.min.js' },
      ],
    },
    pageTransition: {
      name: 'scale',
      appear: true,
      mode: 'out-in',
    },
  },
  css: ['~/assets/css/main.css'],

  devServer: {
    // 证书安装 https://zhuanlan.zhihu.com/p/678165318
    https: false,
  },
  compatibilityDate: '2024-11-01',
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
  vite: {
    plugins: [
      tailwindcss(),
      Icons({
        // the feature below is experimental ⬇️
        autoInstall: true,
      }),
    ],
  },
  eslint: {
    config: {
      stylistic: {
        indent: 2, // 缩进
        semi: true, // 分号
        quotes: 'single', // 单引号
        jsx: true, // 支持jsx
      },
    },
  },
  sitemap: {
    hostname: 'https://jiang-xia.top',
  },
  stylelint: {
    /* module options */
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },
});
