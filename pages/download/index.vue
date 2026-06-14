<script setup lang="ts">
import { SiteTitle } from '@/utils/constant';

useHead({
  title: '快速入口',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});

const entries = [
  {
    icon: '📚',
    title: '文章归档',
    desc: '按时间浏览 · 全部文章',
    to: '/archives',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '🛠️',
    title: '工具箱',
    desc: '加密 · AI · 多媒体',
    to: '/tool',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: '✨',
    title: '特色功能',
    desc: 'AI 摘要 · 3D 粒子',
    to: '/features',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: '🎮',
    title: 'RPG 冒险',
    desc: '文字冒险 · 排行榜',
    to: '/rpg',
    color: 'from-green-500 to-teal-500',
  },
];
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-12 md:py-20">
    <CyberSectionHeader
      class="mb-12"
      label="EXPLORE"
      title="快速入口"
      subtitle="选择你感兴趣的方向，一键直达"
    />

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NuxtLink v-for="item in entries" :key="item.to" :to="item.to" class="group no-underline">
        <CyberCard hover class="flex flex-col items-center text-center !p-8">
          <div
            :class="[
              'mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg',
              item.color,
            ]"
          >
            {{ item.icon }}
          </div>
          <h3
            class="mb-2 text-lg font-semibold text-tech group-hover:text-primary transition-colors"
          >
            {{ item.title }}
          </h3>
          <p class="mb-6 text-sm text-tech-subtle">
            {{ item.desc }}
          </p>
          <span
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-tech bg-tech-header py-2.5 text-sm text-tech-muted transition-all group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            进入
          </span>
        </CyberCard>
      </NuxtLink>
    </div>

    <div class="mt-8 space-y-4">
      <CyberAlert variant="warning">
        <p>
          <strong>新用户提示：</strong>
          注册登录后可以发表文章、评论互动，在个人中心管理你的内容。
        </p>
      </CyberAlert>
      <CyberAlert variant="info">
        <p>
          <strong>工具箱推荐：</strong>
          试试 AI 文章摘要、RSA/SM 加密、水印处理等实用工具，全部免费开放使用。
        </p>
      </CyberAlert>
    </div>
  </div>
</template>
