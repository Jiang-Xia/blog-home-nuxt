<!--
  工具箱 · lucky-canvas 抽奖示例页。
  配置：demos/{wheel,grid,slot}.ts；播放器：LuckyDemoCard；静态图：public/lucky-canvas/。
  本页仅为前端库用法演示，禁止商用与赌博相关用途。
-->
<script setup lang="ts">
import { LUCKY_DEMOS, LUCKY_DEMO_TABS, type LuckyDemoType } from './demos/catalog';
import LuckyDemoCard from './components/LuckyDemoCard.client.vue';
import LuckyDisclaimer from './components/LuckyDisclaimer.vue';

type TabKey = LuckyDemoType | 'all';
const activeTab = ref<TabKey>('all');

/** 按 Tab 过滤 catalog；切 Tab 会卸载不可见实例，配合卡片内懒挂载 */
const visibleDemos = computed(() => {
  if (activeTab.value === 'all') return LUCKY_DEMOS;
  return LUCKY_DEMOS.filter(d => d.type === activeTab.value);
});
</script>

<template>
  <div class="lucky-canvas-page mx-auto w-full max-w-6xl space-y-4">
    <CyberToolCard
      title="lucky-canvas 抽奖示例"
      desc="还原 100px.net 完整示例：大转盘 5 · 九宫格 8 · 老虎机 2。纯前端动画演示，无真实奖品发放。"
    >
      <LuckyDisclaimer class="mb-4" />

      <div class="mb-2 flex flex-wrap gap-2">
        <button
          v-for="tab in LUCKY_DEMO_TABS"
          :key="tab.key"
          type="button"
          class="rounded-xl px-3 py-1.5 text-sm transition-all"
          :class="
            activeTab === tab.key
              ? 'border border-primary/30 bg-primary/20 text-primary'
              : 'border border-tech text-tech-muted hover:border-primary/30 hover:text-tech'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <p class="text-xs text-tech-muted">
        基于
        <a
          href="https://100px.net/document/guide.html"
          target="_blank"
          rel="noopener noreferrer"
          class="link link-primary"
        >@lucky-canvas/vue</a>
        · 当前展示 {{ visibleDemos.length }} 个示例 · 改配置见
        <code class="text-tech">demos/wheel.ts</code>
        /
        <code class="text-tech">grid.ts</code>
        /
        <code class="text-tech">slot.ts</code>
      </p>
    </CyberToolCard>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <CyberToolCard
        v-for="demo in visibleDemos"
        :key="demo.id"
        :title="demo.title"
        desc="前端动画演示 · 无真实奖品 · 禁止商用与赌博用途"
        width-class="w-full"
      >
        <LuckyDemoCard :demo="demo" />
      </CyberToolCard>
    </div>
  </div>
</template>
