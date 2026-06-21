<script setup lang="ts">
/**
   * 站点品牌 Logo — 导航栏与首页首屏共用
   */
import { SiteBrandName } from '@/utils/constant';

const sizeMap = {
  sm: {
    badge: 'h-9 w-9 rounded-xl text-sm',
    title: 'text-lg',
  },
  md: {
    badge: 'h-12 w-12 rounded-2xl text-xl',
    title: 'text-lg',
  },
} as const;

withDefaults(
  defineProps<{
    size?: keyof typeof sizeMap;
    /** 徽标：导航 X / 首页 RPG ⚔️ */
    mark?: 'x' | 'sword';
    /** 是否显示站点名称 */
    showTitle?: boolean;
    /** 导航栏小屏隐藏标题 */
    hideTitleOnMobile?: boolean;
  }>(),
  {
    size: 'sm',
    mark: 'x',
    showTitle: true,
    hideTitleOnMobile: true,
  },
);
</script>

<template>
  <div class="flex shrink-0 items-center gap-2.5">
    <div
      class="flex items-center justify-center"
      :class="[
        mark === 'x' ? 'cyber-logo-badge font-bold' : 'site-logo-badge cyber-logo-badge',
        sizeMap[size].badge,
      ]"
      aria-hidden="true"
    >
      <span v-if="mark === 'sword'" class="leading-none select-none">⚔️</span>
      <span v-else class="cyber-gradient-text leading-none select-none">X</span>
    </div>
    <span
      v-if="showTitle"
      class="font-semibold text-tech"
      :class="[sizeMap[size].title, hideTitleOnMobile && 'hidden sm:inline']"
    >
      {{ SiteBrandName }}
    </span>
  </div>
</template>
