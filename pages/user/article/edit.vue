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
const { theme, clickIcon } = useThemeActions();

const articleId = computed(() => {
  const id = route.query.id;
  if (Array.isArray(id)) return id[0] || '';
  return (id as string) || '';
});

const isEdit = computed(() => !!articleId.value);
const pageTitle = computed(() => (isEdit.value ? '编辑文章' : '写文章'));

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
    <div class="page-hero-bg">
      <InFlickeringGrid
        class="relative inset-0 z-0 [mask-image:radial-gradient(650px_circle_at_center,white,transparent)]"
        :square-size="4"
        :grid-gap="6"
        color="#4ba6c6"
        :max-opacity="0.4"
        :flicker-chance="0.1"
      />
      <xia-icon
        class="cursor-pointer px-3 absolute right-2 top-10 text-white z-20"
        :icon="'blog-' + theme"
        @click="clickIcon"
      />
    </div>

    <div class="page-container">
      <div class="page-header">
        <NuxtLink to="/user/profile?tab=article" class="btn btn-ghost btn-xs back-btn gap-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </NuxtLink>
        <h1 class="page-title">
          {{ pageTitle }}
        </h1>
      </div>

      <div class="card bg-base-100 shadow-md border border-base-300/50">
        <div class="card-body p-3 md:p-4">
          <ClientOnly>
            <UserArticleEditForm :article-id="articleId || undefined" />
            <template #fallback>
              <div class="flex justify-center py-10">
                <span class="loading loading-spinner loading-md text-primary" />
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
    padding: 104px 12px 24px;
    position: relative;
  }

  .page-hero-bg {
    position: absolute;
    inset: 0 0 auto 0;
    height: 100px;
    z-index: 0;
    pointer-events: none;
  }

  .page-hero-bg :deep(.cursor-pointer) {
    pointer-events: auto;
  }

  .page-container {
    position: relative;
    z-index: 1;
    max-width: 900px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .back-btn {
    flex-shrink: 0;
    color: oklch(var(--bc) / 0.65);
    padding-left: 0.25rem;
    padding-right: 0.5rem;
  }

  .page-title {
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.3;
  }
</style>
