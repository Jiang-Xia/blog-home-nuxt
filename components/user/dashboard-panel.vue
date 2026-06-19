<script setup lang="ts">
/**
   * 个人中心 · 创作数据看板
   * 数据来源：GET /article/author-stats；指标与 Top5 均来自 API
   */
import { getAuthorStats } from '@/api/author';
import { beforeTimeNow } from '@/utils';

const loading = ref(true);
const stats = ref<any>(null);

const statCards = computed(() => {
  if (!stats.value) return [];
  return [
    {
      key: 'published',
      label: '已发布',
      value: stats.value.published,
      icon: 'blog-open-book',
      tone: 'primary',
    },
    {
      key: 'draft',
      label: '草稿',
      value: stats.value.draft,
      icon: 'blog-write',
      tone: 'default',
    },
    {
      key: 'scheduled',
      label: '定时',
      value: stats.value.scheduled,
      icon: 'blog-plus-circle',
      tone: 'default',
    },
    {
      key: 'totalViews',
      label: '总阅读',
      value: stats.value.totalViews,
      icon: 'blog-view',
      tone: 'cyan',
    },
    {
      key: 'totalLikes',
      label: '总点赞',
      value: stats.value.totalLikes,
      icon: 'blog-like',
      tone: 'pink',
    },
  ];
});

const maxViews = computed(() => {
  const list = stats.value?.topArticles ?? [];
  return Math.max(...list.map((item: any) => item.views || 0), 1);
});

const viewPercent = (views: number | string | undefined) =>
  Math.max(8, Math.round(((Number(views) || 0) / maxViews.value) * 100));

const formatRank = (index: number | string) => String(Number(index) + 1).padStart(2, '0');

onMounted(async () => {
  try {
    stats.value = await getAuthorStats();
  }
  finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="dashboard-panel">
    <div v-if="loading" class="dashboard-panel__loading">
      <span class="loading loading-spinner loading-md text-primary" />
      <p class="mt-3 text-sm text-tech-muted">
        同步创作数据中...
      </p>
    </div>

    <template v-else-if="stats">
      <div class="dashboard-panel__stats">
        <div
          v-for="card in statCards"
          :key="card.key"
          class="dashboard-stat"
          :class="`dashboard-stat--${card.tone}`"
        >
          <div class="dashboard-stat__icon">
            <xia-icon :icon="card.icon" width="18px" />
          </div>
          <div class="dashboard-stat__value">
            {{ card.value ?? 0 }}
          </div>
          <div class="dashboard-stat__label">
            {{ card.label }}
          </div>
        </div>
      </div>

      <section v-if="stats.topArticles?.length" class="dashboard-panel__top">
        <div class="dashboard-panel__top-head">
          <p class="cyber-section-label">
            TOP ARTICLES
          </p>
          <h4 class="dashboard-panel__top-title">
            热门文章排行
          </h4>
        </div>

        <ul class="dashboard-top-list">
          <li v-for="(item, index) in stats.topArticles" :key="item.id" class="dashboard-top-item">
            <span class="dashboard-top-item__rank">{{ formatRank(index) }}</span>
            <div class="dashboard-top-item__body">
              <NuxtLink :to="`/detail/${item.id}`" class="dashboard-top-item__title">
                {{ item.title }}
              </NuxtLink>
              <div class="dashboard-top-item__meta">
                <span class="dashboard-top-item__metric">
                  <xia-icon icon="blog-view" width="13px" />
                  {{ item.views ?? 0 }}
                </span>
                <span class="dashboard-top-item__metric">
                  <xia-icon icon="blog-like" width="13px" />
                  {{ item.likes ?? 0 }}
                </span>
                <span v-if="item.createTime" class="dashboard-top-item__time">
                  {{ beforeTimeNow(new Date(item.createTime).getTime()) }}
                </span>
              </div>
              <div class="dashboard-top-item__bar">
                <span
                  class="dashboard-top-item__bar-fill"
                  :style="{ width: `${viewPercent(item.views)}%` }"
                />
              </div>
            </div>
          </li>
        </ul>
      </section>

      <div v-else class="dashboard-panel__empty cyber-glass-card">
        <xia-icon icon="blog-open-book" width="28px" class="text-tech-muted" />
        <p class="mt-2 text-sm text-tech-muted">
          还没有已发布文章，去写一篇吧
        </p>
        <NuxtLink to="/user/article/edit" class="btn btn-sm cyber-btn-secondary mt-3">
          开始创作
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .dashboard-panel__loading,
  .dashboard-panel__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1rem;
    text-align: center;
  }

  .dashboard-panel__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .dashboard-panel__stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (min-width: 768px) {
    .dashboard-panel__stats {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }

  .dashboard-stat {
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    border: 1px solid var(--tech-border);
    background: color-mix(in oklch, var(--tech-glass) 88%, transparent);
    padding: 0.875rem 0.75rem;
    text-align: center;
    transition:
      border-color 0.2s,
      transform 0.2s;
  }

  .dashboard-stat:hover {
    border-color: color-mix(in srgb, var(--tech-border) 140%, var(--tech-fg) 20%);
    transform: translateY(-1px);
  }

  .dashboard-stat::before {
    content: '';
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(
      to right,
      var(--tech-gradient-from),
      var(--tech-gradient-mid),
      var(--tech-gradient-to)
    );
    opacity: 0.65;
  }

  .dashboard-stat--default::before {
    opacity: 0.35;
  }

  .dashboard-stat--cyan::before {
    background: linear-gradient(to right, #22d3ee, #38bdf8);
  }

  .dashboard-stat--pink::before {
    background: linear-gradient(to right, #f472b6, #fb7185);
  }

  .dashboard-stat__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    margin-bottom: 0.5rem;
    border-radius: 0.625rem;
    border: 1px solid var(--tech-border);
    background: var(--tech-header);
    color: var(--tech-section-label);
  }

  .dashboard-stat--primary .dashboard-stat__value {
    background: linear-gradient(
      to right,
      var(--tech-gradient-from),
      var(--tech-gradient-mid),
      var(--tech-gradient-to)
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .dashboard-stat__value {
    font-size: 1.375rem;
    line-height: 1.2;
    font-weight: 700;
    color: var(--tech-fg);
  }

  .dashboard-stat__label {
    margin-top: 0.25rem;
    font-size: 0.6875rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tech-muted, var(--tech-fg-muted));
  }

  .dashboard-panel__top {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--tech-border);
  }

  .dashboard-panel__top-title {
    margin-top: 0.25rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--tech-fg);
  }

  .dashboard-top-list {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .dashboard-top-item {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    border-radius: 1rem;
    border: 1px solid var(--tech-border);
    background: color-mix(in oklch, var(--tech-glass) 90%, transparent);
    padding: 0.875rem;
    transition:
      border-color 0.2s,
      background-color 0.2s;
  }

  .dashboard-top-item:hover {
    border-color: color-mix(in srgb, var(--tech-border) 150%, var(--tech-fg) 18%);
    background: color-mix(in oklch, var(--color-base-300) 55%, var(--color-base-100));
  }

  .dashboard-top-item__rank {
    flex-shrink: 0;
    width: 2rem;
    font-size: 0.875rem;
    font-weight: 700;
    line-height: 1.75rem;
    text-align: center;
    color: var(--tech-section-label);
    font-variant-numeric: tabular-nums;
  }

  .dashboard-top-item__body {
    min-width: 0;
    flex: 1;
  }

  .dashboard-top-item__title {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.45;
    color: var(--tech-fg);
    transition: color 0.2s;
  }

  .dashboard-top-item__title:hover {
    color: var(--color-primary);
  }

  .dashboard-top-item__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.625rem;
    margin-top: 0.375rem;
    font-size: 0.75rem;
    color: var(--tech-muted, var(--tech-fg-muted));
  }

  .dashboard-top-item__metric {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .dashboard-top-item__time {
    margin-left: auto;
  }

  .dashboard-top-item__bar {
    margin-top: 0.5rem;
    height: 3px;
    overflow: hidden;
    border-radius: 999px;
    background: color-mix(in oklch, var(--tech-border) 70%, transparent);
  }

  .dashboard-top-item__bar-fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(to right, var(--tech-gradient-from), var(--tech-gradient-mid));
    transition: width 0.35s ease;
  }
</style>
