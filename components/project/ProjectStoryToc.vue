<script setup lang="ts">
/**
   * 项目页顶部锚点目录：快速跳到各叙事区块。
   * 数据：PROJECT_STORIES 顺序；点击更新 hash 并平滑滚动。
   */
import { PROJECT_STORIES } from '~/constants/project-stories';

/** 滚到对应 slug，并写入 location.hash 便于分享 */
const scrollToStory = (slug: string) => {
  const el = document.getElementById(slug);
  if (!el) {
    return;
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  history.replaceState(null, '', `#${slug}`);
};
</script>

<template>
  <nav
    class="project-toc sticky top-0 z-20 -mx-1 mb-8 overflow-x-auto rounded-xl border border-tech bg-tech-header/90 px-2 py-2 backdrop-blur-md"
    aria-label="项目目录"
  >
    <ul class="flex min-w-max items-center gap-1 sm:min-w-0 sm:flex-wrap">
      <li v-for="story in PROJECT_STORIES" :key="story.slug">
        <a
          :href="`#${story.slug}`"
          class="inline-flex items-center rounded-lg px-3 py-1.5 text-sm text-tech-muted no-underline transition-colors hover:bg-tech-shell/60 hover:text-tech"
          @click.prevent="scrollToStory(story.slug)"
        >
          {{ story.title }}
        </a>
      </li>
    </ul>
  </nav>
</template>
