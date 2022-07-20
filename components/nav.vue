<!--
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-24 20:34:46
 * @LastEditTime: 2022-07-20 23:24:21
 * @Description: 
 * @FilePath: \blog-home-nuxt\components\nav.vue
-->

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import Login from './login.vue'
import { useRoute, useRouter } from 'vue-router'
// import { getArticleList } from '@/api/article'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
const navList = ref([
  {
    path: '/home',
    title: '首页',
    icon: ''
  },
  {
    path: '/archives',
    title: '归档',
    icon: ''
  },
  {
    path: '/msgboard',
    title: '留言板',
    icon: ''
  },
  {
    path: '/about',
    title: '关于',
    icon: ''
  }
])
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
}
</style>
