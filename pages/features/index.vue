<script setup lang="ts">
import { SiteTitle } from '@/utils/constant';

useHead({
  title: '特色功能',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});

const features = [
  {
    icon: '⚡',
    title: 'AI 文章摘要',
    desc: '使用先进 AI 技术，自动为长文章生成精准摘要，支持多种风格和长度选择。',
    to: '/tool/ai-summary',
    color: 'from-blue-500 to-cyan-500',
    span: 'md:col-span-7',
    large: true,
    highlight: '智能 AI',
  },
  {
    icon: '🔄',
    title: '一键登录体验',
    desc: '注册登录后即可发表文章、评论互动，个人中心一站式管理。',
    to: '/login',
    color: 'from-purple-500 to-violet-500',
    span: 'md:col-span-5',
    large: false,
  },
  {
    icon: '💻',
    title: '全平台工具箱',
    desc: '加密、AI、多媒体等 15+ 实用工具，Web 端开箱即用。',
    to: '/tool',
    color: 'from-orange-500 to-red-500',
    span: 'md:col-span-5',
    large: false,
  },
  {
    icon: '♾️',
    title: '无限创意空间',
    desc: '3D 粒子背景、技术雷达图、阅读进度环等创新交互，为博客带来科技感体验。支持鼠标交互，沉浸式视觉。',
    to: '/features',
    color: 'from-cyan-500 to-blue-500',
    span: 'md:col-span-7',
    large: true,
    highlight: '3D 粒子',
  },
];

const steps = [
  { num: '1', title: '浏览文章', desc: '在首页或归档页发现感兴趣的技术内容' },
  { num: '2', title: '注册登录', desc: '创建账号，解锁评论、发文等互动功能' },
  { num: '3', title: '探索工具', desc: '使用 AI 摘要、加密工具等提升效率' },
];
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-12 md:py-20">
    <CyberSectionHeader
      class="mb-12"
      label="FEATURES"
      title="为技术分享而生"
      subtitle="把繁琐的操作交给工具，你只管专注阅读与创作"
    />

    <div class="mb-20 grid grid-cols-1 gap-4 md:grid-cols-12">
      <NuxtLink
        v-for="item in features"
        :key="item.title"
        :to="item.to"
        :class="['group no-underline', item.span]"
      >
        <CyberCard hover :class="['flex flex-col', item.large ? '!p-8 md:!p-10' : '!p-6']">
          <div
            :class="[
              'mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-lg',
              item.color,
            ]"
          >
            {{ item.icon }}
          </div>
          <h3 v-if="item.highlight" class="mb-3 text-2xl font-bold text-tech md:text-3xl">
            <span class="cyber-gradient-text">{{ item.highlight }}</span>
            <span v-if="item.title.includes('AI')"> 摘要</span>
            <span v-else-if="item.title.includes('创意')"> 创意</span>
          </h3>
          <h3 v-else class="mb-3 text-xl font-bold text-tech">
            {{ item.title }}
          </h3>
          <p
            class="text-sm leading-relaxed text-tech-muted group-hover:text-tech transition-colors"
          >
            {{ item.desc }}
          </p>
          <div
            class="mt-4 flex items-center gap-1 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100"
          >
            立即体验
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </CyberCard>
      </NuxtLink>
    </div>

    <CyberSectionHeader
      class="mb-10"
      label="GET STARTED"
      title="三步开始使用"
      subtitle="注册登录后即可畅享，遇到问题可在留言板反馈"
    />

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <CyberCard v-for="step in steps" :key="step.num" class="!p-6 text-center">
        <div
          class="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-lg font-bold text-primary"
        >
          {{ step.num }}
        </div>
        <h4 class="mb-2 font-semibold text-tech">
          {{ step.title }}
        </h4>
        <p class="text-sm text-tech-subtle">
          {{ step.desc }}
        </p>
      </CyberCard>
    </div>
  </div>
</template>
