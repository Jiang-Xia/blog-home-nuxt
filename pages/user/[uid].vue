<script setup lang="ts">
/** 他人公开主页 */
import { originUrl, apiPrefix } from '~/config';

const route = useRoute();
const uid = computed(() => route.params.uid as string);
const { profile, articles, collects, likes, loading } = usePublicProfile(uid);
const userInfo = useUserInfo();

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

const resolveStaticUrl = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http') || path.includes('base64')) return path;
  if (path.startsWith('/static')) {
    const isProd = import.meta.env.MODE === 'production';
    return isProd ? `${originUrl}${apiPrefix}${path}` : `${originUrl}${path}`;
  }
  return path;
};

const avatarSrc = computed(() => {
  const av = profile.value?.avatar;
  return av ? resolveStaticUrl(av) : '/assets/images/animal/qie.svg';
});

definePageMeta({ layout: 'default' });
useHead({
  title: computed(() =>
    profile.value?.nickname ? `${profile.value.nickname} 的主页` : '用户主页',
  ),
});
</script>

<template>
  <div class="public-profile padding-top-bar">
    <div class="container max-w-4xl mx-auto px-4 py-6">
      <div v-if="loading" class="text-center py-12 text-base-content/50">
        加载中...
      </div>
      <div v-else-if="profile" class="space-y-5">
        <!-- Hero -->
        <div class="hero-card">
          <div class="hero-bg" />
          <div class="hero-content">
            <div class="avatar-wrap">
              <img :src="avatarSrc" :alt="profile.nickname" class="avatar-img">
            </div>
            <div class="hero-info">
              <h1 class="hero-name">
                {{ profile.nickname }}
              </h1>
              <p class="hero-meta">
                <span class="badge badge-primary badge-sm">Lv{{ profile.level }}</span>
                <span>声望 {{ profile.reputation }}</span>
                <span v-if="profile.createTime">加入于 {{ new Date(profile.createTime).toLocaleDateString() }}</span>
              </p>
              <p v-if="profile.intro" class="hero-intro">
                {{ profile.intro }}
              </p>
            </div>
          </div>
          <div v-if="Number(uid) !== userInfo?.uid" class="hero-actions">
            <RpgProfileSocialBar :target-uid="Number(uid)" />
          </div>
        </div>

        <!-- 装扮 -->
        <div v-if="profile.loadout" class="card bg-base-100 shadow-sm border border-base-200">
          <div class="card-body py-4">
            <h3 class="section-title">
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
        </div>

        <!-- 文章 Tab -->
        <div class="card bg-base-100 shadow-sm border border-base-200">
          <div class="card-body">
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
      </div>
      <div v-else class="text-center py-12">
        用户不存在
      </div>
    </div>
  </div>
</template>

<style scoped>
  .public-profile {
    min-height: 100vh;
  }

  .hero-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 50%, #8b5cf6 100%);
    color: white;
    padding: 24px;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15), transparent 50%);
    pointer-events: none;
  }

  .hero-content {
    position: relative;
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  .avatar-wrap {
    flex-shrink: 0;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.5);
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-name {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .hero-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-top: 8px;
    font-size: 0.85rem;
    opacity: 0.9;
  }

  .hero-intro {
    margin-top: 10px;
    font-size: 0.9rem;
    opacity: 0.85;
    line-height: 1.5;
  }

  .hero-actions {
    position: relative;
    margin-top: 16px;
  }

  .section-title {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 8px;
  }

  .empty-hint {
    text-align: center;
    padding: 32px;
    color: oklch(var(--bc) / 0.45);
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
    border: 1px solid oklch(var(--b3) / 0.6);
    transition:
      box-shadow 0.2s,
      border-color 0.2s;
    text-decoration: none;
    color: inherit;
  }

  .article-card:hover {
    border-color: oklch(var(--p) / 0.4);
    box-shadow: 0 4px 12px oklch(var(--b3) / 0.5);
  }

  .article-cover {
    flex-shrink: 0;
    width: 72px;
    height: 72px;
    border-radius: 8px;
    overflow: hidden;
    background: oklch(var(--b3));
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
  }

  .article-desc {
    font-size: 0.75rem;
    color: oklch(var(--bc) / 0.55);
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
    color: oklch(var(--bc) / 0.5);
  }
</style>
