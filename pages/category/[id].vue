<script setup lang="ts">
/**
   * 分类落地页 /category/[id]
   * 预置 article-list 分类筛选；SEO title 来自 getAllCategory
   */
import { getAllCategory } from '@/api/category';
import { SiteTitle } from '@/utils/constant';

const route = useRoute();
const categoryId = computed(() => route.params.id as string);

const { data: categories } = await useAsyncData('category_meta', () => getAllCategory());
const categoryMeta = computed(() =>
  categories.value?.find((c: { id: string }) => c.id === categoryId.value),
);

useHead({
  title: computed(() =>
    categoryMeta.value?.label ? `分类：${categoryMeta.value.label}` : '分类',
  ),
  titleTemplate: title => `${title} - ${SiteTitle}`,
});
</script>

<template>
  <CyberPageContainer
    label="CATEGORY"
    :title="categoryMeta?.label || '分类文章'"
    subtitle="该分类下的全部文章"
  >
    <div class="cyber-glass-card p-4 md:p-6">
      <ArticleList
        embed-mode
        hide-sidebar
        :preset-category="categoryId"
        :async-data-key="`category_${categoryId}`"
      />
    </div>
  </CyberPageContainer>
</template>
