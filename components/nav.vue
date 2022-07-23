<!--
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-24 20:34:46
 * @LastEditTime: 2022-07-23 13:43:14
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
import  XIcon  from "@/components/icons/index";
const theme = useCookie("theme");
// 不存在时需赋值个初始值
if (!theme.value) {
  theme.value = "light";
}
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
    path: "/about",
    title: "关于",
    icon: "",
  },
]);
// console.log(theme);
onMounted(() => {
  document.documentElement.className = theme.value;
});
const themeChange = (value) => {
  theme.value = value;
  document.documentElement.className = value;
  // console.log(document.documentElement.className)
};
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
      <el-switch
        class="switch"
        v-model="theme"
        style="margin-left: 24px"
        inline-prompt
        :active-icon="Sunny"
        :inactive-icon="Moon"
        active-value="light"
        inactive-value="dark"
        active-color="#ccc"
        @change="themeChange"
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
  }

  // :deep(.switch) {
  // }
}
</style>
