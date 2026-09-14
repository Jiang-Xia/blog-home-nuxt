<script setup lang="ts">
/**
   * 项目叙事块：问题 → 方案 →（可选）相关文章。
   * Demo 仍由外层 CyberProjectSection 负责；本组件只补文字与互链。
   */
import type { ProjectStory } from '~/constants/project-stories';

defineProps<{
  story: ProjectStory;
}>();
</script>

<template>
  <div class="project-story mb-4 space-y-4">
    <p class="text-sm text-tech-muted">
      {{ story.tagline }}
    </p>

    <div class="grid gap-3" :class="story.full ? 'md:grid-cols-2' : 'md:grid-cols-2'">
      <CyberCard class="!p-4">
        <p class="cyber-section-label mb-2">
          问题
        </p>
        <p class="text-sm leading-relaxed text-tech">
          {{ story.problem }}
        </p>
      </CyberCard>
      <CyberCard class="!p-4">
        <p class="cyber-section-label mb-2">
          方案
        </p>
        <p class="text-sm leading-relaxed text-tech">
          {{ story.solution }}
        </p>
      </CyberCard>
    </div>

    <CyberCard v-if="story.articles.length" class="!p-4">
      <div class="mb-3 flex items-baseline justify-between gap-2">
        <p class="cyber-section-label mb-0">
          相关文章
        </p>
        <span class="text-xs text-tech-faint">
          {{ story.full ? '连读这些能串起实现细节' : '延伸阅读' }}
        </span>
      </div>
      <ul class="space-y-2">
        <li v-for="item in story.articles" :key="item.id">
          <NuxtLink
            :to="`/detail/${item.id}`"
            class="group flex flex-col gap-0.5 rounded-lg border border-tech px-3 py-2 no-underline transition-colors hover:border-primary/40 hover:bg-tech-header/40 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3"
          >
            <span class="text-sm font-medium text-tech group-hover:text-primary">
              {{ item.title }}
            </span>
            <span class="shrink-0 text-xs text-tech-muted">
              {{ item.note }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </CyberCard>
  </div>
</template>
