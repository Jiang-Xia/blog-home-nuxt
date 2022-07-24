<!--
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-24 20:34:46
 * @LastEditTime: 2022-07-24 15:31:25
 * @Description: 
 * @FilePath: \blog-home-nuxt\components\nav.vue
-->

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import Login from "./login.vue";
import { useRoute, useRouter } from "vue-router";
// import { getArticleList } from '@/api/article'
import dayjs from "dayjs";
import { Sunny, Moon } from "@element-plus/icons-vue";
import XIcon from "@/components/icons/index";
const { $store } = useNuxtApp();
const navList = ref([
  {
    path: "/home",
    title: "首页",
    icon: "",
  },
  {
    path: "/archives",
    title: "归档",
    icon: "",
  },
  {
    path: "/msgboard",
    title: "留言板",
    icon: "",
  },
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
  localStorage.setItem("theme", type);
  theme.value = type
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
  <div class="nav-container">
    <div class="logo flex-between" @click="$router.push('/')">
      <!-- <img src="@/assets/img/logo/favicon-32x32.png" alt="logo" /> -->
    </div>
    <nav class="nav">
      <NuxtLink
        v-for="(item, index) in navList"
        :key="index"
        class="router-link-item"
        :to="item.path"
      >
        <span>{{ item.title }}</span>
      </NuxtLink>
    </nav>
    <div class="tool-bar">
      <!-- 主题模式 开始 -->
      <x-icon
        class="pointer"
        style="color: #fff"
        :icon="iconClass"
        @click="clickIcon"
      />
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
    .nav {
      display: none;
    }
  }
  display: flex;
  justify-content: space-between;
  transition: all 0.3s;
  .logo {
    min-width: 50px;
  }
  .nav {
    flex: 1;
    display: flex;
    align-items: center;
  }
  .router-link-item {
    font-size: 16px;
    font-weight: 500;
    padding: 0 12px;
    // color: #fff;
  }
  .router-link-active {
    color: var(--main-color);
  }
  .router-link-item > span:hover {
    color: var(--main-color);
  }
  .tool-bar {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    line-height: 1;
  }

  // :deep(.el-dropdown) {
  //   line-height: inherit;
  // }
}

// #app 容器外样式
:global(.el-dropdown-menu__item.active) {
  background-color: var(--main-color);
  color: #fff;
}
</style>
