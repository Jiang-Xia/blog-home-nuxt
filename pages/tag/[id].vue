<script setup lang="ts">
/**
   * 标签落地页 /tag/[id]
   * 预置 article-list 标签筛选；SEO title 来自 getAllTag
   */
import { getAllTag } from '@/api/tag';
import { SiteTitle } from '@/utils/constant';

const route = useRoute();
const tagId = computed(() => route.params.id as string);

const { data: tags } = await useAsyncData('tag_meta', () => getAllTag());
const tagMeta = computed(() => tags.value?.find((t: { id: string }) => t.id === tagId.value));

useHead({
  title: computed(() => (tagMeta.value?.label ? `标签：${tagMeta.value.label}` : '标签')),
  titleTemplate: title => `${title} - ${SiteTitle}`,
});
</script>

<template>
  <CyberPageContainer
    label="TAG"
    :title="tagMeta?.label ? `# ${tagMeta.label}` : '标签文章'"
    subtitle="该标签下的全部文章"
  >
    <div class="cyber-glass-card p-4 md:p-6">
      <ArticleList
        embed-mode
        hide-sidebar
        :preset-tags="[tagId]"
        :async-data-key="`tag_${tagId}`"
      />
    </div>
  </CyberPageContainer>
</template>
