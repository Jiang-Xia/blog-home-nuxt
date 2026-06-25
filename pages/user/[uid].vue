<script setup lang="ts">
/** 他人公开主页；Tab 列表首屏 SSR，超出 10 条 client load more */
import { resolveStaticUrl } from '@/utils/static-url';
import { SiteTitle } from '@/utils/constant';
import { getPublicArticles, getPublicCollects, getPublicLikes } from '@/api/profile';
import { coverAspectRatio } from '@/utils/image-compress';
import { resolveRpgItemEmoji } from '~~/utils/rpg-item-icon';
import { isNotFoundError } from '@/utils/api-error';
import type { UserAchievementProgress } from '~~/types/rpg';

const route = useRoute();
const uid = computed(() => route.params.uid as string);
const { profile, articles, collects, likes, tabTotals, loading, error }
  = await usePublicProfile(uid);
const userInfo = useUserInfo();

const articlesList = ref<any[]>([]);
const collectsList = ref<any[]>([]);
const likesList = ref<any[]>([]);
const tabPages = reactive({ articles: 1, collects: 1, likes: 1 });
const tabHasMore = reactive({ articles: false, collects: false, likes: false });
const tabLoading = ref(false);

watch(
  [articles, collects, likes],
  () => {
    articlesList.value = [...articles.value];
    collectsList.value = [...collects.value];
    likesList.value = [...likes.value];
    tabHasMore.articles = articles.value.length >= 10;
    tabHasMore.collects = collects.value.length >= 10;
    tabHasMore.likes = likes.value.length >= 10;
    tabPages.articles = 1;
    tabPages.collects = 1;
    tabPages.likes = 1;
  },
  { immediate: true },
);

if (error.value && !isNotFoundError(error.value)) {
  throw createError({
    statusCode: 503,
    statusMessage: '加载用户主页失败，请稍后重试',
    fatal: true,
  });
}

if (!loading.value && uid.value && !profile.value) {
  throw createError({
    statusCode: 404,
    statusMessage: '用户不存在',
    fatal: true,
  });
}

type ProfileTab = 'articles' | 'collects' | 'likes';
const activeTab = ref<ProfileTab>('articles');
const { playSfx } = useRpgAudio();

/** 切换已发布 / 收藏 / 点赞 Tab，变更时播放 tabSwitch */
const switchProfileTab = (key: ProfileTab) => {
  if (key !== activeTab.value) void playSfx('tabSwitch');
  activeTab.value = key;
};

const tabOptions: {
  key: ProfileTab;
  label: string;
  totalKey: 'articles' | 'collects' | 'likes';
}[] = [
  { key: 'articles', label: '已发布', totalKey: 'articles' },
  { key: 'collects', label: '收藏', totalKey: 'collects' },
  { key: 'likes', label: '点赞', totalKey: 'likes' },
];

const currentList = computed(() => {
  if (activeTab.value === 'collects') return collectsList.value;
  if (activeTab.value === 'likes') return likesList.value;
  return articlesList.value;
});

/** 当前 Tab 追加下一页（articles / collects / likes） */
const loadMoreForTab = async () => {
  if (tabLoading.value || !tabHasMore[activeTab.value]) return;
  tabLoading.value = true;
  try {
    const nextPage = tabPages[activeTab.value] + 1;
    const fetcher
      = activeTab.value === 'collects'
        ? getPublicCollects
        : activeTab.value === 'likes'
          ? getPublicLikes
          : getPublicArticles;
    const res = await fetcher(uid.value, nextPage, 10);
    const items = res?.list ?? [];
    if (activeTab.value === 'collects') {
      collectsList.value = [...collectsList.value, ...items];
    }
    else if (activeTab.value === 'likes') {
      likesList.value = [...likesList.value, ...items];
    }
    else {
      articlesList.value = [...articlesList.value, ...items];
    }
    tabPages[activeTab.value] = nextPage;
    tabHasMore[activeTab.value] = items.length >= 10;
  }
  finally {
    tabLoading.value = false;
  }
};

const avatarSrc = computed(() => {
  const av = profile.value?.avatar;
  return av ? resolveStaticUrl(av) : '/assets/images/animal/qie.svg';
});

const publicAvatarFrame = computed(() => {
  const frame = profile.value?.loadout?.avatarFrame as
    | { code?: string; name?: string; color?: string | null; effectJson?: { color?: string } }
    | null
    | undefined;
  if (!frame) return null;
  return {
    code: frame.code,
    name: frame.name,
    color: frame.color ?? frame.effectJson?.color ?? null,
  };
});

const pageDescription = computed(() => {
  const intro = profile.value?.intro?.trim();
  if (intro) {
    return intro;
  }
  return `${profile.value?.nickname} 的公开主页，包含已发布文章、收藏与点赞`;
});

definePageMeta({ layout: 'default' });
useHead({
  title: computed(() => `${profile.value?.nickname} 的主页`),
  titleTemplate: title => `${title} - ${SiteTitle}`,
  meta: [
    { name: 'description', content: pageDescription },
    {
      property: 'og:title',
      content: computed(() => `${profile.value?.nickname} 的主页 - ${SiteTitle}`),
    },
    { property: 'og:description', content: pageDescription },
    { property: 'og:type', content: 'profile' },
  ],
});

watch([profile, loading, error], ([currentProfile, isLoading, fetchError]) => {
  if (isLoading || !uid.value) {
    return;
  }
  if (fetchError && !isNotFoundError(fetchError)) {
    throw createError({
      statusCode: 503,
      statusMessage: '加载用户主页失败，请稍后重试',
      fatal: true,
    });
  }
  if (!currentProfile) {
    throw createError({
      statusCode: 404,
      statusMessage: '用户不存在',
      fatal: true,
    });
  }
});
</script>

<template>
  <CyberPageContainer
    label="USER"
    :title="profile?.nickname ? `${profile.nickname} 的主页` : '用户主页'"
    subtitle="公开资料与文章"
  >
    <div v-if="loading" class="py-12 text-center text-tech-muted">
      加载中...
    </div>
    <div v-else-if="profile" class="space-y-5">
      <div class="cyber-glass-card p-6">
        <div class="flex gap-5 items-start">
          <CommonAvatarWithFrame
            :avatar="avatarSrc"
            :alt="profile.nickname"
            :frame="publicAvatarFrame"
            :size="80"
            previewable
          />
          <div class="min-w-0 flex-1">
            <h2 class="text-xl font-bold text-tech">
              {{ profile.nickname }}
            </h2>
            <p class="mt-2 flex flex-wrap gap-2 text-sm text-tech-muted">
              <span class="badge badge-primary badge-sm">Lv{{ profile.level }}</span>
              <span>声望 {{ profile.reputation }}</span>
              <span v-if="profile.createTime">加入于 {{ new Date(profile.createTime).toLocaleDateString() }}</span>
            </p>
            <p v-if="profile.intro" class="mt-2 text-sm text-tech-muted">
              {{ profile.intro }}
            </p>
          </div>
        </div>
        <div v-if="Number(uid) !== userInfo?.uid" class="mt-4">
          <RpgProfileSocialBar :target-uid="Number(uid)" />
        </div>
      </div>

      <div v-if="profile.loadout" class="cyber-glass-card p-5">
        <h3 class="mb-3 text-sm font-semibold text-tech">
          当前装扮
        </h3>
        <div class="flex flex-wrap gap-2">
          <span v-if="profile.loadout.title" class="badge badge-warning gap-1">
            {{ resolveRpgItemEmoji(profile.loadout.title) }} {{ profile.loadout.title.name }}
          </span>
          <span v-if="profile.loadout.avatarFrame" class="badge badge-info gap-1">
            {{ resolveRpgItemEmoji(profile.loadout.avatarFrame) }}
            {{ profile.loadout.avatarFrame.name }}
          </span>
          <span v-if="profile.loadout.pet" class="badge badge-success gap-1">
            {{ resolveRpgItemEmoji(profile.loadout.pet.config) }}
            {{ profile.loadout.pet.nickname || profile.loadout.pet.config?.name }}
          </span>
        </div>
        <div v-if="profile.completedAchievements?.length" class="mt-3 flex flex-wrap gap-1">
          <span
            v-for="ach in profile.completedAchievements"
            :key="ach.code"
            class="badge badge-sm inline-flex items-center gap-1 border"
            :style="{
              backgroundColor: (ach.rarityColor || '#94a3b8') + '20',
              color: ach.rarityColor || '#94a3b8',
              borderColor: ach.rarityColor || '#94a3b8',
            }"
          >
            {{ ach.rarityIcon || '🏆' }} {{ ach.name || ach.code }}
          </span>
        </div>
      </div>

      <div class="cyber-glass-card p-5">
        <div class="flex gap-2 mb-4">
          <button
            v-for="opt in tabOptions"
            :key="opt.key"
            class="btn btn-xs"
            :class="activeTab === opt.key ? 'btn-primary' : 'btn-ghost'"
            @click="switchProfileTab(opt.key)"
          >
            {{ opt.label }}
            <span class="opacity-70">({{ tabTotals[opt.totalKey] ?? 0 }})</span>
          </button>
        </div>

        <div v-if="loading" class="empty-hint">
          <span class="loading loading-spinner loading-md text-primary" />
          <p class="mt-2">
            加载中...
          </p>
        </div>
        <div v-else-if="!currentList.length" class="empty-hint">
          <xia-empty description="暂无内容" />
        </div>
        <div v-else class="article-grid">
          <NuxtLink
            v-for="a in currentList"
            :key="a.id"
            :to="`/detail/${a.id}`"
            class="article-card"
          >
            <div class="article-cover">
              <xia-image
                lazyload
                :src="resolveStaticUrl(a.cover) || '/assets/images/common/LoadFailed.svg'"
                :alt="a.title"
                class="h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
              />
            </div>
            <div class="article-body">
              <h4 class="article-title">
                {{ a.title }}
                <span v-if="a.isMasterpiece" class="badge badge-error badge-xs">神作</span>
              </h4>
              <p v-if="a.description" class="article-desc">
                {{ a.description }}
              </p>
              <div class="article-meta">
                <span>Lv{{ a.articleLevel || 1 }}</span>
                <span>👁 {{ a.views || 0 }}</span>
                <span>❤️ {{ a.likes || 0 }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        <div v-if="tabHasMore[activeTab]" class="mt-4 flex justify-center">
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            :disabled="tabLoading"
            @click="loadMoreForTab"
          >
            <span v-if="tabLoading" class="loading loading-spinner loading-xs" />
            {{ tabLoading ? '加载中...' : '加载更多' }}
          </button>
        </div>
      </div>
    </div>
  </CyberPageContainer>
</template>

<style scoped>
  .empty-hint {
    text-align: center;
    padding: 32px;
    color: var(--tech-fg-subtle);
    font-size: 0.9rem;
  }

  .article-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
  }

  .article-card {
    display: flex;
    gap: 12px;
    padding: 10px;
    border-radius: 12px;
    border: 1px solid var(--tech-border);
    background: var(--tech-input-bg);
    transition:
      border-color 0.2s,
      background 0.2s;
    text-decoration: none;
    color: inherit;
  }

  .article-card:hover {
    border-color: color-mix(in srgb, var(--tech-section-label) 30%, transparent);
    background: color-mix(in srgb, var(--tech-section-label) 5%, var(--tech-shell));
  }

  .article-cover {
    flex-shrink: 0;
    width: 100px;
    aspect-ratio: v-bind(coverAspectRatio);
    border-radius: 8px;
    overflow: hidden;
    background: var(--tech-input-bg);
  }

  .article-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .article-body {
    flex: 1;
    min-width: 0;
  }

  .article-title {
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.35;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    color: var(--tech-fg);
  }

  .article-desc {
    font-size: 0.75rem;
    color: var(--tech-fg-muted);
    margin-top: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .article-meta {
    display: flex;
    gap: 10px;
    margin-top: 6px;
    font-size: 0.7rem;
    color: var(--tech-fg-subtle);
  }
</style>
