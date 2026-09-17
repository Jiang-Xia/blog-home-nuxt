<script setup lang="ts">
/**
   * 文章详情「出自项目」回链。
   * 数据：constants/project-stories 中 articles 反向索引，无额外 API。
   */
import { findProjectsByArticleId } from '~/constants/project-stories';

const props = defineProps<{
  articleId: string | number;
}>();

const projects = computed(() => findProjectsByArticleId(props.articleId));
</script>

<template>
  <section
    v-if="projects.length"
    class="article-project-origin mt-6 rounded-xl border border-tech bg-tech-header/30 px-4 py-3"
  >
    <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-tech-muted">
      出自项目
    </p>
    <ul class="flex flex-wrap gap-2">
      <li v-for="p in projects" :key="p.slug">
        <NuxtLink
          :to="`/projects#${p.slug}`"
          class="inline-flex items-center gap-1.5 rounded-full border border-tech bg-tech-shell/40 px-3 py-1 text-sm text-tech no-underline transition-colors hover:border-primary/50 hover:text-primary"
        >
          <span>{{ p.title }}</span>
          <span class="text-tech-faint">→</span>
        </NuxtLink>
      </li>
    </ul>
    <p class="mt-2 text-xs text-tech-muted">
      问题、方案与在线 Demo 见项目页对应区块
    </p>
  </section>
</template>
