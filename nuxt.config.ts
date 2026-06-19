// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';
import { scripts } from './config';

const prefixPath = process.env.VITE_NUXT_PREFIX_PATH || '/api';
const originUrl = process.env.VITE_NUXT_ORIGIN_URL || '';
const apiPrefix = process.env.VITE_NUXT_API_PREFIX || '';
const proxyTarget = originUrl && apiPrefix ? `${originUrl}${apiPrefix}` : '';
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
    '@pinia/nuxt',
    '@nuxt/ui',
  ],
  devtools: { enabled: false },
  app: {
    head: {
      link: [
        {
          rel: 'preload',
          as: 'style',
          href: 'https://cdn.staticfile.org/csshake/1.5.3/csshake.min.css',
          onload: 'this.rel=\'stylesheet\';',
          // 需设置rel=stylesheet 不然不是样式,不生效
          /* rel: 'stylesheet',
          media: 'print',
          onload: 'this.media=\'all\'', 另一种方法 */
          // https://www.filamentgroup.com/lab/load-css-simpler/
        },
      ],
      script: scripts,
    },
    pageTransition: {
      name: 'fade',
      appear: true,
    },
  },
  css: ['~/assets/css/main.css'],
  ui: {
    prefix: 'U',
    fonts: false,
  },
  runtimeConfig: {
    aiSummaryApiKey: process.env.AI_SUMMARY_API_KEY || '',
    public: {},
  },
  build: {
    // 打包配置
    transpile: ['md-editor-v3'], // 预编译大型依赖
  },
  routeRules: {
    '/tool': { redirect: '/tool/sm' },
    '/photos': { redirect: '/tool/photos' },
  },
  devServer: {
    // 证书安装 https://zhuanlan.zhihu.com/p/678165318
    https: false,
  },
  compatibilityDate: '2025-07-14',
  // 此文件只能用process
  nitro: {
    output: {
      // dir: '', // 这个是配置总的输出路径
      // serverDir: '.output/server',
      // publicDir: '.output/public',
    },
    // 配置代理
    devProxy: {
      [prefixPath]: {
        target: proxyTarget,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(new RegExp(`^${prefixPath}`), ''),
      },
    },
    compressPublicAssets: {
      // 只压缩output/public目录的文件
      gzip: true,
      brotli: true,
    },
    // 优化 Nitro 构建
    minify: true,
    sourceMap: false, // 生产环境关闭 sourceMap
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: 'esbuild',
      // 优化构建性能
      target: 'esnext',
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: ['md-editor-v3', 'crypto-js'],
    },
    // 减少不必要的处理
    css: {
      devSourcemap: false,
    },
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
