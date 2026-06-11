<script setup lang="ts">
/**
   * 用户写文章 / 编辑文章页面
   */
import { computed, onMounted } from 'vue';
import { getToken, TokenKey } from '@/utils/cookie';
import { messageWarning } from '@/utils/toast';

definePageMeta({
  layout: 'default',
});

const route = useRoute();
const router = useRouter();
const token = useToken();

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

onMounted(() => {
  const currentToken = token.value || getToken(TokenKey);
  if (!currentToken) {
    messageWarning('请先登录后再写文章');
    router.replace({
      path: '/login',
      query: { redirect: route.fullPath },
    });
  }
});
</script>

<template>
  <div class="article-edit-page padding-top-bar">
    <div class="page-container">
      <div class="page-header">
        <NuxtLink to="/user/profile?tab=article" class="back-link"> ← 返回我的文章 </NuxtLink>
        <h1 class="page-title">
          {{ pageHeading }}
        </h1>
        <p class="page-desc">
          {{ pageSubtitle }}
        </p>
      </div>

      <div class="card bg-base-100 shadow-md">
        <div class="card-body p-0 sm:p-0">
          <ClientOnly>
            <UserArticleEditForm :article-id="articleId || undefined" />
            <template #fallback>
              <div
                class="flex flex-col items-center justify-center gap-3 py-12 text-base-content/55 text-sm"
              >
                <span class="loading loading-spinner loading-md text-primary" />
                <p>加载编辑器中…</p>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .article-edit-page {
    min-height: 100vh;
    padding: 104px 16px 32px;
  }

  .page-container {
    max-width: 720px;
    margin: 0 auto;
  }

  .page-header {
    text-align: center;
    margin-bottom: 24px;
    position: relative;
  }

  .back-link {
    position: absolute;
    left: 0;
    top: 4px;
    font-size: 13px;
    color: #3b82f6;
    font-weight: 600;
    text-decoration: none;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 6px;
  }

  .page-desc {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
</style>
