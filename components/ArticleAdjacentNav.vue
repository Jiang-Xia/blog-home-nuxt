<script setup lang="ts">
export interface ArticleNavItem {
  id: number | string;
  title: string;
}

defineProps<{
  prev?: ArticleNavItem | null;
  next?: ArticleNavItem | null;
}>();
</script>

<template>
  <nav
    v-if="prev || next"
    class="article-adjacent-nav mt-6 border-t border-tech pt-4"
    aria-label="作者专栏文章导航"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:gap-3">
      <NuxtLink
        v-if="prev"
        :to="`/detail/${prev.id}`"
        class="adjacent-link group adjacent-link--prev"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="shrink-0 text-tech-faint transition-colors group-hover:text-primary"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="shrink-0 text-xs text-tech-muted">上一篇</span>
        <span class="min-w-0 truncate text-sm text-tech transition-colors group-hover:text-primary">
          {{ prev.title }}
        </span>
      </NuxtLink>
      <div v-else-if="next" class="hidden flex-1 sm:block" aria-hidden="true" />

      <NuxtLink
        v-if="next"
        :to="`/detail/${next.id}`"
        class="adjacent-link group adjacent-link--next"
      >
        <span class="min-w-0 truncate text-sm text-tech transition-colors group-hover:text-primary">
          {{ next.title }}
        </span>
        <span class="shrink-0 text-xs text-tech-muted">下一篇</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="shrink-0 text-tech-faint transition-colors group-hover:text-primary"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped lang="less">
  .adjacent-link {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.625rem;
    border-radius: 0.625rem;
    text-decoration: none;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: var(--tech-header, rgb(255 255 255 / 6%));
    }

    @media (min-width: 640px) {
      flex: 1;
    }

    &--next {
      justify-content: flex-end;
      text-align: right;
    }
  }
</style>
