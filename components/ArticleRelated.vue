<script setup lang="ts">
/**
   * 详情页相关文章推荐
   * 数据来源：GET /article/related；SSR 首屏 useAsyncData
   */
import { getRelatedArticles } from '@/api/author';

const props = defineProps<{
  articleId: string | number;
}>();

const { data } = await useAsyncData(
  () => `related_${props.articleId}`,
  () => getRelatedArticles(props.articleId, 6),
);

const relatedList = computed(() => data.value?.list ?? []);
</script>

<template>
  <section v-if="relatedList.length" class="article-related mt-6 border-t border-tech pt-4">
    <h3 class="mb-3 text-sm font-semibold text-tech-muted">
      相关推荐
    </h3>
    <div class="grid gap-2 sm:grid-cols-2">
      <NuxtLink
        v-for="item in relatedList"
        :key="item.id"
        :to="`/detail/${item.id}`"
        class="rounded-lg border border-tech bg-tech-header/30 px-3 py-2 no-underline transition-colors hover:border-primary/40 hover:bg-tech-header"
      >
        <p class="truncate text-sm font-medium text-tech">
          {{ item.title }}
        </p>
        <p v-if="item.description" class="mt-1 line-clamp-1 text-xs text-tech-muted">
          {{ item.description }}
        </p>
      </NuxtLink>
    </div>
  </section>
</template>
