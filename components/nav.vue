<!--
 * @Author: 酱
 * @LastEditors: jx
 * @Date: 2021-11-24 20:34:46
 * @LastEditTime: 2025-10-09 11:01:48
 * @Description:
 * @FilePath: \blog-home-nuxt\components\nav.vue
-->

<script setup lang="ts">
import { ref, reactive } from 'vue';
import Yaya from '../assets/images/animal/yaya.svg';
import { getArticleList } from '@/api/article';
import { throttle } from '~~/utils';
import api from '@/api';
import { TokenKey, RefreshTokenKey, getToken, removeToken } from '@/utils/cookie';
import { useThemeActions } from '@/composables/use-home';

const navList = ref([
  { path: '/', title: '首页' },
  { path: '/download', title: '快速入口' },
  { path: '/features', title: '特性' },
  { path: '/archives', title: '归档' },
  { path: '/links', title: '友链' },
  { path: '/msgboard', title: '留言板' },
  { path: '/about', title: '关于' },
  { path: '/projects', title: '项目' },
  { path: '/tool', title: '工具箱' },
]);

const token = useToken();
const userInfo = useUserInfo();
// 主题相关逻辑重构
const { theme, clickIcon, initTheme, disposeTheme } = useThemeActions();

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  initTheme();
});

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
  disposeTheme();
});

const onDocumentClick = () => {
  checked.value = false;
};
  /* 切换主题 结束 */

/* 搜索文章 */

// 搜索文章
const queryPrams = reactive<queryState>({
  page: 1,
  pageSize: 20,
  title: '',
  description: '',
  content: '',
});
const searchText = ref('');
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
  }
  else {
    articleList.value = [];
  }
}, 500);

const clear = () => {
  token.value = '';
  removeToken(TokenKey);
  removeToken(RefreshTokenKey);
  useClearUserInfo();
};
if (import.meta.client) {
  token.value = getToken(TokenKey);
  if (token.value) {
    api.getUserInfo().then((res: any) => {
      userInfo.value = res;
    });
  }
  else {
    clear();
  }
}
const checked = ref(false);
const showSearch = ref(false);
</script>

<template>
  <CyberNavBar>
    <template #actions>
      <!-- Mobile menu -->
      <div class="dropdown lg:hidden">
        <label
          class="btn btn-ghost btn-sm btn-circle text-tech-muted hover:text-tech"
          @click.stop=""
        >
          <input v-model="checked" type="checkbox" class="hidden" @click="checked = !checked">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 512 512"
            fill="currentColor"
          >
            <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
          </svg>
        </label>
        <ul
          tabindex="0"
          :style="{ visibility: checked ? 'visible' : undefined, opacity: Number(checked) }"
          class="menu dropdown-content menu-sm z-50 mt-2 w-40 rounded-xl border p-2 shadow-xl backdrop-blur-md"
        >
          <li v-for="(item, index) in navList" :key="item.path + index">
            <NuxtLink class="text-tech-muted hover:text-tech" :to="item.path">{{
              item.title
            }}</NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Search toggle -->
      <button
        type="button"
        class="btn btn-ghost btn-sm btn-circle text-tech-muted hover:text-tech"
        aria-label="搜索"
        @click="showSearch = !showSearch"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      <xia-icon
        class="cursor-pointer px-1 text-tech-muted hover:text-tech"
        :icon="'blog-' + theme"
        @click="clickIcon"
      />
      <XiaTheme />

      <ClientOnly>
        <CyberButton v-if="!token" variant="primary" to="/login" class="!px-4 !py-2 text-sm">
          登录
        </CyberButton>
        <div v-else class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-circle avatar">
            <div class="w-9 rounded-full">
              <img :src="userInfo.avatar || Yaya" :alt="userInfo.nickname">
            </div>
          </label>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content z-50 mt-2 w-36 rounded-xl border p-2 text-xs shadow-xl backdrop-blur-md"
          >
            <li>
              <NuxtLink to="/user/article/edit" class="text-tech-muted hover:text-tech">写文章</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/user/profile" class="text-tech-muted hover:text-tech">个人中心</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/rpg" class="text-tech-muted hover:text-tech">RPG 冒险</NuxtLink>
            </li>
            <li @click="clear">
              <a class="text-tech-muted hover:text-tech">退出</a>
            </li>
          </ul>
        </div>
      </ClientOnly>
    </template>
  </CyberNavBar>

  <!-- Search overlay -->
  <div
    v-if="showSearch"
    class="fixed inset-x-0 top-16 z-[10020] border-b border-tech bg-tech-header px-4 py-3 backdrop-blur-md"
  >
    <div class="relative mx-auto max-w-xl">
      <input
        v-model="searchText"
        type="text"
        placeholder="搜索文章..."
        class="input input-bordered w-full"
        autocomplete="off"
        @input="onSearchHandle"
        @keyup.enter="onSearchHandle"
      >
      <ul
        v-if="articleList.length"
        class="menu absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-xl border p-2 shadow-xl"
      >
        <li v-for="item in articleList" :key="item.id">
          <NuxtLink class="text-sm text-tech-muted hover:text-tech" :to="'/detail/' + item.id">{{
            item.value
          }}</NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
