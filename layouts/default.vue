<script setup lang="ts">
/* / 路径显示的默认页面 */
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import { dailyImage } from '~~/api/article.js';
import { originUrl } from '~/config';

/* 获取全局banner数据 */
const banners = useBanners();
const { data: imagesData } = await useAsyncData('index_GetIMG', () => dailyImage(7));
if (imagesData.value) {
  banners.value = imagesData.value.images.map((v: any) => {
    const { copyright, copyrightlink, title } = v;
    return {
      copyright,
      copyrightlink,
      title,
      url: 'https://cn.bing.com' + v.url,
    };
  });
}

onMounted(() => {
  if (!Cookies.get('browserId')) {
    Cookies.set('browserId', dayjs().valueOf().toString(), { expires: 7 });
  }
});
useHead({
  htmlAttrs: {
    lang: 'zh-CN',
  },
  meta: [
    // Meta Language
    {
      charset: 'utf-8',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1',
    },
    {
      'http-equiv': 'Content-Type',
      'content': 'text/html',
    },
    {
      // 百度抓取不可转码
      'http-equiv': 'Cache-Control',
      'content': 'no-transform',
    },
    {
      'http-equiv': 'Cache-Control',
      'content': 'no-siteapp',
    },
    {
      name: 'renderer',
      content: 'webkit',
    },
    {
      name: 'Keywords',
      content: '前端、后端技术分享，工作心得分享，生活情感分享，个人的一片小天地！',
    },
    {
      name: 'description',
      content:
          '本站可以检索查看文章，网站留言，注册登录之后可以在本站自己发表文章评论文章等操作；个人博客，用于个人学习、工作、生活上的记录和分享。分享学习上难题与心得；分享工作上的技巧和困难；分享生活的各种点滴。记录生活记录你，互联网的记忆在这里。',
    },
    {
      // 爬虫使用
      name: 'robots',
      content: 'all',
    },
    {
      // 网页制作
      name: 'generator',
      content: 'VS Code',
    },
    /* 用于搜狗和百度网站校验 */
    {
      name: 'sogou_site_verification',
      content: 'wlGpCfHqms',
    },
    {
      name: 'baidu-site-verification',
      content: 'code-2z8gzm5xfP',
    },
    {
      name: 'msvalidate.01',
      content: 'AB624FA682D2615512411976A22082DB',
    },
    {
      name: 'author',
      content: '江夏, 963798512@qq.com',
    },
  ],
  // 百度统计
  script: [],
  link: [{ rel: 'shortcut icon', href: originUrl + '/favicon.ico' }],
});
// 博客运行时间
const runTime = Math.ceil((dayjs().unix() - dayjs('2022-03-01').unix()) / (24 * 60 * 60));

const route = useRoute();
const showGlobalBacktop = computed(() => !route.path.startsWith('/detail/'));
</script>

<template>
  <div class="app-layout tech-shell min-h-screen bg-tech-shell text-tech">
    <CyberBackground />
    <header class="app-layout-header border-b border-tech bg-tech-header backdrop-blur-md">
      <Nav />
    </header>
    <div class="app-layout-body">
      <NuxtPage />
    </div>
    <footer class="app-layout-footer border-t border-tech text-tech-subtle">
      <p>
        博客已平稳运行 {{ runTime }} 天
        <a
          :href="originUrl + '/sitemap.xml'"
          target="_blank"
          class="link link-hover text-tech-muted"
        >SITEMAP</a>
      </p>
      <p>
        <NuxtLink
          target="_blank"
          href="https://beian.miit.gov.cn/#/Integrated/recordQuery"
          class="text-tech-subtle hover:text-tech-muted"
        >
          桂ICP备2022001119号-1
        </NuxtLink>
      </p>
      <p class="text-tech-faint">
        Powered By Typescript & Vue3 & Nuxt3 & Tailwindcss & DaisyUI & Node.js & NestJS
      </p>
    </footer>
    <!-- 回到顶部（文章详情页由冒险 FAB 提供） -->
    <xia-backtop v-if="showGlobalBacktop" class="shake-slow right-4">
      <xia-icon icon="blog-rocket4" width="34px" height="34px" />
    </xia-backtop>
    <RpgGlobalInit />
  </div>
</template>

<style lang="less">
  /* 这样写法好像也怎么只管看到类名，也不利于根据类名搜索 */
  body {
    // background: var(--main-bgc);
    // color: var(--hover-color);
  }
  .app-layout {
    // background: var(--main-bgc);
    // color: var(--text-color);
    min-height: 100vh;

    // 会编译成和 & 同级类名即 app-layout-header
    &-header {
      box-sizing: border-box;
      width: 100%;
      z-index: 10010;
      top: 0px;
      left: 0px;
      position: fixed;
      transition: all 0.4s ease;
    }

    &-body {
      min-height: calc(100vh - 120px);
      padding-top: 64px;
    }

    &-footer {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0px 1.5vw;
      line-height: 1.7;
      // color: var(--text-color2);
      // background: var(--main-bgc);
      height: 120px;
      font-size: 12px;
    }
  }
</style>
