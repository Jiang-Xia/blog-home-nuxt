<script setup lang="ts">
/** 他人公开主页（SSR 渲染，便于搜索引擎收录） */
import { resolveStaticUrl } from '@/utils/static-url';
import { SiteTitle } from '@/utils/constant';

const route = useRoute();
const uid = computed(() => route.params.uid as string);
const { profile, articles, collects, likes, loading } = await usePublicProfile(uid);
const userInfo = useUserInfo();

if (!profile.value) {
  throw createError({
    statusCode: 404,
    statusMessage: '用户不存在',
    fatal: true,
  });
}

type ProfileTab = 'articles' | 'collects' | 'likes';
const activeTab = ref<ProfileTab>('articles');

const tabOptions: { key: ProfileTab; label: string }[] = [
  { key: 'articles', label: '已发布' },
  { key: 'collects', label: '收藏' },
  { key: 'likes', label: '点赞' },
];

const currentList = computed(() => {
  if (activeTab.value === 'collects') return collects.value;
  if (activeTab.value === 'likes') return likes.value;
  return articles.value;
});

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

watch([profile, loading], ([currentProfile, isLoading]) => {
  if (!isLoading && uid.value && !currentProfile) {
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
            🏆 {{ profile.loadout.title.name }}
          </span>
          <span v-if="profile.loadout.avatarFrame" class="badge badge-info gap-1">
            🖼 {{ profile.loadout.avatarFrame.name }}
          </span>
          <span v-if="profile.loadout.pet" class="badge badge-success gap-1">
            🐾 {{ profile.loadout.pet.nickname || profile.loadout.pet.config?.name }}
          </span>
        </div>
        <div v-if="profile.completedAchievements?.length" class="mt-3 flex flex-wrap gap-1">
          <span
            v-for="ach in profile.completedAchievements"
            :key="ach.achievementCode"
            class="badge badge-outline badge-sm"
          >
            ⭐ {{ ach.name || ach.achievementCode }}
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
            @click="activeTab = opt.key"
          >
            {{ opt.label }}
            <span class="opacity-70">({{
              opt.key === 'articles'
                ? articles.length
                : opt.key === 'collects'
                  ? collects.length
                  : likes.length
            }})</span>
          </button>
        </div>

        <div v-if="!currentList.length" class="empty-hint">
          暂无内容
        </div>
        <div v-else class="article-grid">
          <NuxtLink
            v-for="a in currentList"
            :key="a.id"
            :to="`/detail/${a.id}`"
            class="article-card"
          >
            <div class="article-cover">
              <img
                :src="resolveStaticUrl(a.cover) || '/assets/images/common/LoadFailed.svg'"
                :alt="a.title"
              >
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
    width: 72px;
    height: 72px;
    border-radius: 8px;
    overflow: hidden;
    background: var(--tech-input-bg);
  }

  .article-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
