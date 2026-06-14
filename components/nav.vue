<!--
 * @Author: 酱
 * @LastEditors: jx
 * @Date: 2021-11-24 20:34:46
 * @LastEditTime: 2025-10-09 11:01:48
 * @Description:
 * @FilePath: \blog-home-nuxt\components\nav.vue
-->

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import Yaya from '../assets/images/animal/yaya.svg';
import { getArticleList } from '@/api/article';
import { debounce } from '~~/utils';
import api from '@/api';
import { TokenKey, RefreshTokenKey, getToken, removeToken } from '@/utils/cookie';
import { isDarkTheme, useThemeActions } from '@/composables/use-home';
import { NAV_LINKS } from '@/utils/constant';

const token = useToken();
const userInfo = useUserInfo();
// 主题相关逻辑重构
const { theme, clickIcon, initTheme, disposeTheme } = useThemeActions();
const themeToggleIcon = computed(() => (isDarkTheme(theme.value) ? 'blog-light' : 'blog-dark'));

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
  closeSearch();
};

function closeSearch() {
  showSearch.value = false;
  searchText.value = '';
  articleList.value = [];
  queryPrams.title = '';
  queryPrams.description = '';
  queryPrams.content = '';
}

function toggleSearch() {
  if (showSearch.value) {
    closeSearch();
  }
  else {
    showSearch.value = true;
  }
}
/* 切换主题 结束 */

/* 搜索文章 */

// 搜索文章
const queryPrams = reactive({
  page: 1,
  pageSize: 20,
  title: '',
  description: '',
  content: '',
  client: true,
  sort: 'DESC',
});
const searchText = ref('');
const articleList: any = ref([]);
const getArticleListHandle = async () => {
  try {
    const res = await getArticleList(queryPrams);
    articleList.value = (res?.list ?? []).map((v: any) => ({
      value: v.title,
      label: v.title,
      id: v.id,
    }));
  }
  catch {
    articleList.value = [];
  }
};

const onSearchHandle = debounce(() => {
  if (searchText.value.trim()) {
    queryPrams.page = 1;
    queryPrams.title = searchText.value.trim();
    queryPrams.description = searchText.value.trim();
    queryPrams.content = searchText.value.trim();
    getArticleListHandle();
  }
  else {
    queryPrams.title = '';
    queryPrams.description = '';
    queryPrams.content = '';
    articleList.value = [];
  }
}, 300);

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

const route = useRoute();
function isNavActive(path: string) {
  if (path === '/') return route.path === '/';
  return route.path === path || route.path.startsWith(path + '/');
}
</script>

<template>
  <CyberNavBar>
    <template #actions>
      <!-- Mobile menu -->
      <div class="dropdown lg:hidden" :class="{ 'dropdown-open': checked }">
        <label
          class="btn btn-ghost btn-sm btn-circle text-tech-muted hover:text-tech"
          @click.stop="checked = !checked"
        >
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
          class="menu menu-sm dropdown-content z-50 mt-2 w-40 rounded-xl border shadow-xl backdrop-blur-md"
        >
          <li
            v-for="(item, index) in NAV_LINKS"
            :key="item.path + index"
            class="rounded-lg"
            :class="{ 'bg-[var(--tech-nav-active-bg)]': isNavActive(item.path) }"
          >
            <NuxtLink
              class="!px-2 !py-1 text-tech-muted hover:text-tech"
              :class="{ 'text-tech': isNavActive(item.path) }"
              :to="item.path"
            >{{ item.title }}</NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Search toggle -->
      <button
        type="button"
        class="btn btn-ghost btn-sm btn-circle text-tech-muted hover:text-tech"
        aria-label="搜索"
        @click.stop="toggleSearch"
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
        :icon="themeToggleIcon"
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
    @click.stop
  >
    <div class="relative mx-auto max-w-xl">
      <input
        v-model="searchText"
        type="text"
        placeholder="搜索文章..."
        class="input input-bordered w-full bg-[var(--tech-dropdown-bg)]"
        autocomplete="off"
        @input="onSearchHandle"
        @keyup.enter="onSearchHandle"
        @keyup.esc="closeSearch"
      >
      <ul
        v-if="articleList.length"
        class="menu absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-tech bg-[var(--tech-dropdown-bg)] p-2 shadow-xl backdrop-blur-xl"
      >
        <li v-for="item in articleList" :key="item.id">
          <NuxtLink
            class="text-sm text-tech-muted hover:text-tech"
            :to="'/detail/' + item.id"
            @click="closeSearch"
          >{{ item.value }}</NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
