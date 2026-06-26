<script setup lang="ts">
/**
   * 文章列表（首页 / 搜索 / 标签 / 分类 embed 复用）
   * embedMode：隐藏侧栏，使用 preset* 预置筛选条件
   */
import { computed, reactive, ref, watch, onMounted, onUnmounted } from 'vue';
import { getArticleList, getComment } from '@/api/article';
import {
  categoryOptions,
  formactDate,
  loadCategoryOptions,
  loadTagOptions,
  tagsOptions,
  updateLikesHandle,
  isArticleLiked,
  syncUserLikes,
} from '@/utils/common';
import { resolveStaticUrl } from '@/utils/static-url';
import { colorRgb } from '~~/utils/color';
import { debounce } from '~~/utils';
import { messageDanger } from '@/utils/toast';
import { isDarkTheme, useTheme } from '@/composables/use-home';
import { useAuthorRpgLevels } from '@/composables/use-author-rpg-levels';
import { coverAspectRatio } from '@/utils/image-compress';

const props = withDefaults(
  defineProps<{
    embedMode?: boolean;
    presetCategory?: string;
    presetTags?: string[];
    presetKeyword?: string;
    hideSidebar?: boolean;
    asyncDataKey?: string;
  }>(),
  {
    embedMode: false,
    presetCategory: '',
    presetTags: () => [],
    presetKeyword: '',
    hideSidebar: false,
    asyncDataKey: 'index_GetList',
  },
);

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

if (props.presetCategory) {
  queryPrams.category = props.presetCategory;
}
if (props.presetTags.length) {
  queryPrams.tags = [...props.presetTags];
}
const searchText = ref(props.presetKeyword || '');
if (props.presetKeyword) {
  queryPrams.title = props.presetKeyword;
  queryPrams.description = props.presetKeyword;
  queryPrams.content = props.presetKeyword;
}

/*
   * 第一个参数为唯一key
   * ！注意：如果有使用useAsyncData时，会最先执行此函数，也是是如此，
   * 分类和标签才会在服务渲染(useAsyncData后执行的函数)
   */

const {
  // 这样生命的变量时响应式的，不这样声明请求回来复制不然渲染到模板上
  data: articleData,
} = await useAsyncData(props.asyncDataKey, () =>
  getArticleList({
    ...queryPrams,
    tags: [...queryPrams.tags],
  }),
);
if (articleData.value) {
  articleList.value = articleData.value.list;
  queryPrams.total = articleData.value.pagination.total;
}

const filterOptionsLoading = ref(false);

const toggleCategoryDropdown = async () => {
  tagDropdownOpen.value = false;
  const opening = !categoryDropdownOpen.value;
  categoryDropdownOpen.value = opening;
  if (opening) {
    filterOptionsLoading.value = true;
    try {
      await loadCategoryOptions();
    }
    finally {
      filterOptionsLoading.value = false;
    }
  }
};

const toggleTagDropdown = async () => {
  categoryDropdownOpen.value = false;
  const opening = !tagDropdownOpen.value;
  tagDropdownOpen.value = opening;
  if (opening) {
    filterOptionsLoading.value = true;
    try {
      await loadTagOptions([...queryPrams.tags]);
    }
    finally {
      filterOptionsLoading.value = false;
    }
  }
};

const listLoading = ref(false);
const categoryDropdownOpen = ref(false);
const tagDropdownOpen = ref(false);

const closeFilterDropdowns = () => {
  categoryDropdownOpen.value = false;
  tagDropdownOpen.value = false;
};

const router = useRouter();

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

const filterDropdownOpen = computed(() => categoryDropdownOpen.value || tagDropdownOpen.value);

const MAX_VISIBLE_CARD_TAGS = 3;

const visibleCardTags = (tags: any[] = []) => tags.slice(0, MAX_VISIBLE_CARD_TAGS);

const hiddenCardTagCount = (tags: any[] = []) => Math.max(0, tags.length - MAX_VISIBLE_CARD_TAGS);
// 分页
const current = ref(1);
const currentChangeHandle = (val: number) => {
  current.value = val;
  getArticleListHandle(val);
};

// 模糊搜索
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

const metaBadgeStyle = (color: string) => ({
  borderColor: color,
  color,
  backgroundColor: toRgb(color),
});

const tagFilterStyle = (item: any) =>
  item.checked
    ? {
        borderColor: item.color,
        color: 'var(--color-primary-content)',
        backgroundColor: item.color,
      }
    : metaBadgeStyle(item.color);

// 客户端执行
// 本地点赞：hydration 后再读 localStorage，避免 SSR/客户端图标不一致
const likesHydrated = ref(false);
const isItemLiked = (id: string | number) => likesHydrated.value && isArticleLiked(id);

// 分类标签设置hover样式
const categoryMouseenter = (e: any, item: any) => {
  e.target.style.backgroundColor = toRgb(item.color, 0.12);
  e.target.style.setProperty('--current-color', `${item.color}`);
};
const categoryMouseleave = (e: any) => {
  e.target.style.backgroundColor = '';
};
const weatherUrl
  = 'https://jiang-xia.top/x-api/blog-server/static/uploads/2026-06/7647b28bf00d49c5915d27aa1cafa9ef.webp';

onMounted(
  /* async */ () => {
    likesHydrated.value = true;
    void syncUserLikes();
    document.addEventListener('click', closeFilterDropdowns);
    void loadSidebarComments();
    if (props.presetCategory) {
      void loadCategoryOptions();
    }
    if (props.presetTags.length) {
      void loadTagOptions([...props.presetTags]);
    }
  },
);

onUnmounted(() => {
  document.removeEventListener('click', closeFilterDropdowns);
});
const theme = useTheme();
const isDark = computed(() => isDarkTheme(theme.value));

// 最新评论（CSR，不阻塞 SSR）
const commentsList = ref<any>([]);
const commentsLoading = ref(false);

const loadSidebarComments = async () => {
  if (!import.meta.client || props.hideSidebar) return;
  commentsLoading.value = true;
  try {
    const res = await getComment('', { pageSize: 16 });
    commentsList.value = res?.list ?? [];
  }
  catch {
    commentsList.value = [];
  }
  finally {
    commentsLoading.value = false;
  }
};

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
      <div
        class="condition-card-wrap mb-4 max-w-7xl"
        :class="{ 'is-filter-open': filterDropdownOpen }"
      >
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
                  :disabled="listLoading || filterOptionsLoading"
                  @click="toggleCategoryDropdown"
                >
                  <xia-icon icon="blog-category" /> 分类筛选
                  <span v-if="categoryName">({{ categoryName }})</span>
                </button>
                <ul
                  v-show="categoryDropdownOpen"
                  tabindex="0"
                  class="filter-dropdown-panel dropdown-content menu z-[120] max-md:hidden"
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
                  :disabled="listLoading || filterOptionsLoading"
                  @click="toggleTagDropdown"
                >
                  <xia-icon icon="blog-tag" /> 标签筛选
                  <span v-if="checkedTags">({{ checkedTags }})</span>
                </button>
                <ul
                  v-show="tagDropdownOpen"
                  tabindex="0"
                  class="filter-dropdown-panel dropdown-content menu z-[120] max-md:hidden"
                >
                  <div class="filter-tag-grid">
                    <button
                      v-for="item of tagsOptions"
                      :key="item.id"
                      type="button"
                      class="article-meta-badge filter-tag-item transition-colors"
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
                </ul>
              </div>

              <!-- 移动端：内联展开 -->
              <div v-show="tagDropdownOpen" class="mobile-filter-panel mt-2 md:hidden" @click.stop>
                <div class="filter-tag-grid filter-tag-grid--mobile">
                  <button
                    v-for="item of tagsOptions"
                    :key="'m-tag-' + item.id"
                    type="button"
                    class="article-meta-badge filter-tag-item transition-colors"
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
            class="article-item cyber-glass-card cyber-glass-card--hover mb-3 sm:mb-5 overflow-hidden transition-all"
            role="article"
          >
            <figure class="article-item-cover m-0">
              <NuxtLink
                :to="`/detail/${item.id}`"
                class="article-cover-link"
                :aria-label="`阅读：${item.title}`"
              >
                <XiaCardBorderLight
                  v-if="isDark"
                  :pic="resolveStaticUrl(item.cover)"
                  class="article-item-cover-border"
                />
                <xia-image
                  v-else
                  :src="resolveStaticUrl(item.cover)"
                  lazyload
                  class="article-item-cover-img w-full bg-base-300 [&_img]:object-cover"
                  :alt="item.category.label"
                />
              </NuxtLink>
            </figure>
            <div class="card-body text-base-content/70">
              <h2 class="card-title text-base-content flex-wrap gap-1">
                <NuxtLink :to="`/detail/${item.id}`" class="article-title-link">{{
                  item.title
                }}</NuxtLink>
                <span
                  v-if="item.topping"
                  class="article-top-badge inline-flex shrink-0 items-center rounded-md px-1.5 py-px text-[10px] font-bold"
                  title="置顶"
                >TOP</span>
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
              <div class="card-actions flex-col items-stretch gap-2 text-xs">
                <div class="article-meta-chips flex flex-wrap items-center gap-1">
                  <!-- 分类 -->
                  <NuxtLink
                    v-if="item.category?.id"
                    :to="`/category/${item.category.id}`"
                    class="article-meta-badge no-underline hover:opacity-80"
                    :style="metaBadgeStyle(item.category.color)"
                  >
                    <xia-icon icon="blog-category" width="10px" height="10px" /><span>{{
                      item.category.label
                    }}</span>
                  </NuxtLink>
                  <!-- 标签（最多展示 3 个，其余折叠） -->
                  <NuxtLink
                    v-for="tag in visibleCardTags(item.tags)"
                    :key="tag.id"
                    :to="`/tag/${tag.id}`"
                    class="article-meta-badge no-underline hover:opacity-80"
                    :style="metaBadgeStyle(tag.color)"
                  >
                    <xia-icon icon="blog-tag" width="10px" height="10px" /><span>{{
                      tag.label
                    }}</span>
                  </NuxtLink>
                  <span
                    v-if="hiddenCardTagCount(item.tags)"
                    class="article-meta-badge article-meta-badge--more"
                    :title="`${hiddenCardTagCount(item.tags)} 个更多标签`"
                  >
                    +{{ hiddenCardTagCount(item.tags) }}
                  </span>
                </div>
                <div
                  class="article-meta-stats flex flex-wrap items-center gap-x-3 gap-y-1 text-base-content/60"
                >
                  <!-- 阅读量 -->
                  <span class="inline-flex shrink-0 items-center whitespace-nowrap">
                    <xia-icon icon="blog-view" class="mr-1" />{{ item.views }}
                  </span>
                  <!-- 点赞数 -->
                  <button
                    type="button"
                    class="inline-flex shrink-0 items-center whitespace-nowrap bg-transparent border-0 p-0 cursor-pointer"
                    :aria-label="isItemLiked(item.id) ? '取消点赞' : '点赞'"
                    @click.prevent="updateLikesHandle(item)"
                  >
                    <xia-icon
                      :icon="isItemLiked(item.id) ? 'blog-like-solid' : 'blog-like'"
                      class="mr-1"
                    />
                    {{ item.likes }}
                  </button>
                  <!-- 评论数 -->
                  <span class="inline-flex shrink-0 items-center whitespace-nowrap">
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
                  <NuxtLink
                    :to="`/detail/${item.id}`"
                    class="article-read-btn shrink-0 no-underline"
                    aria-label="阅读全文"
                  >阅读</NuxtLink>
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
    <aside v-if="!hideSidebar" class="info-tool">
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

          <li v-if="commentsLoading" class="p-4 text-sm text-tech-subtle">
            加载评论中…
          </li>

          <li
            v-for="comment in commentsList"
            :key="comment.id"
            class="list-row text-base-content/80 cursor-pointer"
            :title="'查看文章'"
            @click="$router.push(`/detail/${comment.articleId}`)"
          >
            <div class="flex items-center">
              <NuxtLink
                v-if="comment.uid"
                :to="`/user/${comment.uid}`"
                class="shrink-0"
                :title="`${comment.userInfo.nickname} 的主页`"
                @click.stop
              >
                <xia-image
                  class="size-9 rounded-box"
                  lazyload
                  :src="comment.userInfo.avatar"
                  :title="comment.userInfo.nickname"
                />
              </NuxtLink>
              <xia-image
                v-else
                class="size-9 rounded-box"
                lazyload
                :src="comment.userInfo.avatar"
                :title="comment.userInfo.nickname"
              />
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
      &.is-filter-open {
        position: relative;
        z-index: 50;
      }

      :deep(.card-wrap) {
        overflow: visible;
      }

      :deep(.card-wrap .card-content) {
        overflow: visible;
      }
    }

    .filter-dropdown-panel {
      position: absolute;
      left: 0;
      top: calc(100% + 0.375rem);
      width: min(24rem, calc(100vw - 2rem));
      max-height: min(20rem, 50vh);
      overflow-y: auto;
      overscroll-behavior: contain;
      border-radius: 0.75rem;
      border: 1px solid var(--tech-border);
      background: var(--tech-dropdown-bg);
      box-shadow: 0 12px 32px rgb(0 0 0 / 18%);
      color: var(--tech-fg);
      padding: 0.375rem;
    }

    .filter-tag-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.625rem 0.75rem;
      padding: 0.5rem;
    }

    /* 与卡片 .article-meta-badge 同高同字号，宽度随文案自适应 */
    .filter-tag-item {
      width: fit-content;
      max-width: 100%;
      height: 1.125rem;
      padding: 0 0.3125rem;
      font-size: 0.6875rem;
      line-height: 1;
      white-space: nowrap;
    }

    .filter-tag-grid--mobile {
      padding: 0;
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
      min-width: 0;
      word-break: break-word;
    }

    .article-meta-chips {
      min-width: 0;
    }

    .article-meta-badge {
      display: inline-flex;
      align-items: center;
      gap: 0;
      height: 1.125rem;
      padding: 0 0.3125rem;
      border: 1px solid;
      border-radius: 0.25rem;
      font-size: 0.6875rem;
      line-height: 1;
      white-space: nowrap;
      flex-shrink: 0;
      cursor: pointer;

      :deep(.x-icon) {
        line-height: 0;
        flex-shrink: 0;
        margin-right: 1px;

        svg {
          display: block;
          width: 10px;
          height: 10px;
        }
      }
    }

    button.article-meta-badge {
      margin: 0;
      font-family: inherit;
      appearance: none;
    }

    .article-meta-badge--more {
      border-color: var(--tech-border);
      color: var(--tech-fg-muted);
      background: transparent;
      cursor: default;
      padding: 0 0.375rem;
    }

    .article-top-badge {
      background: color-mix(in oklch, var(--color-secondary) 16%, transparent);
      color: var(--color-secondary);
      border: 1px solid color-mix(in oklch, var(--color-secondary) 32%, transparent);
      line-height: 1.2;
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
        width: 100%;
        display: flex;
        flex-direction: column;
        transition:
          box-shadow 0.25s ease,
          transform 0.25s ease;

        &.cyber-glass-card--hover:hover {
          border-color: var(--tech-border);
          background-color: var(--tech-glass);
          box-shadow:
            0 6px 20px rgb(15 23 42 / 0.08),
            0 0 12px color-mix(in oklch, var(--tech-primary-glow) 45%, transparent);
        }

        .article-cover-link {
          display: block;
          width: 100%;
          text-decoration: none;
          cursor: pointer;
          transition: opacity 0.2s;

          &:hover {
            opacity: 0.92;
          }
        }

        .article-title-link {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s;

          &:hover {
            color: var(--color-primary);
          }
        }

        .article-item-cover {
          flex-shrink: 0;
          padding: 12px;
          display: flex;

          .article-item-cover-border {
            --border-size: 8px;
            --pic-inset: 8px;
            width: 100%;
          }

          :deep(.card-container) {
            width: 100%;
            aspect-ratio: v-bind(coverAspectRatio);
            height: auto;
            min-height: 0;
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
          aspect-ratio: v-bind(coverAspectRatio);
          display: block;
          border-radius: 8px;
          overflow: hidden;

          :deep(img) {
            display: block;
            height: 100%;
            width: 100%;
            object-fit: cover;
            object-position: center;
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

    @media (max-width: 639px) {
      padding-top: 12px;

      .article-item-wrap {
        gap: 0.75rem;
      }

      .article-item {
        .article-item-cover {
          padding: 6px;

          .article-item-cover-border {
            --border-size: 4px;
            --pic-inset: 4px;
          }
        }

        .card-body {
          padding: 0 6px 8px;
        }
      }

      .condition-card-wrap :deep(.card-wrap > h4) {
        padding: 0 10px;
      }

      .condition-card-wrap :deep(.card-content.padding) {
        padding: 0 10px;
      }
    }

    @keyframes article-read-breathe {
      0%,
      100% {
        box-shadow: 0 0 0 0 transparent;
      }

      50% {
        box-shadow: 0 0 8px 1.5px color-mix(in oklch, var(--tech-primary-glow) 80%, transparent);
      }
    }

    .article-read-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 1.375rem;
      padding: 0.125rem 0.5rem;
      border-radius: 0.375rem;
      border: 1px solid var(--tech-btn-secondary-border);
      background: transparent;
      font-size: 0.6875rem;
      line-height: 1.25;
      font-weight: 500;
      color: var(--tech-fg);
      text-transform: none;
      transition: border-color 0.2s ease;
    }

    .article-item:hover .article-read-btn {
      border-color: color-mix(
        in oklch,
        var(--tech-section-label) 55%,
        var(--tech-btn-secondary-border)
      );
      animation: article-read-breathe 2.2s ease-in-out infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .article-item:hover .article-read-btn {
        animation: none;
        box-shadow: 0 0 8px 1.5px color-mix(in oklch, var(--tech-primary-glow) 65%, transparent);
      }
    }

    .article-read-btn:hover,
    .article-read-btn:focus-visible,
    .article-read-btn:active {
      background: transparent;
      color: var(--tech-fg);
      filter: none;
    }
  }
</style>
