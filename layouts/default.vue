<script setup lang="ts">
/* / 路径显示的默认页面 */
import { ref } from 'vue'
import Cookies from 'js-cookie'
import dayjs from 'dayjs'
import { throttle } from '@/utils'
import { dailyImage } from '~~/api/article.js'

/* 获取全局banner数据 */
const banners = useBanners()
const { data: imagesData, } = await useAsyncData('index_GetIMG', () =>
  dailyImage(7)
)
if (imagesData.value) {
  banners.value = imagesData.value.images.map((v: any) => {
    const { copyright, copyrightlink, title, } = v
    return {
      copyright,
      copyrightlink,
      title,
      url: 'https://cn.bing.com' + v.url,
    }
  })
}

const scrollTop = ref(0)
const scrollHandle = () => {
  scrollTop.value = document.documentElement.scrollTop || document.body.scrollTop // 微信里面获取body的
}

// 客戶端执行
onMounted(() => {
  // console.log(document.documentElement)

  /*
    之所以绑定window的滚动事件 是为了元素样式为固定定位（相对于window定位的）时会覆盖document子元素的滚动条
    造成错位不好看。这里的滚动对象是 document.documentElement
  */
  window.addEventListener('scroll', throttle(scrollHandle, 100), true)
  // 写入一个cookie，用于判断用户是否点过赞
  if (!Cookies.get('browserId')) {
    // 存个当前时间戳
    Cookies.set('browserId', dayjs().valueOf().toString(), { expires: 7, })
  }
})

/* 用于搜狗和百度网站校验 */

useHead({
  charset: 'utf-8', // 字符
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  meta: [
    // Meta Language
    {
      'http-equiv': 'Content-Type',
      content: 'text/html',
    },
    {
      name: 'Keywords',
      content: '前端技术分享，工作心得分享，生活情感分享，个人的一片小天地！',
    },
    {
      name: 'description',
      content:
        '本站可以检索查看文章，网站留言，注册登录之后可以在本站自己发表文章评论文章等操作；个人博客，用于个人学习、工作、生活上的记录和分享。分享学习上难题与心得；分享工作上的技巧和困难；分享生活的各种点滴。记录生活记录你，互联网的记忆在这里。',
    },
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
    }
  ],
  script: [{ src: 'https://hm.baidu.com/hm.js?9c1165af167360b492031753308c3878', }],
})
</script>
<template>
  <div class="app-layout">
    <!-- 导航栏 -->
    <header class="app-layout-header" :class="{ 'app-layout-header__active': scrollTop > 58 }">
      <Nav />
    </header>
    <!-- 路由显示区域 -->
    <div class="app-layout-body">
      <NuxtPage />
    </div>
    <!-- 页脚 -->
    <footer class="app-layout-footer">
      <p>
        <NuxtLink target="_blank" href="https://beian.miit.gov.cn/#/Integrated/recordQuery">
          桂ICP备2022001119号-1
        </NuxtLink>
      </p>
      <p>
        Powered By Typescript & Vue3 & Vite3 & Nuxt3 & Tailwindcss & DaisyUI &
        Node.js & NestJS
      </p>
    </footer>
    <!-- 回到顶部 -->
    <xia-backtop />
  </div>
</template>
<style lang="less">
/* 这样写法好像也怎么只管看到类名，也不利于根据类名搜索 */
.app-layout {
  background-color: var(--main-bgc);
  color: var(--text-color);
  // background-color: #222831;
  min-height: 100vh;

  // padding-top: 64px;
  // 会编译成和 & 同级类名即 app-layout-header
  &-header {
    box-sizing: border-box;
    height: 64px;
    // line-height: 58px;
    width: 100%;
    z-index: 20;
    top: 0px;
    left: 0px;
    position: fixed;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16),
      0 2px 10px 0 rgba(0, 0, 0, 0.12);
    transition: all 1s;
    background: transparent;

    // padding: 0 1.5vw 0;
    // 会编译成和 & 同级类名即 app-layout-header__active
    &__active {
      background-color: var(--nav-color);
      border-color: var(--nav-color);
    }
  }

  &-body {
    min-height: calc(100vh - 60px);
  }

  &-footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0px 1.5vw;
    line-height: 1.7;
    color: var(--text-color2);
    background-color: var(--main-bgc);
    height: 60px;
    font-size: 12px;
  }
}
</style>
