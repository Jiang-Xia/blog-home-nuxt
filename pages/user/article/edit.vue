<script setup lang="ts">
/**
   * 用户写文章 / 编辑文章页面
   */
import { computed } from 'vue';

definePageMeta({
  layout: 'default',
});

const route = useRoute();

const articleId = computed(() => {
  const id = route.query.id;
  if (Array.isArray(id)) return id[0] || '';
  return (id as string) || '';
});

const isEdit = computed(() => !!articleId.value);
const pageTitle = computed(() => (isEdit.value ? '编辑文章' : '写文章'));
const pageHeading = computed(() => (isEdit.value ? '✏️ 编辑文章' : '✍️ 写文章'));
const pageSubtitle = computed(() =>
  isEdit.value ? '修改内容后保存即可更新' : '写下灵感，与世界分享你的故事',
);

useHead({
  title: pageTitle,
});
</script>

<template>
  <CyberPageContainer
    label="EDITOR"
    :title="pageHeading"
    :subtitle="pageSubtitle"
    back-to="/user/profile?tab=article"
    back-label="返回我的文章"
    max-width="max-w-6xl"
  >
    <div class="article-edit-shell">
      <ClientOnly>
        <UserArticleEditForm :article-id="articleId || undefined" />
        <template #fallback>
          <div
            class="flex flex-col items-center justify-center gap-3 py-12 text-sm text-tech-subtle"
          >
            <span class="loading loading-spinner loading-md text-primary" />
            <p>加载编辑器中…</p>
          </div>
        </template>
      </ClientOnly>
    </div>
  </CyberPageContainer>
</template>
