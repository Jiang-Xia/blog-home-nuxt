<script setup lang="ts">
/* / 路径显示的默认页面 */
import { ref, watch } from "vue";
import Cookies from "js-cookie";
import { throttle } from "@/utils";
import dayjs from "dayjs";
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
        Powered By Typescript & Vue3 & Vite3 & Nuxt3 & ELement-Plus &
        Tailwindcss & Node.js & NestJS
      </p>
    </footer>
    <!-- 回到顶部 -->
    <!-- <el-backtop> </el-backtop> -->
  </div>
</template>
<style lang="less">
.remark-var {
  --p: 259 94% 51%;
  --pf: 259 94% 41%;
  --sf: 314 100% 38%;
  --af: 174 60% 41%;
  --nf: 219 14% 22%;
  --in: 198 93% 60%;
  --su: 158 64% 52%;
  --wa: 43 96% 56%;
  --er: 0 91% 71%;
  --inc: 198 100% 12%;
  --suc: 158 100% 10%;
  --wac: 43 100% 11%;
  --erc: 0 100% 14%;
  --rounded-box: 1rem;
  --rounded-btn: 0.5rem;
  --rounded-badge: 1.9rem;
  --animation-btn: 0.25s;
  --animation-input: 0.2s;
  --btn-text-case: uppercase;
  --btn-focus-scale: 0.95;
  --border-btn: 1px;
  --tab-border: 1px;
  --tab-radius: 0.5rem;
  --pc: 0 0% 100%;
  --s: 314 100% 47%;
  --sc: 0 0% 100%;
  --a: 174 60% 51%;
  --ac: 175 44% 15%;
  --n: 219 14% 28%;
  --nc: 0 0% 100%;
  --b1: 0 0% 100%;
  --b2: 0 0% 95%;
  --b3: 180 2% 90%;
  --bc: 215 28% 17%;
}
/* 这样写法好像也怎么只管看到类名，也不利于根据类名搜索 */
.app-layout {
  background-color: var(--main-bgc);
  color: var(--text-color);
  min-height: 100vh;
  // padding-top: 64px;
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
    // padding: 0 1.5vw 0;
    // 会编译成和 & 同级类名即 app-layout-header__active
    &__active {
      background-color: var(--nav-color) !important;
      border-color: var(--nav-color) !important;
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
