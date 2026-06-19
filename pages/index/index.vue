<script setup lang="ts">
import { gushici } from '@/api/index';
import { getArticleList } from '@/api/article';
import { SiteTitle } from '@/utils/constant';

useHead({
  title: '首页',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});

const { data: gushiciData } = await useAsyncData('gushici_Get', () => gushici());
const { data: articleStats } = await useAsyncData('home_ArticleStats', () =>
  getArticleList({ page: 1, pageSize: 1, client: true }),
);

const articleTotal = computed(() => articleStats.value?.pagination?.total ?? 0);
const articleTotalLabel = computed(() =>
  articleTotal.value > 0 ? `${articleTotal.value}+` : '100+',
);

const poetryContent = computed(() => gushiciData.value?.content || '每日诗词');
const poetryAuthor = computed(() => {
  const { author, origin } = gushiciData.value || {};
  if (author && origin) return `${author} — ${origin}`;
  return author || origin || '';
});

const { typedContent, typedAuthor, isTypingContent, isTypingAuthor, showTyped }
  = usePoetryTypewriter(
    () => poetryContent.value,
    () => poetryAuthor.value,
  );

const scrollToArticles = () => {
  document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<template>
  <div>
    <h1 class="hidden">
      首页 - {{ SiteTitle }}
    </h1>

    <section
      class="relative flex flex-col items-center px-4 pb-10 pt-8 text-center md:pb-14 md:pt-12"
    >
      <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl cyber-logo-badge">
        <span class="text-xl font-bold cyber-gradient-text">X</span>
      </div>

      <div
        class="mb-5 inline-flex items-center gap-2 rounded-full border border-tech bg-tech-header px-4 py-1.5 text-sm text-tech-muted"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-success" />
        个人技术博客 · 持续更新中
      </div>

      <div class="poetry-typewriter relative mb-5 w-full max-w-3xl">
        <div class="pointer-events-none select-none opacity-0" aria-hidden="true">
          <h2 class="mb-2 text-2xl font-bold leading-relaxed md:text-4xl">
            <span class="cyber-gradient-text">{{ poetryContent }}</span>
          </h2>
          <p class="mx-auto max-w-xl text-sm md:text-base">
            {{ poetryAuthor || '\u00A0' }}
          </p>
        </div>

        <div class="absolute inset-x-0 top-0 text-center">
          <h2 class="mb-2 text-2xl font-bold leading-relaxed text-tech md:text-4xl">
            <span class="cyber-gradient-text">
              <template v-if="showTyped">{{ typedContent }}</template>
              <template v-else>{{ poetryContent }}</template>
            </span>
            <span v-if="showTyped && isTypingContent" class="typing-cursor">|</span>
          </h2>

          <p class="mx-auto max-w-xl text-sm text-tech-muted md:text-base">
            <template v-if="!showTyped">
              {{ poetryAuthor }}
            </template>
            <template v-else>
              {{ typedAuthor }}
            </template>
            <span v-if="showTyped && isTypingAuthor" class="typing-cursor">|</span>
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <CyberButton variant="primary" class="!px-6 !py-3" @click="scrollToArticles">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 4H20v16H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          浏览文章
        </CyberButton>
        <CyberButton variant="secondary" to="/tool" class="!px-6 !py-3">
          查看工具
        </CyberButton>
        <CyberButton
          variant="secondary"
          to="/rpg"
          class="!px-6 !py-3 !border-[var(--rpg-amber-border)] !text-[var(--rpg-amber-light)]"
        >
          ⚔️ 开始冒险
        </CyberButton>
      </div>

      <div class="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-12">
        <div class="text-center">
          <div class="text-xl font-bold text-primary md:text-2xl">
            {{ articleTotalLabel }}
          </div>
          <div class="mt-1 text-sm text-tech-subtle">
            技术文章
          </div>
        </div>
        <div class="text-center">
          <div class="text-xl font-bold text-primary md:text-2xl">
            15+
          </div>
          <div class="mt-1 text-sm text-tech-subtle">
            实用工具
          </div>
        </div>
        <div class="text-center">
          <div class="text-xl font-bold text-primary md:text-2xl">
            RPG
          </div>
          <div class="mt-1 text-sm text-tech-subtle">
            文字冒险玩法
          </div>
        </div>
      </div>
    </section>

    <RpgHomeBanner class="mb-8" />

    <section id="articles" class="mx-auto max-w-6xl px-4 pb-16">
      <CyberSectionHeader
        class="mb-6"
        label="ARTICLES"
        title="最新文章"
        subtitle="技术分享与生活记录，欢迎阅读与交流"
      />
      <div class="cyber-glass-card p-4 md:p-6">
        <ArticleList />
      </div>
    </section>
  </div>
</template>
