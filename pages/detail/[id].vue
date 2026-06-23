<script setup lang="ts">
/**
   * 文章详情页
   * - 评论分页、JSON-LD / canonical SEO
   * - 集成相关推荐、分享、移动 TOC、相邻文章导航
   */
import { ref, reactive, computed, watch } from 'vue';
import { MdPreview } from 'md-editor-v3';

import { getArticleInfo, getComment } from '@/api/article';
import {
  updateViews,
  xBLogStore,
  updateLikesHandle,
  isArticleLiked,
  syncUserLikes,
} from '@/utils/common';
import { resolveStaticUrl } from '@/utils/static-url';
import { resolvePublicAvatarFrame } from '@/composables/use-avatar-frame';
import type { tocInter } from '@/utils';
import Qie from '@/assets/images/animal/qie.svg';
import { SiteTitle } from '@/utils/constant';
import { coverAspectRatio } from '@/utils/image-compress';

const mdEditorTheme = useMdEditorTheme();
const { open: openImagePreview } = useImagePreview();
interface FormState {
  [propName: string]: any;
}
const defaultForm: FormState = {
  id: '',
  title: '',
  description: '',
  content: '',
  contentHtml: '',
  cover: '',
  uTime: '',
  category: {
    label: '',
  },
  tags: [],
  views: 0,
  checked: 0,
  likes: 0,
  uid: 0,
  userInfo: {},
};
const route = useRoute();
// 先定义默认数组类型
const topicsDefault: tocInter[] = [];
const topics = ref(topicsDefault);
const ArticleInfo = reactive({ ...defaultForm });
// console.log(route)
const articleId = computed(() => route.params.id as string);
// console.log({ '文章id:': params.id, })
// 响应式声明
const {
  data: articleData,
  error,
  refresh,
} = await useAsyncData(
  () => `detail_GetInfo_${articleId.value}`,
  () => getArticleInfo({ id: articleId.value }),
);

if (error.value || !articleData.value?.info) {
  throw createError({
    statusCode: 404,
    statusMessage: '文章不存在或已下线',
    fatal: true,
  });
}

const setArticleData = () => {
  if (articleData) {
    Object.keys(defaultForm).forEach((v: string) => {
      if (articleData.value.info[v]) {
        ArticleInfo[v] = articleData.value.info[v];
      }
    });
  }
};
setArticleData();

const adjacentPrev = computed(() => articleData.value?.prev ?? null);
const adjacentNext = computed(() => articleData.value?.next ?? null);

const recordArticleView = (id: string) => {
  if (import.meta.client) {
    updateViews(id);
  }
};

const getTagLabel = (arr: any): string => {
  const text = arr.map((v: any) => v.label).join();
  return text;
};

const tagLabel = computed(() => {
  return getTagLabel(ArticleInfo.tags);
});

const mdHeadingId = ({ index }: { text: string; level?: number; index: number }) =>
// 用序号作 id，避免重复标题导致 TOC 多选高亮
  `heading-${index}`;

// 获取文章目录（id 与 MdPreview 渲染的 heading id 保持一致）
const onGetCatalogHandle = (list: any) => {
  topics.value = list.map((v: any, i: number) => ({
    level: String(v.level),
    id: mdHeadingId({ text: v.text, level: v.level, index: i + 1 }),
    text: v.text,
  }));
};
const previewTheme = ref('default');
const previewThemeChange = (e: any) => {
  previewTheme.value = e;
  // console.log(previewTheme.value);
};
const scrollElement = ref<HTMLElement>();
const themeList: any = ref([
  'default',
  'github',
  'vuepress',
  'mk-cute',
  'smart-blue',
  'cyanosis',
]);
  // 为了客户端时重新渲染才能设置为缓存的暗黑模式，themeLocal 另设置一个变量会导致签署数据两次
const mdKey = ref(new Date().getTime());

const syncDetailLikeState = () => {
  ArticleInfo.checked = isArticleLiked(ArticleInfo.id);
};

onMounted(async () => {
  scrollElement.value = document.documentElement;
  mdKey.value = new Date().getTime();
  recordArticleView(articleId.value);
  await syncUserLikes();
  syncDetailLikeState();
});

watch(
  () => xBLogStore.value.likes,
  () => {
    syncDetailLikeState();
  },
  { deep: true },
);

/* 评论：顶层分页，回复仍随父评论返回 */
const COMMENT_PAGE_SIZE = 20;
const comments = ref<any[]>([]);
const commentTotal = ref(0);
const commentTopTotal = ref(0);
const commentPage = ref(1);
const commentsLoading = ref(false);

const calcCommentTotal = (list: any[]) => {
  let total = commentTopTotal.value;
  list.forEach((v: any) => {
    total += v.allReplyCount || 0;
  });
  return total;
};

const applyCommentList = (list: any[], append: boolean) => {
  comments.value = append ? [...comments.value, ...list] : list;
  commentTotal.value = calcCommentTotal(comments.value);
};

const { data: res, refresh: refreshCommentsFn } = await useAsyncData(
  () => `detail_GetComment_${articleId.value}`,
  () => getComment(articleId.value, { page: 1, pageSize: COMMENT_PAGE_SIZE }),
);

const getCommentHandle = () => {
  if (!res.value) return;
  commentPage.value = 1;
  commentTopTotal.value = res.value.pagination?.total ?? 0;
  applyCommentList(res.value.list ?? [], false);
};

getCommentHandle();

const commentHasMore = computed(() => comments.value.length < commentTopTotal.value);

/** 追加加载更多顶层评论 */
const loadMoreComments = async () => {
  if (commentsLoading.value || !commentHasMore.value) return;
  commentsLoading.value = true;
  try {
    commentPage.value += 1;
    const more = await getComment(articleId.value, {
      page: commentPage.value,
      pageSize: COMMENT_PAGE_SIZE,
    });
    applyCommentList(more?.list ?? [], true);
  }
  finally {
    commentsLoading.value = false;
  }
};

const commented = async () => {
  commentPage.value = 1;
  await refreshCommentsFn();
  getCommentHandle();
};
const onTipped = async () => {
  await refresh();
  setArticleData();
};

const pageTitle = computed(() => ArticleInfo.title || '文章详情');
const pageDescription = computed(() => {
  const desc = ArticleInfo.description?.trim();
  if (desc) return desc;
  return ArticleInfo.title ? `${ArticleInfo.title} - ${SiteTitle}` : SiteTitle;
});
const coverUrl = computed(() => resolveStaticUrl(ArticleInfo.cover));

const authorAvatarSrc = computed(() => {
  const av = ArticleInfo.userInfo?.avatar;
  return av ? resolveStaticUrl(av) : Qie;
});

const authorAvatarFrame = computed(() =>
  resolvePublicAvatarFrame(ArticleInfo.userInfo?.avatarFrame),
);

useHead({
  title: pageTitle,
  titleTemplate: title => `${title} - ${SiteTitle}`,
  meta: [
    { name: 'description', content: pageDescription },
    { property: 'og:title', content: computed(() => `${pageTitle.value} - ${SiteTitle}`) },
    { property: 'og:description', content: pageDescription },
    { property: 'og:image', content: coverUrl },
    { property: 'og:type', content: 'article' },
  ],
  link: [
    // canonical 与 JSON-LD 供搜索引擎收录
    {
      rel: 'canonical',
      href: computed(() =>
        import.meta.client
          ? `${window.location.origin}/detail/${articleId.value}`
          : `/detail/${articleId.value}`,
      ),
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          'headline': ArticleInfo.title,
          'description': pageDescription.value,
          'datePublished': ArticleInfo.createTime || ArticleInfo.uTime,
          'dateModified': ArticleInfo.uTime || ArticleInfo.createTime,
          'author': {
            '@type': 'Person',
            'name': ArticleInfo.userInfo?.nickname || '作者',
          },
          'image': coverUrl.value ? [coverUrl.value] : undefined,
        }),
      ),
    },
  ],
});

watch(
  () => articleId.value,
  async (nextId, prevId) => {
    if (!nextId || nextId === prevId) {
      return;
    }
    await refresh();
    if (!articleData.value?.info) {
      throw createError({
        statusCode: 404,
        statusMessage: '文章不存在或已下线',
        fatal: true,
      });
    }
    setArticleData();
    recordArticleView(nextId);

    mdKey.value = new Date().getTime();
    await syncUserLikes();
    syncDetailLikeState();

    await refreshCommentsFn();
    getCommentHandle();
  },
);
</script>

<template>
  <div class="article-detail">
    <RpgArticleDetailHero
      :article="ArticleInfo"
      :tag-label="tagLabel"
      :tags="ArticleInfo.tags"
      :author-uid="Number(ArticleInfo.uid)"
      :article-id="ArticleInfo.id"
      @like="updateLikesHandle(ArticleInfo)"
    />
    <div class="main-view-area mx-auto w-full px-4 py-8">
      <div class="article-layout">
        <section class="main-content cyber-glass-card min-w-0 rounded-2xl p-3 md:p-5">
          <section class="module-wrap__detail article-info">
            <div class="article-meta-bar flex items-center gap-3 mb-3">
              <div class="flex min-w-0 flex-1 items-center">
                <div class="flex items-center justify-between">
                  <NuxtLink
                    v-if="ArticleInfo.uid"
                    :to="`/user/${ArticleInfo.uid}`"
                    class="author-profile-link group inline-flex items-center rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-base-content/5"
                    title="查看作者主页"
                  >
                    <CommonAvatarWithFrame
                      :avatar="authorAvatarSrc"
                      :alt="ArticleInfo.userInfo.nickname"
                      :frame="authorAvatarFrame"
                      :size="40"
                      class="transition-transform group-hover:scale-105"
                    />
                    <span class="font-bold ml-2 text-tech link link-hover link-primary">{{
                      ArticleInfo.userInfo.nickname
                    }}</span>
                    <span
                      class="ml-2 text-xs text-base-content/45 transition-colors group-hover:text-primary"
                    >主页</span>
                  </NuxtLink>
                  <div v-else class="flex items-center">
                    <CommonAvatarWithFrame
                      :avatar="authorAvatarSrc"
                      :alt="ArticleInfo.userInfo.nickname"
                      :frame="authorAvatarFrame"
                      :size="40"
                    />
                    <span class="ml-2 font-bold text-tech">{{
                      ArticleInfo.userInfo.nickname
                    }}</span>
                  </div>
                </div>
                <div class="dropdown dropdown-bottom ml-6">
                  <div
                    tabindex="0"
                    role="button"
                    class="btn m-1 cyber-btn-secondary"
                    aria-label="切换预览主题"
                    @keydown.enter.prevent="($event.target as HTMLElement)?.click()"
                  >
                    主 题
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content z-[1] menu p-2 shadow border border-tech bg-[var(--tech-dropdown-bg)] rounded-box w-52 text-tech"
                  >
                    <li v-for="item of themeList" @click="previewThemeChange(item)">
                      <a>{{ item }}</a>
                    </li>
                  </ul>
                </div>
              </div>
              <figure v-if="ArticleInfo.cover" class="article-cover-thumb shrink-0">
                <button
                  type="button"
                  class="article-cover-thumb__btn"
                  :aria-label="`查看封面：${ArticleInfo.title}`"
                  @click="openImagePreview(coverUrl, { mode: 'simple' })"
                >
                  <img
                    :src="coverUrl"
                    :alt="ArticleInfo.title"
                    class="article-cover-thumb__img"
                    loading="lazy"
                  >
                </button>
              </figure>
            </div>
            <MdPreview
              :key="mdKey"
              v-model="ArticleInfo.content"
              class="x-md-editor rounded-lg p-3 bg-transparent"
              preview-only
              :preview-theme="previewTheme"
              :theme="mdEditorTheme"
              :md-heading-id="mdHeadingId"
              @on-get-catalog="onGetCatalogHandle"
            />
            <ArticleRelated v-if="ArticleInfo.id" :article-id="ArticleInfo.id" />
            <ArticleAdjacentNav :prev="adjacentPrev" :next="adjacentNext" />
            <ArticleShareBar :article-id="ArticleInfo.id" :title="ArticleInfo.title" />
          </section>
          <XiaComment
            class="module-wrap__detail comment-module"
            :comments="comments"
            :total="commentTotal"
            :has-more="commentHasMore"
            :loading-more="commentsLoading"
            @commented="commented"
            @load-more="loadMoreComments"
          />
        </section>

        <aside v-if="topics.length" class="aside-bar hidden lg:block">
          <div class="aside-bar__inner cyber-glass-card rounded-xl border border-tech p-3">
            <Catalogue :topics="topics" />
          </div>
        </aside>
      </div>
    </div>
    <!-- 阅读进度环（含移动端目录） -->
    <ReadingProgressRing position="top-right" :auto-hide="true" style="top: 70px" />
    <RpgArticleRpgFab
      v-if="ArticleInfo.id && ArticleInfo.uid"
      :article-id="ArticleInfo.id"
      :author-uid="Number(ArticleInfo.uid)"
      :article="ArticleInfo"
      @tipped="onTipped"
    />
  </div>
</template>

<style lang="less" scoped>
  .banner-container {
    height: 50vh;
    .banner-content {
      position: relative;
      overflow: hidden;
      height: 100%;
      & > img {
        width: 100%;
        height: 100%;
        filter: blur(28px) brightness(0.95);
        transform: scale(1.1);
        // background: var(--nav-color);
      }
    }
  }
  .article-header {
    width: 80%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    font-size: 13px;
    text-align: center;
    // padding: 1rem;
    // backdrop-filter: blur(20px);
    // border-radius: 0.8rem;
    // box-shadow: 0 2px 15px rgb(0 0 0 / 30%);
    // background: rgba(255, 255, 255, 0.4);
    .title {
      font-size: 32px;
      font-weight: 600;
      text-align: center;
      line-height: 1.1;
      // backdrop-filter: blur(10px);
      // box-shadow: 0 0px 15px rgb(0 0 0 / 30%);
      // border-radius: 8px;
      // padding: 8px 18px;
    }
    .detail {
      font-size: 12px;
      text-align: center;
      margin-top: 10px;
    }
    .x-icon {
      font-size: 16px;
    }
  }
  .main-view-area {
    margin: 20px auto 0;
    /* 无目录：适中阅读宽度；有目录：随视口放宽，避免大屏正文过窄 */
    max-width: min(100%, 44rem);

    @media (min-width: 1024px) {
      max-width: min(92vw, 72rem);
    }

    @media (min-width: 1280px) {
      max-width: min(88vw, 87.5rem);
    }
  }

  .article-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1.5rem;

    @media (min-width: 1024px) {
      grid-template-columns: minmax(0, 1fr) 15rem;
      gap: 1.25rem;
    }

    @media (min-width: 1280px) {
      grid-template-columns: minmax(0, 1fr) 17.5rem;
      gap: 1.5rem;
    }
  }

  .article-cover-thumb {
    width: 7rem;
    aspect-ratio: v-bind(coverAspectRatio);
    margin: 0;
    overflow: hidden;
    border-radius: 0.5rem;
    border: 1px solid color-mix(in oklch, var(--color-base-content) 10%, transparent);
    background: color-mix(in oklch, var(--color-base-300) 40%, transparent);
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);

    @media (min-width: 768px) {
      width: 8.5rem;
    }
  }

  .article-cover-thumb__btn {
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    background: transparent;
    cursor: zoom-in;
  }

  .article-cover-thumb__img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .aside-bar {
    /* 侧栏需与正文同高，sticky 才能在滚动时吸顶 */
    min-height: 100%;
  }

  .aside-bar__inner {
    position: sticky;
    top: 72px;
  }

  :deep(.x-md-editor) {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      scroll-margin-top: 5rem;
    }
  }

  .article-detail {
    position: relative;
  }
  .comment-module {
    margin-top: 1.5rem;
    min-height: 30vh;
  }
  .md-editor {
    font-family:
      HarmonyOS-Sans,
      ZhuZiAWan,
      -apple-system,
      Helvetica Neue,
      Helvetica,
      PingFang SC,
      Hiragino Sans GB,
      Microsoft YaHei,
      Arial,
      sans-serif;
  }
  .md-dark {
    // --md-bk-color: var(--main-bgc);
  }
</style>
