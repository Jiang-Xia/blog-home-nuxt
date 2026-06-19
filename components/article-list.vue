<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onUnmounted } from 'vue';
import { getArticleList, getComment } from '@/api/article';
import { beforeTimeNow } from '@/utils';
import { getWeather } from '@/api/index';
import {
  categoryOptions,
  formactDate,
  getOptions,
  tagsOptions,
  updateLikesHandle,
  xBLogStore,
} from '@/utils/common';
import { colorRgb } from '~~/utils/color';
import { debounce } from '~~/utils';
import { messageDanger } from '@/utils/toast';
import { isDarkTheme, useTheme } from '@/composables/use-home';
import { useAuthorRpgLevels } from '@/composables/use-author-rpg-levels';

interface queryState {
  page: number;
  category: string;
  tags: string[];
  pageSize: number;
  total: number;
  title?: string;
  description?: string;
  content?: string;
  sort: string;
}
interface itemState {
  id: string;
  checked: boolean;
  [x: string]: string | boolean;
}
// const store = useStore()
// 文章列表中的每一项item都为any
const articleListDefault: any[] = [];
const articleList = ref(articleListDefault);

const queryPrams: queryState = reactive({
  page: 1,
  category: '',
  tags: [],
  pageSize: 12,
  total: 0,
  title: '',
  description: '',
  content: '',
  client: true,
  sort: 'DESC', // 降序
});

/*
   * 第一个参数为唯一key
   * ！注意：如果有使用useAsyncData时，会最先执行此函数，也是是如此，
   * 分类和标签才会在服务渲染(useAsyncData后执行的函数)
   */

const {
  // 这样生命的变量时响应式的，不这样声明请求回来复制不然渲染到模板上
  data: articleData,
} = await useAsyncData('index_GetList', () => getArticleList(queryPrams));
if (articleData.value) {
  articleList.value = articleData.value.list;
  queryPrams.total = articleData.value.pagination.total;
}
getOptions('标签');
getOptions('分类');

const listLoading = ref(false);
const categoryDropdownOpen = ref(false);
const tagDropdownOpen = ref(false);

const closeFilterDropdowns = () => {
  categoryDropdownOpen.value = false;
  tagDropdownOpen.value = false;
};

const router = useRouter();
const navigateToDetail = (id: string) => {
  router.push(`/detail/${id}`);
};

// 下一页
const getArticleListHandle = async (val = 1) => {
  listLoading.value = true;
  queryPrams.page = val;
  current.value = val;
  try {
    const res = await getArticleList({
      ...queryPrams,
      tags: [...queryPrams.tags],
    });
    articleList.value = res.list;
    queryPrams.total = res.pagination.total;
  }
  catch (error) {
    if (error instanceof Error && error.message.includes('禁止重复请求')) {
      return;
    }
    messageDanger('加载文章列表失败，请稍后重试');
  }
  finally {
    listLoading.value = false;
  }
};
  // 获取标签名(暂时没有用)
const getTagLabel = (arr: []): string => {
  // 如果是js的话，这个方法会写得很简单
  //  ts的话，它会提前对各种值进行类型推导，避免了一些取值的错误（比如在undefined和null取属性值）
  return arr.map((v: any) => v.label).join();
};

// 点击tag
const clickTagHandle = (item: itemState, type: string) => {
  current.value = 1;
  if (type === '分类') {
    if (queryPrams.category === item.id) {
      queryPrams.category = '';
    }
    else {
      queryPrams.category = item.id;
    }
    categoryDropdownOpen.value = false;
  }
  else {
    // 标签
    item.checked = !item.checked;

    const list: any = [...queryPrams.tags];
    if (!item.checked) {
      list.splice(list.indexOf(item.id), 1);
    }
    else if (!list.includes(item.id)) {
      list.push(item.id);
    }
    queryPrams.tags = list;
    // console.log(queryPrams.tags);
  }
  getArticleListHandle(1);
};
const resetTagsSelection = () => {
  tagsOptions.value.forEach((v: any) => {
    v.checked = false;
  });
  queryPrams.tags = [];
  tagDropdownOpen.value = false;
};

const restTags = () => {
  resetTagsSelection();
  current.value = 1;
  getArticleListHandle(1);
};
  // 已选标签数量
const checkedTags = computed(() => {
  return tagsOptions.value.filter((v: any) => v.checked).length;
});
const categoryName = computed(() => {
  return categoryOptions.value.find((v: any) => v.id === queryPrams.category)?.label;
});
  // 分页
const current = ref(1);
const currentChangeHandle = (val: number) => {
  current.value = val;
  getArticleListHandle(val);
};

// 模糊搜索
const searchText = ref('');
const performSearch = () => {
  const keyword = searchText.value.trim();
  queryPrams.page = 1;
  queryPrams.category = '';
  resetTagsSelection();
  queryPrams.title = keyword;
  queryPrams.description = keyword;
  queryPrams.content = keyword;
  current.value = 1;
  getArticleListHandle(1);
};
const onSearchHandle = performSearch;
const onSearchClick = debounce(performSearch, 300);
const changeSort = () => {
  queryPrams.sort === 'ASC' ? (queryPrams.sort = 'DESC') : (queryPrams.sort = 'ASC');
  current.value = 1;
  getArticleListHandle(1);
};

// 颜色转换
const toRgb = (color: string, alpha = 0.24) => {
  color = colorRgb(color);
  color = color.replace(')', `,${alpha})`);
  return color;
};

const tagFilterStyle = (item: any) => ({
  borderColor: item.color,
  color: item.checked ? 'var(--color-primary-content)' : item.color,
  backgroundColor: item.checked ? item.color : toRgb(item.color),
});

// 客户端执行
// 本地点赞记录
const localLikes = computed<number[]>(() => xBLogStore.value.likes);

// 分类标签设置hover样式
const categoryMouseenter = (e: any, item: any) => {
  e.target.style.backgroundColor = toRgb(item.color, 0.12);
  e.target.style.setProperty('--current-color', `${item.color}`);
};
const categoryMouseleave = (e: any) => {
  e.target.style.backgroundColor = '';
};
  // 天气
const weatherData = ref<any>({});
const userInfo = useUserInfo();
const weatherUrl
  = 'https://jiang-xia.top/x-api/blog-server/static/uploads/2026-06/7647b28bf00d49c5915d27aa1cafa9ef.webp';

// 'https://api.vvhan.com/api/ipCard?tip=Hello ' + (userInfo.value.nickname || '亲爱的路人！');

onMounted(
  /* async */ () => {
    document.addEventListener('click', closeFilterDropdowns);
  },
);

onUnmounted(() => {
  document.removeEventListener('click', closeFilterDropdowns);
});
const theme = useTheme();
const isDark = computed(() => isDarkTheme(theme.value));

// 最新评论
const commentsList = ref<any>([]);
const { data: commentsData } = await useAsyncData('articleList_GetComment', () =>
  getComment('', { pageSize: 16 }),
);
commentsList.value = commentsData.value?.list ?? [];

const { getAuthorLevel, fetchLevelsForUids } = useAuthorRpgLevels();

const syncAuthorLevels = (list: any[]) => {
  fetchLevelsForUids(list.map((item: any) => item.uid).filter(Boolean));
};

watch(articleList, syncAuthorLevels, { immediate: true });
</script>

<template>
  <div class="article-list-page">
    <main class="main-content px-3">
      <!-- 移动端：搜索与排序 -->
      <div class="mobile-toolbar mb-4 md:hidden">
        <base-card icon="blog-filter" title="搜索" min-height="72px">
          <div class="join w-full mt-2">
            <button
              type="button"
              :title="queryPrams.sort === 'ASC' ? '升序' : '降序'"
              class="join-item btn cyber-btn-secondary btn-square w-10 btn-sm text-xs"
              :disabled="listLoading"
              @click="changeSort"
            >
              <svg
                v-if="queryPrams.sort === 'ASC'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z"
                />
              </svg>
            </button>
            <input
              v-model="searchText"
              type="search"
              placeholder="输入标题或者摘要"
              aria-label="搜索文章"
              class="join-item input input-bordered input-sm flex-1 min-w-0"
              :disabled="listLoading"
              @keyup.enter="onSearchHandle"
            >
            <button
              type="button"
              class="join-item btn cyber-btn-secondary btn-square w-10 btn-sm"
              :disabled="listLoading"
              @click="onSearchClick"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </base-card>
      </div>

      <!-- 筛选条件 -->
      <div class="condition-card-wrap mb-4 max-w-7xl">
        <base-card
          icon="blog-filter"
          :title="'筛选条件(' + queryPrams.total + ')'"
          min-height="110px"
        >
          <div class="condition-box flex flex-wrap gap-2">
            <!-- 分类筛选 -->
            <div class="filter-block w-full sm:w-auto">
              <div
                class="dropdown w-full sm:w-auto"
                :class="{ 'dropdown-open': categoryDropdownOpen }"
                @click.stop
              >
                <button
                  type="button"
                  class="btn btn-soft btn-secondary btn-sm"
                  :disabled="listLoading"
                  @click="
                    categoryDropdownOpen = !categoryDropdownOpen;
                    tagDropdownOpen = false;
                  "
                >
                  <xia-icon icon="blog-category" /> 分类筛选
                  <span v-if="categoryName">({{ categoryName }})</span>
                </button>
                <ul
                  tabindex="0"
                  class="dropdown-content menu z-[120] hidden w-72 max-h-96 rounded-box border border-tech bg-[var(--tech-dropdown-bg)] shadow-sm text-tech md:block"
                >
                  <div
                    v-for="item of categoryOptions"
                    :key="item.id"
                    class="category-item"
                    :color="item.color"
                    :class="item.id === queryPrams.category ? 'active' : ''"
                    @click="clickTagHandle(item, '分类')"
                    @mouseenter="(e) => categoryMouseenter(e, item)"
                    @mouseleave="(e) => categoryMouseleave(e)"
                  >
                    <div
                      class="category__inner flex justify-between items-center"
                      :style="{
                        borderColor: item.id === queryPrams.category ? 'transparent' : '',
                      }"
                    >
                      <span class="category__text">{{ item['label'] }}</span>
                      <div
                        class="category__tag"
                        :color="item.color"
                        size="small"
                        :style="{ backgroundColor: item.color }"
                      >
                        <span>{{ item['articleCount'] }}</span>
                      </div>
                    </div>
                  </div>
                </ul>
              </div>

              <!-- 移动端：内联展开，避免被 card overflow 裁切 -->
              <div
                v-show="categoryDropdownOpen"
                class="mobile-filter-panel mt-2 md:hidden"
                @click.stop
              >
                <div
                  v-for="item of categoryOptions"
                  :key="'m-cat-' + item.id"
                  class="category-item"
                  :color="item.color"
                  :class="item.id === queryPrams.category ? 'active' : ''"
                  @click="clickTagHandle(item, '分类')"
                >
                  <div
                    class="category__inner flex justify-between items-center"
                    :style="{
                      borderColor: item.id === queryPrams.category ? 'transparent' : '',
                    }"
                  >
                    <span class="category__text">{{ item['label'] }}</span>
                    <div
                      class="category__tag"
                      :color="item.color"
                      size="small"
                      :style="{ backgroundColor: item.color }"
                    >
                      <span>{{ item['articleCount'] }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 标签筛选 -->
            <div class="filter-block w-full sm:w-auto">
              <div
                class="dropdown w-full sm:w-auto"
                :class="{ 'dropdown-open': tagDropdownOpen }"
                @click.stop
              >
                <button
                  type="button"
                  class="btn btn-soft btn-accent btn-sm"
                  :disabled="listLoading"
                  @click="
                    tagDropdownOpen = !tagDropdownOpen;
                    categoryDropdownOpen = false;
                  "
                >
                  <xia-icon icon="blog-tag" /> 标签筛选
                  <span v-if="checkedTags">({{ checkedTags }})</span>
                </button>
                <ul
                  tabindex="0"
                  class="dropdown-content menu z-[120] hidden w-72 max-h-96 rounded-box border border-tech bg-[var(--tech-dropdown-bg)] shadow-sm text-tech md:block"
                >
                  <div class="flex flex-wrap gap-2 p-3">
                    <button
                      v-for="item of tagsOptions"
                      :key="item.id"
                      type="button"
                      class="badge badge-outline badge-sm cursor-pointer transition-colors"
                      :style="tagFilterStyle(item)"
                      @click="clickTagHandle(item, '标签')"
                    >
                      {{ item.label }} ({{ item.articleCount }})
                    </button>
                  </div>
                  <div class="mt-4 text-center">
                    <button
                      type="button"
                      class="btn-block btn btn-soft btn-error btn-xs"
                      @click="restTags"
                    >
                      <xia-icon icon="blog-refresh" /> 重置
                    </button>
                  </div>
                </ul>
              </div>

              <!-- 移动端：内联展开 -->
              <div v-show="tagDropdownOpen" class="mobile-filter-panel mt-2 md:hidden" @click.stop>
                <div class="flex flex-wrap gap-2 p-1">
                  <button
                    v-for="item of tagsOptions"
                    :key="'m-tag-' + item.id"
                    type="button"
                    class="badge badge-outline badge-sm cursor-pointer transition-colors"
                    :style="tagFilterStyle(item)"
                    @click="clickTagHandle(item, '标签')"
                  >
                    {{ item.label }} ({{ item.articleCount }})
                  </button>
                </div>
                <div class="mt-3 text-center">
                  <button
                    type="button"
                    class="btn-block btn btn-soft btn-error btn-xs"
                    @click="restTags"
                  >
                    <xia-icon icon="blog-refresh" /> 重置
                  </button>
                </div>
              </div>
            </div>
          </div>
        </base-card>
      </div>
      <!-- 文章列表 -->
      <div
        class="article-item-wrap relative flex flex-wrap w-full max-w-7xl"
        :class="{ 'is-loading': listLoading }"
      >
        <div
          v-if="listLoading"
          class="list-loading-overlay absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-base-100/50 backdrop-blur-[1px]"
        >
          <span class="loading loading-spinner loading-lg text-primary" />
        </div>
        <transition-group key="article-item-wrap" name="list">
          <div
            v-for="item in articleList"
            :key="item.id"
            class="article-item cyber-glass-card cyber-glass-card--hover mb-5 overflow-hidden transition-all cursor-pointer"
            role="article"
            tabindex="0"
            @click="navigateToDetail(item.id)"
            @keydown.enter="navigateToDetail(item.id)"
          >
            <figure class="article-item-cover m-0">
              <XiaCardBorderLight
                v-if="isDark"
                :pic="item.cover"
                class="article-item-cover-border"
                style="--border-size: 8px; --pic-inset: 8px"
              />
              <xia-image
                v-else
                :src="item.cover"
                lazyload
                class="article-item-cover-img w-full bg-base-300 [&_img]:object-cover"
                :alt="item.category.label"
              />
            </figure>
            <div class="card-body text-base-content/70">
              <h2 class="card-title text-base-content flex-wrap gap-1">
                {{ item.title }}
                <div v-if="item.topping" class="badge badge-soft badge-secondary">
                  TOP
                </div>
                <RpgLevelBadge
                  v-if="item.articleLevel && item.articleLevel > 1"
                  :level="item.articleLevel"
                  variant="article"
                />
                <RpgLevelBadge v-if="item.isMasterpiece" :level="0" variant="masterpiece" />
              </h2>
              <p class="text-sm text-overflow-hidden-3">
                {{ item.description }}
              </p>
              <div class="card-actions justify-start text-xs flex-wrap">
                <div class="flex items-center">
                  <!-- 分类 -->
                  <span
                    class="text-icon mr-2 flex items-center"
                    :style="{ color: item.category.color }"
                  >
                    <xia-icon icon="blog-category" class="mr-1" />
                    {{ item.category.label }}
                  </span>
                  <!-- 标签 -->
                  <span
                    class="text-icon mr-2 flex items-center"
                    :style="{ color: item.tags[0]?.color }"
                  >
                    <xia-icon icon="blog-tag" class="mr-1" />
                    {{ getTagLabel(item.tags) }}
                  </span>
                  <!-- 阅读量 -->
                  <span class="text-icon mr-2 flex items-center pointer"><xia-icon icon="blog-view" class="mr-1" />{{ item.views }}</span>
                  <!-- 点赞数 -->
                  <button
                    type="button"
                    class="text-icon mr-2 flex items-center pointer bg-transparent border-0 p-0 cursor-pointer"
                    :aria-label="localLikes.includes(item.id) ? '取消点赞' : '点赞'"
                    @click.stop.prevent="updateLikesHandle(item)"
                  >
                    <xia-icon
                      :icon="localLikes.includes(item.id) ? 'blog-like-solid' : 'blog-like'"
                      class="mr-1"
                    />
                    {{ item.likes }}
                  </button>
                  <!-- 评论数 -->
                  <span class="text-icon mr-2 flex items-center">
                    <xia-icon icon="blog-pinglun" class="mr-1" />
                    {{ item.commentCount }}
                  </span>
                </div>
                <div class="flex justify-between w-full items-center">
                  <div class="flex items-center gap-2">
                    <NuxtLink
                      v-if="item.uid"
                      :to="`/user/${item.uid}`"
                      class="author-link group inline-flex items-center gap-1.5 rounded-full transition-all hover:opacity-90"
                      title="查看作者主页"
                      @click.stop
                    >
                      <div
                        class="avatar btn btn-ghost btn-circle btn-xs ring-1 ring-transparent transition-all group-hover:ring-primary/50"
                      >
                        <div class="rounded-full">
                          <img :src="item.userInfo.avatar" :alt="item.userInfo.nickname">
                        </div>
                      </div>
                      <span class="link link-hover">{{ item.userInfo.nickname }}</span>
                      <RpgLevelBadge
                        v-if="getAuthorLevel(item.uid)"
                        :level="getAuthorLevel(item.uid)!"
                        variant="author"
                      />
                    </NuxtLink>
                    <template v-else>
                      <div class="inline-flex items-center gap-1.5">
                        <div class="avatar btn btn-ghost btn-circle btn-xs">
                          <div class="rounded-full">
                            <img :src="item.userInfo.avatar" :alt="item.userInfo.nickname">
                          </div>
                        </div>
                        <span>{{ item.userInfo.nickname }}</span>
                        <RpgLevelBadge
                          v-if="getAuthorLevel(item.uid)"
                          :level="getAuthorLevel(item.uid)!"
                          variant="author"
                        />
                      </div>
                    </template>
                    <span>{{ formactDate(item.createTime) }}</span>
                  </div>
                  <span class="btn btn-xs cyber-btn-secondary xia-btn pointer-events-none">Read</span>
                </div>
              </div>
            </div>
          </div>
        </transition-group>

        <div
          v-show="!articleList.length && !listLoading"
          class="min-h-96 border border-tech bg-[var(--tech-input-bg)] w-full flex items-center rounded-lg shadow-lg text-tech"
        >
          <xia-empty description="找不到文章..." />
        </div>
      </div>
      <div class="w-full" :class="{ 'pointer-events-none opacity-50': listLoading }">
        <!-- 分页 -->
        <div class="flex justify-around">
          <xia-pagination
            prev
            next
            :current-page="current"
            :page-size="queryPrams.pageSize"
            :total="queryPrams.total"
            :max="5"
            @change="currentChangeHandle"
          />
        </div>
      </div>
    </main>
    <!-- 右边筛选卡片 -->
    <aside class="info-tool">
      <base-card icon="blog-filter" title="关键字" min-height="110px" class="mx-4 mb-4">
        <div class="join w-full mt-2">
          <button
            :title="queryPrams.sort === 'ASC' ? '升序' : '降序'"
            type="button"
            class="join-item btn cyber-btn-secondary btn-square w-10 btn-sm text-xs"
            :disabled="listLoading"
            @click="changeSort"
          >
            <svg
              v-if="queryPrams.sort === 'ASC'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z"
              />
            </svg>
          </button>
          <input
            v-model="searchText"
            type="search"
            placeholder="输入标题或者摘要"
            aria-label="搜索文章"
            class="join-item input input-bordered input-sm max-w-xs"
            :disabled="listLoading"
            @keyup.enter="onSearchHandle"
          >
          <button
            type="button"
            class="join-item btn cyber-btn-secondary btn-square w-10 btn-sm"
            :disabled="listLoading"
            @click="onSearchClick"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </base-card>
      <base-card
        class="weather-card mx-4 mb-4"
        icon=""
        title=""
        :no-padding="false"
        min-height="180px"
      >
        <img v-lazyImg="weatherUrl" alt="天气预报" class="rounded-lg load-img">
      </base-card>
      <!-- 天气 -->
      <base-card
        icon="" title="" min-height="110px"
        :no-padding="false"
        class="mx-4 mb-4"
      >
        <div class="icon-wrap">
          <xia-clock />
        </div>
      </base-card>

      <base-card icon="blog-liuyanban3" title="最新评论" class="mx-4 mb-4" :no-padding="false">
        <ul class="list border border-tech bg-[var(--tech-input-bg)] rounded-box text-tech">
          <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">
            所有文章最新的评论~
          </li>

          <li
            v-for="comment in commentsList"
            :key="comment.id"
            class="list-row text-base-content/80 cursor-pointer"
            @click="$router.push(`detail/${comment.articleId}`)"
          >
            <div class="flex items-center">
              <xia-image class="size-9 rounded-box" lazyload :src="comment.userInfo.avatar" />
            </div>
            <div>
              <div class="flex items-center text-xs">
                {{ comment.userInfo.nickname }}
                <span class="flex items-center ml-2">
                  <xia-icon width="14px" icon="blog-shijian" />
                  {{ beforeTimeNow(comment.createTime) }}
                </span>
              </div>
              <div class="text-xs uppercase text-base-content/50 max-h-8 text-overflow-hidden-2">
                {{ comment.content }}
              </div>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-base-content/35 flex items-center">
                <xia-icon icon="blog-pinglun" class="mr-0" height="16px" />
                {{ comment.allReplyCount }}
              </span>
            </div>
          </li>
        </ul>
      </base-card>
    </aside>
  </div>
</template>

<style lang="less" scoped>
  .article-list-page {
    position: relative;
    padding-top: 20px;
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    :deep(.xia-empty) {
      margin-bottom: 10vh;
    }
    .el-pagination {
      margin-top: 8vh;
    }

    .condition-card-wrap {
      :deep(.card-wrap .card-content) {
        overflow: visible;
      }
    }

    .mobile-filter-panel {
      max-height: min(50vh, 320px);
      overflow-y: auto;
      border-radius: 0.75rem;
      border: 1px solid var(--tech-border);
      background: var(--tech-dropdown-bg);
      padding: 0.5rem;
      box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
    }

    .filter-block {
      position: relative;
    }
    // 分类卡片
    .category-card {
      max-height: 110vh;
      min-height: 100vh;
      overflow-y: auto;
    }
    .category-item {
      --current-color: var(--tech-border);
      padding: 5px 10px;
      transition: all 0.5s;
      border-radius: 2px 2px;
      .category__inner {
        cursor: pointer;
        position: relative;
        border-bottom: 1px solid var(--tech-border);
        &:after {
          // background: none repeat scroll 0 0 transparent;
          position: absolute;
          bottom: -1px;
          left: 0;
          content: '';
          display: block;
          border-bottom-width: 1px;
          border-bottom-style: solid;
          border-bottom-color: var(--current-color);
          width: 0;
          transition: width 0.5s ease 0s;
        }
      }
    }
    .category-item:hover {
      .category__inner:after {
        width: 100%;
        left: 0;
      }
    }
    .category-item.active {
      .category__inner:after {
        width: 100%;
        left: 0;
      }
    }
    .category__tag {
      border-radius: 7px;
      line-height: 14px;
      font-size: 12px;
      height: 14px;
      color: var(--color-primary-content);
      padding: 0 9px;
    }
    .category__text {
      line-height: 1.8;
      flex: 1;
    }
    // 右边卡片
    .info-tool {
      // position: absolute;
      // right: 0;
      // top: 20px;
      // width: 340px;
      flex-basis: 340px;
      transition: all 0.5s;
      // transform: translateX(300%);
      display: none;
      // 天气卡片
      .weather-card {
        min-height: 180px;
        img {
          width: 100%;
          height: 180px;
        }
      }
    }
    .main-content,
    .info-tool {
      min-height: 100vh;
    }
    .card-title {
      // color: var(--text-color);
    }
    .card-body {
      // color: var(--text-color2);
    }
    .main-content {
      position: relative;
      margin-right: 0;
      flex: 1;
    }
    .article-item-wrap {
      gap: 1.25rem;
      transition: all 0.5s;

      .article-item {
        max-height: 408px;
        width: 100%;
        display: flex;
        flex-direction: column;

        .article-item-cover {
          --cover-height: 160px;
          flex-shrink: 0;
          padding: 12px;
          display: flex;

          :deep(.card-container) {
            width: 100%;
            height: var(--cover-height);
            min-height: var(--cover-height);
          }
        }

        .card-body {
          flex: 1;
          min-height: 0;
          overflow: hidden;
          padding: 0 12px 12px;
        }

        .article-item-cover-img {
          width: 100%;
          height: var(--cover-height);
          display: block;
          border-radius: 8px;
          overflow: hidden;

          :deep(img) {
            display: block;
            height: 100%;
            width: 100%;
            object-fit: cover;
          }
        }
      }

      @media (min-width: 1080px) {
        .article-item {
          width: calc(50% - 0.625rem);
        }
      }
    }

    @media (min-width: 768px) {
      .main-content {
        // margin-right: 340px;
      }
      .info-tool {
        // transform: translateX(0%);
        display: block;
      }
    }
    @media (min-width: 1780px) {
      .info-tool {
        // right: 100px;
      }
    }

    .xia-btn {
      text-transform: uppercase;
      background: linear-gradient(to right, var(--color-secondary) 50%, var(--color-neutral) 50%);
      background-size: 200% 100%;
      background-position: right bottom;
      transition: all 2s ease;
      border: none;
    }
    .article-item:hover .xia-btn {
      background-position: left bottom;
    }
  }
</style>
