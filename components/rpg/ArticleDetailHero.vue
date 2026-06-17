<script setup lang="ts">
import defaultImg from '@/assets/images/create.webp';
import { isTrueCoverLink } from '@/utils';
import { formactDate } from '@/utils/common';

const props = defineProps<{
  article: Record<string, any>;
  tagLabel: string;
  tags?: Array<{ label: string; color?: string }>;
  authorUid?: number;
  articleId?: number | string;
}>();

const tagToRgb = (color: string, alpha = 0.24) => {
  if (!color?.startsWith('#') || color.length < 7) return 'transparent';
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const emit = defineEmits<{ like: [] }>();

const coverSrc = computed(() => isTrueCoverLink(props.article.cover) || defaultImg);

const showArticleLevel = computed(
  () => props.article.articleLevel && props.article.articleLevel > 1,
);

const hasRpgHighlights = computed(
  () => showArticleLevel.value || props.article.isMasterpiece || props.article.tipTotal,
);
</script>

<template>
  <section class="article-detail-hero rpg-theme">
    <div class="hero-bg" aria-hidden="true">
      <img :src="coverSrc" :alt="article.category?.label || '文章封面'" class="hero-bg-img">
    </div>
    <div class="hero-overlay" aria-hidden="true" />
    <div class="hero-glow" aria-hidden="true" />
    <div class="hero-watermark" aria-hidden="true">
      ⚔️
    </div>

    <div class="hero-inner">
      <p class="hero-eyebrow">
        <span class="hero-eyebrow-icon">⚔️</span>
        QUEST · 冒险篇章
      </p>

      <h1 class="hero-title">
        {{ article.title }}
      </h1>

      <div v-if="hasRpgHighlights" class="hero-badges">
        <RpgLevelBadge v-if="article.isMasterpiece" :level="0" variant="masterpiece" size="sm" />
        <RpgLevelBadge
          v-if="showArticleLevel"
          :level="article.articleLevel"
          variant="article"
          size="sm"
        />
        <span v-if="article.tipTotal" class="hero-tip-badge"> 💎 {{ article.tipTotal }} 打赏 </span>
      </div>

      <div class="hero-stats">
        <span class="hero-stat">
          <span class="hero-stat-icon-wrap" aria-hidden="true">
            <xia-icon icon="blog-view" width="16px" height="16px" />
          </span>
          <span class="hero-stat-text">
            <span class="hero-stat-value">{{ article.views }}</span>
            <span class="hero-stat-label">阅读</span>
          </span>
        </span>
        <button type="button" class="hero-stat hero-stat--action" @click="emit('like')">
          <span class="hero-stat-icon-wrap" aria-hidden="true">
            <xia-icon
              :icon="article.checked ? 'blog-like-solid' : 'blog-like'"
              width="16px"
              height="16px"
              :class="{ 'text-error': article.checked }"
            />
          </span>
          <span class="hero-stat-text">
            <span class="hero-stat-value">{{ article.likes }}</span>
            <span class="hero-stat-label">点赞</span>
          </span>
        </button>
        <span v-if="article.tipTotal" class="hero-stat hero-stat--tip">
          <span class="hero-stat-icon-wrap hero-stat-icon-wrap--emoji" aria-hidden="true">💎</span>
          <span class="hero-stat-text">
            <span class="hero-stat-value">{{ article.tipTotal }}</span>
            <span class="hero-stat-label">打赏</span>
          </span>
        </span>
      </div>

      <div class="hero-meta">
        <span v-if="article.category?.label" class="hero-chip">
          <span class="hero-chip-icon" aria-hidden="true">
            <xia-icon icon="blog-category" width="14px" height="14px" />
          </span>
          <span class="hero-chip-text">{{ article.category.label }}</span>
        </span>
        <span v-if="tagLabel && !tags?.length" class="hero-chip">
          <span class="hero-chip-icon" aria-hidden="true">
            <xia-icon icon="blog-tag" width="14px" height="14px" />
          </span>
          <span class="hero-chip-text">{{ tagLabel }}</span>
        </span>
        <span
          v-for="tag in tags"
          :key="tag.label"
          class="hero-chip hero-chip--tag"
          :style="{
            borderColor: tag.color,
            color: tag.color,
            backgroundColor: tagToRgb(tag.color || '', 0.18),
          }"
        >
          <span class="hero-chip-icon" aria-hidden="true">
            <xia-icon icon="blog-tag" width="14px" height="14px" />
          </span>
          <span class="hero-chip-text">{{ tag.label }}</span>
        </span>
        <span v-if="article.uTime" class="hero-chip">
          <span class="hero-chip-icon" aria-hidden="true">
            <xia-icon icon="blog-time" width="14px" height="14px" />
          </span>
          <span class="hero-chip-text">更新于 {{ formactDate(article.uTime) }}</span>
        </span>
      </div>

      <div v-if="article.uid" class="hero-rpg-strip">
        <div class="hero-rpg-strip-main">
          <span class="hero-rpg-strip-badge">RPG</span>
          <span class="hero-rpg-strip-text">
            阅读此文可推进冒险任务 · 点赞、收藏、打赏均可获得经验
          </span>
        </div>
        <NuxtLink to="/rpg" class="hero-rpg-link">
          进入冒险大厅
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>

      <RpgArticleHeroSocialBar
        v-if="authorUid"
        :author-uid="authorUid"
        :article-id="articleId ?? article.id"
      />
    </div>
  </section>
</template>

<style scoped>
  .article-detail-hero {
    position: relative;
    overflow: hidden;
    border-bottom: 1px solid var(--rpg-banner-border);
  }

  .hero-bg {
    position: absolute;
    inset: 0;
  }

  .hero-bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.04);
    filter: blur(10px) saturate(1.1);
    opacity: 0.72;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      color-mix(in oklch, var(--color-base-100) 28%, transparent) 0%,
      color-mix(in oklch, var(--color-base-100) 42%, transparent) 45%,
      color-mix(in oklch, var(--color-base-100) 58%, transparent) 100%
    );
  }

  .hero-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(ellipse 55% 45% at 88% 12%, rgb(245 158 11 / 0.18), transparent 60%),
      radial-gradient(ellipse 45% 40% at 8% 88%, rgb(139 92 246 / 0.14), transparent 55%);
  }

  .hero-watermark {
    position: absolute;
    right: -0.5rem;
    top: -1rem;
    font-size: clamp(5rem, 14vw, 9rem);
    line-height: 1;
    opacity: 0.06;
    pointer-events: none;
    user-select: none;
  }

  .hero-inner {
    position: relative;
    z-index: 1;
    max-width: 56rem;
    margin: 0 auto;
    padding: 2.75rem 1rem 2rem;
    text-align: center;
  }

  @media (min-width: 768px) {
    .hero-inner {
      padding: 3.5rem 1rem 2.5rem;
    }
  }

  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.85rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    border: 1px solid var(--rpg-amber-border);
    background: var(--rpg-amber-bg-faint);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--rpg-amber-text);
  }

  .hero-eyebrow-icon {
    font-size: 0.75rem;
    line-height: 1;
  }

  .hero-title {
    margin: 0 0 1rem;
    font-size: clamp(1.625rem, 4.5vw, 2.375rem);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.02em;
    color: var(--rpg-text-heading);
    text-wrap: balance;
  }

  .hero-badges {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  .hero-tip-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.55rem;
    border-radius: 0.375rem;
    border: 1px solid var(--rpg-border);
    background: var(--rpg-diamond-bg);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--rpg-diamond-text);
  }

  .hero-stats {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: center;
    gap: 0.625rem;
    margin-bottom: 1rem;
  }

  .hero-stat {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 5.5rem;
    padding: 0.45rem 0.75rem;
    border-radius: 0.75rem;
    border: 1px solid var(--rpg-border-subtle);
    background: color-mix(in oklch, var(--rpg-surface) 88%, transparent);
    backdrop-filter: blur(8px);
    font-size: 0.8125rem;
    color: var(--rpg-text-body);
    line-height: 1.25;
  }

  .hero-stat--action {
    cursor: pointer;
    font: inherit;
    appearance: none;
    transition:
      border-color 0.2s,
      background 0.2s,
      transform 0.15s;
  }

  .hero-stat--action:hover {
    border-color: var(--rpg-amber-border);
    background: var(--rpg-amber-bg-faint);
    transform: translateY(-1px);
  }

  .hero-stat--tip {
    border-color: color-mix(in oklch, var(--rpg-primary) 35%, var(--rpg-border-subtle));
    background: var(--rpg-diamond-bg);
  }

  .hero-stat-icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    color: var(--rpg-text-secondary);
  }

  .hero-stat-icon-wrap :deep(.x-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .hero-stat-icon-wrap :deep(.x-icon svg) {
    display: block;
    width: 1rem;
    height: 1rem;
  }

  .hero-stat-icon-wrap--emoji {
    font-size: 0.875rem;
    line-height: 1;
  }

  .hero-stat-text {
    display: inline-flex;
    align-items: baseline;
    gap: 0.25rem;
    min-width: 0;
  }

  .hero-stat-value {
    font-weight: 700;
    line-height: 1.25;
    color: var(--rpg-text-heading);
  }

  .hero-stat-label {
    font-size: 0.6875rem;
    line-height: 1.25;
    color: var(--rpg-text-muted);
  }

  .hero-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem 0.875rem;
    margin-bottom: 1.25rem;
  }

  .hero-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    max-width: 100%;
    line-height: 1.25;
  }

  .hero-chip-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 0.875rem;
    height: 0.875rem;
    color: var(--rpg-text-muted);
  }

  .hero-chip-icon :deep(.x-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .hero-chip-icon :deep(.x-icon svg) {
    display: block;
    width: 0.875rem;
    height: 0.875rem;
  }

  .hero-chip-text {
    font-size: 0.8125rem;
    line-height: 1.25;
    color: var(--rpg-text-secondary);
  }

  .hero-rpg-strip {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
    margin-top: 0.25rem;
    padding: 0.75rem 1rem;
    border-radius: 0.875rem;
    border: 1px solid var(--rpg-banner-border);
    background: linear-gradient(
      135deg,
      color-mix(in oklch, var(--rpg-banner-bg) 90%, var(--rpg-amber-bg-faint)),
      var(--rpg-banner-bg)
    );
    text-align: left;
  }

  @media (min-width: 640px) {
    .hero-rpg-strip {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .hero-rpg-strip-main {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    min-width: 0;
  }

  .hero-rpg-strip-badge {
    flex-shrink: 0;
    padding: 0.15rem 0.45rem;
    border-radius: 0.375rem;
    background: var(--rpg-level-badge-gradient);
    font-size: 0.625rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: #fff;
    box-shadow: 0 1px 3px var(--rpg-level-shadow);
  }

  .hero-rpg-strip-text {
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--rpg-text-body);
  }

  .hero-rpg-link {
    flex-shrink: 0;
    align-self: flex-start;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--rpg-amber-text-soft);
    transition: color 0.2s;
  }

  .hero-rpg-link:hover {
    color: var(--rpg-amber-light);
  }

  @media (min-width: 640px) {
    .hero-rpg-link {
      align-self: center;
    }
  }
</style>
