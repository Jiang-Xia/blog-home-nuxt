<!--
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-24 20:34:46
 * @LastEditTime: 2022-07-27 22:50:02
 * @Description: 
 * @FilePath: \blog-home-nuxt\components\nav.vue
-->

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import Login from "./login.vue";
import { useRoute, useRouter } from "vue-router";
// import { getArticleList } from '@/api/article'
import dayjs from "dayjs";
import XIcon from "@/components/icons/index";
const { $store } = useNuxtApp();
const navList = ref([
  {
    path: "/",
    title: "首页",
    icon: "",
  },
  {
    path: "/archives",
    title: "归档",
    icon: "",
  },
  // {
  //   path: "/msgboard",
  //   title: "留言板",
  //   icon: "",
  // },
  {
    path: "/links",
    title: "友链",
    icon: "",
  },
  {
    path: "/about",
    title: "关于",
    icon: "",
  },
]);
// init()
/* 切换主题 开始 */
const theme = useTheme();
const iconClass = ref("blog-light");
const setTheme = (type: string) => {
  iconClass.value = "blog-" + type;
  document.documentElement.className = type;
  document.documentElement.setAttribute("data-theme", type);
  localStorage.setItem("theme", type);
  theme.value = type;
};
const getHour = () => {
  const time = dayjs().hour();
  // 白天
  if (6 < time && time < 18) {
    theme.value = "light";
  } else {
    theme.value = "dark";
  }
};
onMounted(() => {
  const themeType = localStorage.getItem("theme");
  if (themeType) {
    // 都有设置icon和选中
    setTheme(themeType);
  } else {
    getHour();
  }
});
// 点击icon直接切换
const clickIcon = () => {
  if (theme.value === "light") {
    setTheme("dark");
  } else {
    setTheme("light");
  }
};
/* 切换主题 结束 */
</script>
<template>
  <div class="navbar bg-transparent text-white">
    <div class="navbar-start">
      <div class="dropdown">
        <label tabindex="0" class="btn btn-ghost lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
        </label>
        <ul
          tabindex="0"
          class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 text-zinc-500"
        >
          <li v-for="(item, index) in navList" :key="index">
            <NuxtLink :to="item.path">
              <span>{{ item.title }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
      <a class="btn btn-ghost normal-case text-xl">Xia</a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal p-0">
        <li v-for="(item, index) in navList" :key="index" class="mr-2">
          <NuxtLink :to="item.path" class="router-link-item">
            <span>{{ item.title }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div class="navbar-end">
      <x-icon class="cursor-pointer px-3 " :icon="iconClass" @click="clickIcon" />
    </div>
  </div>
</template>

<style lang="less" scoped>
/*
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px',
 */
.nav-container {
  height: 100%;
  color: #fff;
  @media (max-width: 768px) {
    .logo,
    .nav {
      display: none;
    }
  }
  display: flex;
  justify-content: space-between;
  transition: all 0.3s;
  .logo {
    width: 50px;
  }
  .nav {
    flex: 1;
    display: flex;
    align-items: center;
  }
  .router-link-item {
    font-size: 14px;
    font-weight: 500;
    padding: 0 12px;
    // color: #fff;
  }
  .router-link-active {
    color: var(--main-color) !important;
  }
  .router-link-item > span:hover {
    color: var(--main-color);
  }
  .tool-bar {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 2em;
  }
}
.navbar {
  .router-link-active {
    // color: var(--main-color) !important;
    border-radius: var(--rounded-btn, 0.5rem);
    background-color: hsl(var(--b1) / var(--tw-bg-opacity));
    --tw-bg-opacity: 0.1;
  }
}
// #app 容器外样式
// :global(.dropdown-menu__item.active) {
//   background-color: var(--main-color);
//   color: #fff;
// }
</style>
