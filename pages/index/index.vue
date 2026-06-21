<script setup lang="ts">
import { gushici } from '@/api/index';
import { getArticleList } from '@/api/article';
import { SiteTitle, TOOL_LINKS } from '@/utils/constant';

useHead({
  title: '首页',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});

const { data: gushiciData } = await useAsyncData('gushici_Get', () => gushici(), {
  default: () => null,
});

/** 与 ArticleList 默认 asyncDataKey 共用，避免首页再打一遍 list 只为取 total */
const { data: indexArticleData } = await useAsyncData('index_GetList', () =>
  getArticleList({
    page: 1,
    pageSize: 12,
    client: true,
    sort: 'DESC',
    category: '',
    tags: [],
    title: '',
    description: '',
    content: '',
  }),
);

const articleTotal = computed(() => indexArticleData.value?.pagination?.total ?? 0);
const articleTotalLabel = computed(() =>
  articleTotal.value > 0 ? `${articleTotal.value}+` : '100+',
);
const toolCountLabel = `${TOOL_LINKS.length}+`;

const poetryContent = computed(() => gushiciData.value?.content?.trim() || '每日诗词');
const poetryAuthor = computed(() => {
  const { author, origin } = gushiciData.value || {};
  if (author && origin) return `${author} — ${origin}`;
  return author || origin || '';
});

const { displayedContent, displayedAuthor, isTypingContent, isTypingAuthor }
  = usePoetryTypewriter(
    () => poetryContent.value,
    () => poetryAuthor.value,
  );

const scrollToArticles = () => {
  document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' });
};

const heroStats = computed(() => [
  { value: articleTotalLabel.value, label: '技术文章', gradient: false },
  { value: toolCountLabel, label: '实用工具', gradient: false },
  { value: '8 大', label: 'RPG 冒险玩法', gradient: true },
]);
</script>

<template>
  <div>
    <h1 class="hidden">
      首页 - {{ SiteTitle }}
    </h1>

    <!-- 首屏：桌面锁定视口；移动端自然流式，Banner 仅展示至主按钮 -->
    <div class="home-first-screen mx-auto max-w-6xl px-4">
      <section class="home-hero">
        <div class="home-hero-inner mx-auto flex w-full max-w-6xl flex-col min-h-0">
          <div class="home-hero-brand flex shrink-0 justify-center">
            <div class="home-hero-brand-chip inline-flex max-w-full items-center gap-2">
              <div
                class="home-hero-brand-icon site-logo-badge flex shrink-0 items-center justify-center rounded-md"
                aria-hidden="true"
              >
                <span class="leading-none select-none">⚔️</span>
              </div>
              <div
                class="flex min-w-0 items-center gap-2 pr-0.5 text-sm leading-snug text-tech-muted md:text-base"
              >
                <span class="home-hero-status-dot h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                <span>Blog × RPG · 签到 · 任务 · 抽奖 · 排行榜</span>
              </div>
            </div>
          </div>

          <!-- 视觉中心：每日诗词独占舞台区 -->
          <div class="home-hero-stage flex min-h-0 flex-1 items-center justify-center">
            <div class="home-hero-focus relative w-full max-w-3xl text-center">
              <div class="poetry-typewriter home-hero-poetry relative z-[1] w-full">
                <h2 class="home-hero-poetry-title font-bold leading-relaxed">
                  <span class="cyber-gradient-text">{{ displayedContent }}</span>
                  <span v-if="isTypingContent" class="typing-cursor">|</span>
                </h2>
                <p class="home-hero-poetry-author mx-auto max-w-xl text-tech-muted">
                  {{ displayedAuthor }}
                  <span v-if="isTypingAuthor" class="typing-cursor">|</span>
                </p>
              </div>
            </div>
          </div>

          <!-- 次要操作区：简介 + 按钮 + 数据 -->
          <div
            class="home-hero-cta mx-auto flex w-full max-w-3xl shrink-0 flex-col items-center text-center"
          >
            <p class="home-hero-tagline max-w-2xl text-sm text-tech-muted md:text-base">
              技术博客，也是冒险世界
              <span class="mx-1.5 text-tech-subtle">·</span>
              读文章 · 做任务 · 冲排行榜
            </p>

            <div class="home-hero-buttons flex flex-wrap items-center justify-center gap-3">
              <CyberButton
                variant="primary"
                to="/rpg"
                class="home-hero-btn !border-[var(--rpg-amber-border)]"
              >
                ⚔️ 开始冒险
              </CyberButton>
              <CyberButton variant="secondary" class="home-hero-btn" @click="scrollToArticles">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 4H20v16H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
                浏览文章
              </CyberButton>
              <CyberButton variant="secondary" to="/features/rpg-guide" class="home-hero-btn">
                冒险攻略
              </CyberButton>
            </div>

            <div class="home-hero-stats flex flex-wrap items-center justify-center gap-6 md:gap-10">
              <div v-for="stat in heroStats" :key="stat.label" class="text-center">
                <div
                  class="home-hero-stat-value font-bold"
                  :class="stat.gradient ? 'home-hero-gradient-text' : 'text-primary'"
                >
                  {{ stat.value }}
                </div>
                <div class="mt-1 text-xs text-tech-subtle md:text-sm">
                  {{ stat.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RpgHomeBanner first-screen class="home-first-screen-banner" />
    </div>

    <section id="articles" class="mx-auto max-w-6xl px-3 pb-16 pt-8 sm:px-4">
      <CyberSectionHeader
        class="mb-6"
        label="ARTICLES"
        title="最新文章"
        subtitle="技术分享与生活记录，欢迎阅读与交流"
      />
      <div class="cyber-glass-card overflow-visible p-2 sm:p-4 md:p-6">
        <ArticleList />
      </div>
    </section>
  </div>
</template>

<style scoped>
  .home-first-screen {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding-bottom: 0.75rem;
  }

  @media (min-width: 1024px) {
    .home-first-screen {
      height: calc(100dvh - 4rem);
    }
  }

  /* Hero 占满 Banner 以上空间，诗词居中为视觉焦点 */
  .home-hero {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    padding-top: clamp(0.5rem, 2vh, 1.25rem);
  }

  .home-hero-inner {
    flex: 1;
    transform-origin: top center;
  }

  .home-hero-brand {
    margin-bottom: clamp(0.75rem, 2vh, 1.25rem);
  }

  .home-hero-brand-chip {
    border: 1px solid var(--tech-border);
    border-radius: 9999px;
    background: color-mix(in oklch, var(--color-base-200) 55%, var(--color-base-100));
    padding: 0.3125rem 0.875rem 0.3125rem 0.4375rem;
    backdrop-filter: blur(8px);
  }

  .home-hero-brand-icon {
    height: 1.25rem;
    width: 1.25rem;
    font-size: 0.6875rem;
    animation: home-hero-icon-breathe 2.2s ease-in-out infinite;
    box-shadow: none;
  }

  @keyframes home-hero-icon-breathe {
    0%,
    100% {
      box-shadow: 0 0 0 0 color-mix(in oklch, var(--color-primary) 20%, transparent);
    }

    50% {
      box-shadow:
        0 0 0 1px color-mix(in oklch, var(--color-primary) 12%, transparent),
        0 0 3px color-mix(in oklch, var(--rpg-amber) 10%, transparent);
    }
  }

  .home-hero-status-dot {
    animation: home-status-breathe 2.2s ease-in-out infinite;
  }

  @keyframes home-status-breathe {
    0%,
    100% {
      opacity: 1;
      box-shadow: 0 0 0 0 color-mix(in oklch, var(--color-success) 45%, transparent);
    }

    50% {
      opacity: 0.55;
      box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-success) 28%, transparent);
    }
  }

  .home-hero-stage {
    padding: clamp(0.25rem, 1.5vh, 1rem) 0;
    overflow-x: clip;
    overflow-y: visible;
  }

  .home-hero-focus {
    padding: clamp(0.5rem, 2vh, 1.25rem) clamp(0.5rem, 2vw, 1rem);
    overflow-x: clip;
    overflow-y: visible;
  }

  /* 光晕跟随诗词区域；横向 inset 控制在舞台内，避免移动端左滑露底 */
  .home-hero-poetry::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: -35%;
    right: -8%;
    bottom: -25%;
    left: -8%;
    pointer-events: none;
    background: radial-gradient(
      ellipse 70% 62% at 50% 42%,
      color-mix(in oklch, var(--color-primary) 11%, transparent) 0%,
      color-mix(in oklch, var(--color-secondary) 5%, transparent) 38%,
      transparent 68%
    );
  }

  .home-hero-poetry {
    margin-bottom: 0;
    overflow-x: clip;
    overflow-y: visible;
  }

  /* 随视口宽度平滑缩放，等同 text-2xl ↔ md:text-4xl */
  .home-hero-poetry-title {
    font-size: clamp(1.5rem, 1.35vw + 1rem, 2.5rem);
    margin-bottom: clamp(0.5rem, 1.2vh, 0.875rem);
    text-wrap: balance;
  }

  .home-hero-poetry-author {
    font-size: clamp(0.875rem, 0.25vw + 0.8rem, 1rem);
    min-height: 1.25rem;
  }

  .home-hero-cta {
    gap: clamp(1rem, 2.5vh, 1.5rem);
    padding-bottom: clamp(0.25rem, 1.5vh, 0.75rem);
  }

  .home-hero-tagline {
    margin-bottom: 0;
  }

  .home-hero-buttons {
    margin-bottom: 0;
  }

  .home-hero-stats {
    margin-top: 0;
    gap: clamp(1.5rem, 4vw, 2.5rem);
    opacity: 0.92;
  }

  .home-hero-btn {
    padding: 0.625rem 1.375rem !important;
    font-size: 0.875rem;
  }

  .home-hero-stat-value {
    font-size: clamp(0.9375rem, 0.45vw + 0.75rem, 1.25rem);
  }

  .home-first-screen-banner {
    flex: 0 0 auto;
    margin-top: auto;
  }

  .home-hero-gradient-text {
    background: linear-gradient(
      to right,
      var(--tech-gradient-from),
      var(--rpg-amber-light),
      var(--tech-gradient-to)
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
  }

  /* 大屏：舞台区更突出 */
  @media (min-height: 960px) {
    .home-hero-brand {
      margin-bottom: 1rem;
    }

    .home-hero-focus {
      padding: 1.75rem 1.5rem;
    }

    .home-hero-cta {
      gap: 1.5rem;
    }
  }

  /* 视口较矮时收紧次要区，保留诗词舞台 */
  @media (max-height: 900px) {
    .home-hero-brand {
      margin-bottom: 0.5rem;
    }

    .home-hero-focus {
      padding: 0.75rem 0.5rem;
    }

    .home-hero-cta {
      gap: 0.875rem;
    }

    .home-hero-tagline {
      font-size: 0.8125rem;
    }
  }

  @media (max-height: 780px) and (min-width: 1024px) {
    .home-hero-inner {
      transform: scale(0.94);
    }
  }

  @media (max-height: 700px) and (min-width: 1024px) {
    .home-hero-inner {
      transform: scale(0.88);
    }
  }

  /* 手机端：自然往下排版，字号略大于桌面紧凑态 */
  @media (max-width: 1023px) {
    .home-first-screen {
      height: auto;
      min-height: 0;
      padding-bottom: 1rem;
    }

    .home-hero {
      flex: none;
      min-height: auto;
      padding-top: 0.625rem;
    }

    .home-hero-inner {
      flex: none;
      transform: none !important;
    }

    .home-hero-brand {
      margin-bottom: 0.875rem;
    }

    .home-hero-stage {
      flex: none;
      min-height: auto;
      padding: 0.5rem 0 0.875rem;
    }

    .home-hero-focus {
      padding: 0.5rem 0.25rem;
    }

    .home-hero-poetry-title {
      font-size: clamp(1.25rem, 4.5vw + 0.5rem, 1.75rem);
      line-height: 1.6;
      margin-bottom: 0.5rem;
    }

    .home-hero-poetry-author {
      font-size: 0.9375rem;
    }

    .home-hero-poetry::before {
      top: -20%;
      right: -10%;
      bottom: -14%;
      left: -10%;
    }

    .home-hero-tagline {
      font-size: 0.9375rem;
      line-height: 1.6;
    }

    .home-hero-cta {
      gap: 1rem;
      padding-bottom: 0;
    }

    .home-hero-btn {
      padding: 0.75rem 1.5rem !important;
      font-size: 0.9375rem;
    }

    .home-hero-stat-value {
      font-size: 1.125rem;
    }

    .home-hero-stats {
      gap: 1.5rem;
    }

    .home-first-screen-banner {
      margin-top: 1rem;
    }
  }
</style>
