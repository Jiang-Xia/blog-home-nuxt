// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';
import { buildThemeBootScript } from './constants/theme-tone';
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
// 子集字体 cache bust；npm run font:subset 且字符集变化后递增
const FONT_SUBSET_VERSION = '1';
// console.warn({ 当前环境自定义配置: configs });
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@nuxtjs/sitemap',
    '~/modules/inspria-ui',
    '@pinia/nuxt',
    '@nuxt/ui',
  ],
  devtools: { enabled: false },
  app: {
    head: {
      link: [
        {
          // 与 styles/base/app.less 中 @font-face 的 ?v= 保持一致
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: `/fonts/HarmonyOS_Sans_SC_Subset.woff2?v=${FONT_SUBSET_VERSION}`,
          crossorigin: 'anonymous',
        },
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
      script: [
        { innerHTML: buildThemeBootScript(), key: 'theme-boot', tagPriority: 'critical' },
        ...scripts,
      ],
    },
    pageTransition: {
      name: 'fade',
      mode: 'out-in',
    },
  },
  css: ['~/assets/css/main.css'],
  site: {
    url: originUrl || 'https://jiang-xia.top',
  },
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
      // 本地上传封面/头像：/static → blog-server:5000（与生产 /x-api/blog-server/static 对应）
      '/static': {
        target: originUrl || 'http://localhost:5000',
        changeOrigin: true,
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
    sources: ['/api/__sitemap__/urls'],
  },
  stylelint: {
    /* module options */
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },
});
