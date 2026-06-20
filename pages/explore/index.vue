<script setup lang="ts">
import { SiteTitle } from '@/utils/constant';

useHead({
  title: '快速入口',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});

interface QuickEntry {
  icon: string;
  title: string;
  desc: string;
  tags: string[];
  to: string;
  color: string;
  span: string;
}

const entries: QuickEntry[] = [
  {
    icon: '📚',
    title: '文章归档',
    desc: '按时间浏览全部文章，支持分类标签与全文检索。',
    tags: ['归档', '标签', '浏览'],
    to: '/archives',
    color: 'from-blue-500 to-cyan-500',
    span: 'md:col-span-6',
  },
  {
    icon: '🛠️',
    title: '工具箱',
    desc: '加密解密、AI 摘要、多媒体处理等实用 Web 工具。',
    tags: ['加密', 'AI', '多媒体'],
    to: '/tool',
    color: 'from-purple-500 to-pink-500',
    span: 'md:col-span-6',
  },
  {
    icon: '🖼️',
    title: '光影边框',
    desc: '品牌相框一键生成，支持 EXIF 水印与自定义边框样式。',
    tags: ['相框', 'EXIF', '水印'],
    to: '/tool/photos',
    color: 'from-orange-500 to-red-500',
    span: 'md:col-span-4',
  },
  {
    icon: '⚔️',
    title: 'RPG 冒险',
    desc: '签到升级、任务奖励、抽奖开宝箱，解锁称号与头像框。',
    tags: ['签到', '任务', '抽奖'],
    to: '/rpg',
    color: 'from-amber-500 to-orange-500',
    span: 'md:col-span-4',
  },
  {
    icon: '📦',
    title: '开源与合作',
    desc: '三端项目说明、后端闭源政策与付费技术咨询入口。',
    tags: ['三端', '开源', '合作'],
    to: '/open-source',
    color: 'from-emerald-500 to-teal-500',
    span: 'md:col-span-4',
  },
];
</script>

<template>
  <CyberPageContainer label="EXPLORE" title="快速入口" subtitle="选择你感兴趣的方向，一键直达">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-12">
      <NuxtLink
        v-for="item in entries"
        :key="item.to"
        :to="item.to"
        :class="['group no-underline', item.span]"
      >
        <CyberCard hover class="flex h-full flex-col !p-5">
          <div
            :class="[
              'mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-lg',
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
          <p class="mb-3 flex-1 text-sm leading-relaxed text-tech-muted">
            {{ item.desc }}
          </p>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="tag in item.tags" :key="tag" class="cyber-feature-tag">{{ tag }}</span>
          </div>
        </CyberCard>
      </NuxtLink>
    </div>

    <div class="mt-6 space-y-3">
      <CyberAlert variant="warning">
        <p>
          <strong>新用户提示：</strong>
          注册登录后可以发表文章、评论互动，在个人中心管理你的内容。
        </p>
      </CyberAlert>
      <CyberAlert variant="info">
        <p>
          <strong>冒险玩法：</strong>
          登录后进入「冒险」页签到、做任务、抽奖开宝箱，阅读评论也能推进任务进度，解锁称号与头像框。
        </p>
      </CyberAlert>
    </div>
  </CyberPageContainer>
</template>
