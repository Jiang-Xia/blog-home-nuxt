<script setup lang="ts">
/* / 路径显示的默认页面 */
import "@/styles/index.less";
import { ref, watch } from "vue";
import Cookies from "js-cookie";
import { throttle } from "@/utils";
import dayjs from "dayjs";
import { ID_INJECTION_KEY } from "element-plus";
// 解决 ElementPlusError
provide(ID_INJECTION_KEY, {
  prefix: Math.floor(Math.random() * 10000),
  current: 0,
});
const scrollTop = ref(0);
const scrollHandle = (e: any) => {
  scrollTop.value = document.documentElement.scrollTop;
};

// 客戶端执行
onMounted(() => {
  // console.log(document.documentElement)

  /* 
    之所以绑定window的滚动事件 是为了元素样式为固定定位（相对于window定位的）时会覆盖document子元素的滚动条
    造成错位不好看。这里的滚动对象是 document.documentElement
  */
  window.addEventListener("scroll", throttle(scrollHandle, 100), true);
  // 写入一个cookie，用于判断用户是否点过赞
  if (!Cookies.get("browserId")) {
    // 存个当前时间戳
    Cookies.set("browserId", dayjs().valueOf().toString(), { expires: 7 });
  }
});

</script>
<template>
  <div class="app-layout">
    <!-- 导航栏 -->
    <header
      class="app-layout-header"
      :class="{ 'app-layout-header__active': scrollTop > 58 }"
    >
      <Nav></Nav>
    </header>
    <!-- 路由显示区域 -->
    <div class="app-layout-body">
      <NuxtChild></NuxtChild>
    </div>
    <!-- 页脚 -->
    <footer class="app-layout-footer">
      <p>桂ICP备2022001119号-1</p>
      <p>
        Powered By Typescript & Vue3 & Vite3 & Nuxt3 & ELement-Plus & Tailwindcss & Node.js &
        NestJS
      </p>
    </footer>
    <!-- 回到顶部 -->
    <el-backtop> </el-backtop>
  </div>
</template>
<style lang="less">
/* 这样写法好像也怎么只管看到类名，也不利于根据类名搜索 */
.app-layout {
  background-color: var(--main-bgc) !important;
  color: var(--text-color) !important;
  min-height: 100vh;
  // 会编译成和 & 同级类名即 app-layout-header
  &-header {
    box-sizing: border-box;
    height: 64px;
    // line-height: 58px;
    width: 100%;
    z-index: 2;
    top: 0px;
    left: 0px;
    position: fixed;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16),
      0 2px 10px 0 rgba(0, 0, 0, 0.12);
    transition: all 1s;
    background: transparent !important;
    // padding: 0 1.5vw;
    // 会编译成和 & 同级类名即 app-layout-header__active
    &__active {
      // background-color: var(--nav-color) !important;
      // border-color: var(--nav-color) !important;
      background-color:#2a303c !important;
      
    }
  }
  &-body {
    min-height: 60vh;
  }

  &-footer {
    background-color: var(--main-bgc);
    padding: 24px 1.5vw;
    text-align: center;
    line-height: 1.7;
    color: var(--text-color2);
    height: auto;
  }
}
</style>
