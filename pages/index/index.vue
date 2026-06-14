<script setup lang="ts">
import { gushici } from '@/api/index';
import { SiteTitle } from '@/utils/constant';

useHead({
  title: '首页',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});

interface GushiciData {
  content?: string;
  author?: string;
  origin?: string;
}

const gushiciData = ref<GushiciData>({});

try {
  const { data } = await useAsyncData('gushici_Get', () => gushici());
  gushiciData.value = data.value || {};
}
catch (error) {
  console.log(error);
}

const scrollToArticles = () => {
  document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<template>
  <div>
    <h1 class="hidden">
      首页 - {{ SiteTitle }}
    </h1>

    <!-- Hero -->
    <section
      class="relative flex flex-col items-center px-4 pb-16 pt-12 text-center md:pb-24 md:pt-20"
    >
      <!-- Logo icon -->
      <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl cyber-logo-badge">
        <span class="text-2xl font-bold cyber-gradient-text">X</span>
      </div>

      <!-- Badge -->
      <div
        class="mb-8 inline-flex items-center gap-2 rounded-full border border-tech bg-tech-header px-4 py-1.5 text-sm text-tech-muted"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-success" />
        v2.0 · 个人技术博客 · 持续更新中
      </div>

      <!-- Title -->
      <h2 class="mb-4 text-4xl font-bold leading-tight text-tech md:text-6xl">
        让技术分享<br>
        <span class="cyber-gradient-text">更有温度</span>
      </h2>

      <!-- Subtitle -->
      <p class="mb-2 max-w-xl text-sm text-tech-muted md:text-base">
        前端与后端技术笔记 · 工作心得 · 生活点滴
      </p>
      <p v-if="gushiciData.content" class="mb-8 max-w-lg text-xs text-tech-faint md:text-sm">
        {{ gushiciData.content }}
        <span v-if="gushiciData.author"> — {{ gushiciData.author }}</span>
      </p>
      <p v-else class="mb-8" />

      <!-- CTAs -->
      <div class="flex flex-wrap items-center justify-center gap-4">
        <CyberButton variant="primary" class="!px-8 !py-3.5" @click="scrollToArticles">
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
        <CyberButton variant="secondary" to="/features" class="!px-8 !py-3.5">
          查看特性
        </CyberButton>
      </div>

      <!-- Stats -->
      <div class="mt-16 flex flex-wrap items-center justify-center gap-10 md:gap-16">
        <div class="text-center">
          <div class="text-2xl font-bold text-primary md:text-3xl">
            100+
          </div>
          <div class="mt-1 text-sm text-tech-subtle">
            技术文章
          </div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-primary md:text-3xl">
            15+
          </div>
          <div class="mt-1 text-sm text-tech-subtle">
            实用工具
          </div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-primary md:text-3xl">
            4 年
          </div>
          <div class="mt-1 text-sm text-tech-subtle">
            持续更新
          </div>
        </div>
      </div>
    </section>

    <!-- Articles -->
    <section id="articles" class="mx-auto max-w-6xl px-4 pb-20">
      <CyberSectionHeader
        class="mb-10"
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
