<!--
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-24 20:34:46
 * @LastEditTime: 2022-08-09 16:20:47
 * @Description: 
 * @FilePath: \blog-home-nuxt\components\nav.vue
-->

<script setup lang="ts">
  import { ref, computed, reactive } from "vue";
  import Login from "./login.vue";
  import { useRoute, useRouter } from "vue-router";
  import { getArticleList } from "@/api/article";
  import dayjs from "dayjs";
  import XIcon from "@/components/icons/index";
  import { throttle } from "~~/utils";
  import request from "~~/api/request";
  import api from "@/api";
  import { adminUrl } from "@/config";
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
    {
      path: "/links",
      title: "友链",
      icon: "",
    },
    {
      path: "/msgboard",
      title: "留言板",
      icon: "",
    },
    {
      path: "/about",
      title: "关于",
      icon: "",
    },
  ]);

  const token = useToken();
  const userInfo = useUserInfo();
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

  /* 搜索文章 */

  // 搜索文章
  const queryPrams = reactive<queryState>({
    page: 1,
    pageSize: 20,
    title: "",
    description: "",
    content: "",
  });
  const searchText = ref("");
  const articleList: any = ref([]);
  const getArticleListHandle = async () => {
    const res = await getArticleList(queryPrams);
    articleList.value = res.list.map((v: any) => {
      return {
        value: v.title,
        label: v.title,
        id: v.id,
      };
    });
  };

  const onSearchHandle = throttle(() => {
    if (searchText.value) {
      queryPrams.page = 1;
      queryPrams.title = searchText.value;
      queryPrams.description = searchText.value;
      queryPrams.content = searchText.value;
      getArticleListHandle();
    } else {
      articleList.value = [];
    }
  }, 500);

  const clear = () => {
    token.value = "";
    localStorage.setItem("x-token", "");
  };
  if (process.client) {
    token.value = localStorage.getItem("x-token") || ("" as string);
    if (token.value) {
      api.getUserInfo().then((res: any) => {
        userInfo.value = res;
      });
    } else {
      clear();
    }
  }
  const goUrl = `${adminUrl}?ticket=${token.value}`;
</script>
<template>
  <div class="navbar bg-transparent text-gray-100 dark:text-gray-300">
    <div class="navbar-start w-fit">
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
      <a class="hidden sm:inline-flex btn btn-ghost normal-case text-xl gradient-text" href="/"
        >Xia</a
      >
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

    <div class="navbar-end flex-1 flex items-center">
      <div class="dropdown relative">
        <label tabindex="0">
          <input
            type="text"
            placeholder="搜索"
            class="input w-full input-bordered input-ghost input-md"
            v-model="searchText"
            @input="onSearchHandle"
            @keyup.enter="onSearchHandle"
            autocomplete="off"
          />
        </label>
        <ul
          v-if="articleList.length"
          tabindex="0"
          class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52 max-h-72 text-gray-500 text-xs overflow-auto"
        >
          <li class="" v-for="(item, index) in articleList">
            <NuxtLink :to="'/detail/' + item.id">{{ item.value }}</NuxtLink>
          </li>
        </ul>
      </div>

      <x-icon class="cursor-pointer w-6" :icon="iconClass" @click="clickIcon" />

      <NuxtLink class="btn btn-ghost inline-flex" to="/login" title="登录" v-if="!token">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          />
        </svg>
      </NuxtLink>

      <div class="dropdown dropdown-end" v-if="token">
        <label tabindex="0" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img src="https://placeimg.com/80/80/people" />
          </div>
        </label>
        <ul
          tabindex="0"
          class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-36 text-gray-500 text-xs"
        >
          <li>
            <a :href="goUrl" target="_blank">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              写文章
            </a>
          </li>
          <li @click="clear">
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              退出
            </a>
          </li>
        </ul>
      </div>
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
      background-color: hsl(0 0% 100% / var(--tw-bg-opacity));
      --tw-bg-opacity: 0.1;
    }
  }
  // #app 容器外样式
  // :global(.dropdown-menu__item.active) {
  //   background-color: var(--main-color);
  //   color: #fff;
  // }
</style>
