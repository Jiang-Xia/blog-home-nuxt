<script setup lang="ts">
/**
   * 统一搜索页 /search?q=
   * 复用 ArticleList 组件，keyword 来自 route.query
   */
import { SiteTitle } from '@/utils/constant';

const route = useRoute();
const searchQuery = computed(() => {
  const q = route.query.q;
  return (Array.isArray(q) ? q[0] : q) || '';
});

useHead({
  title: computed(() => (searchQuery.value ? `搜索：${searchQuery.value}` : '搜索')),
  titleTemplate: title => `${title} - ${SiteTitle}`,
});
</script>

<template>
  <CyberPageContainer
    label="SEARCH"
    :title="searchQuery ? `搜索「${searchQuery}」` : '搜索文章'"
    subtitle="在全站文章中查找关键词"
  >
    <div class="cyber-glass-card p-4 md:p-6">
      <ArticleList
        embed-mode
        hide-sidebar
        :preset-keyword="searchQuery"
        :async-data-key="`search_${searchQuery || 'empty'}`"
      />
    </div>
  </CyberPageContainer>
</template>
