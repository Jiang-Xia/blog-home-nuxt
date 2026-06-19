<script setup lang="ts">
/**
   * 个人中心 · 评论收件箱
   * 数据来源：GET /comment/on-my-articles；status 字段直接渲染，勿本地 map
   */
import { getCommentsOnMyArticles } from '@/api/author';
import { beforeTimeNow } from '@/utils';

const loading = ref(false);
const list = ref<any[]>([]);
const page = ref(1);
const total = ref(0);
const hasMore = ref(true);

const pendingCount = computed(
  () => list.value.filter(item => item.status === 'pending').length,
);

const formatTime = (timeStr?: string) => {
  if (!timeStr) return '';
  return beforeTimeNow(new Date(timeStr).getTime());
};

/** 分页加载作者收到的评论 */
const loadData = async () => {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  try {
    const res = await getCommentsOnMyArticles({ page: page.value, pageSize: 10 });
    const items = res?.list ?? [];
    list.value = [...list.value, ...items];
    total.value = res?.pagination?.total ?? list.value.length;
    hasMore.value = list.value.length < total.value;
    page.value += 1;
  }
  finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<template>
  <div class="inbox-list">
    <div v-if="list.length" class="inbox-list__summary">
      <span class="inbox-list__summary-chip"> 共 {{ total || list.length }} 条 </span>
      <span v-if="pendingCount" class="inbox-list__summary-chip inbox-list__summary-chip--warn">
        {{ pendingCount }} 条待审核
      </span>
    </div>

    <div v-if="loading && !list.length" class="inbox-list__state">
      <span class="loading loading-spinner loading-md text-primary" />
      <p class="mt-3 text-sm text-tech-muted">
        加载评论收件箱...
      </p>
    </div>

    <div v-else-if="!list.length" class="inbox-list__state cyber-glass-card">
      <xia-icon icon="blog-pinglun" width="30px" class="text-tech-muted" />
      <p class="mt-3 text-sm font-medium text-tech">
        暂无收到的评论
      </p>
      <p class="mt-1 text-xs text-tech-muted">
        读者在你的文章下留言后会出现在这里
      </p>
    </div>

    <ul v-else class="inbox-list__items">
      <li
        v-for="item in list"
        :key="item.id"
        class="inbox-item"
        :class="{ 'inbox-item--pending': item.status === 'pending' }"
      >
        <div class="inbox-item__head">
          <div class="inbox-item__avatar">
            <xia-image
              v-if="item.userInfo?.avatar"
              lazyload
              :src="item.userInfo.avatar"
              class="h-full w-full rounded-full object-cover"
              :alt="item.userInfo?.nickname"
            />
            <xia-icon v-else icon="blog-yonghu" width="16px" />
          </div>
          <div class="inbox-item__meta">
            <span class="inbox-item__author">{{ item.userInfo?.nickname || '匿名用户' }}</span>
            <span v-if="item.createTime" class="inbox-item__time">{{
              formatTime(item.createTime)
            }}</span>
          </div>
          <span
            class="inbox-item__status"
            :class="
              item.status === 'pending'
                ? 'inbox-item__status--pending'
                : 'inbox-item__status--approved'
            "
          >
            {{ item.status === 'pending' ? '待审核' : '已通过' }}
          </span>
        </div>

        <p class="inbox-item__content">
          {{ item.content }}
        </p>

        <NuxtLink
          v-if="item.articleId"
          :to="`/detail/${item.articleId}`"
          class="inbox-item__article"
        >
          <xia-icon icon="blog-open-book" width="14px" />
          <span class="truncate">{{ item.articleTitle || '查看文章' }}</span>
        </NuxtLink>
      </li>
    </ul>

    <div v-if="hasMore && list.length" class="inbox-list__more">
      <button
        type="button"
        class="btn btn-sm cyber-btn-secondary"
        :disabled="loading"
        @click="loadData"
      >
        <span v-if="loading" class="loading loading-spinner loading-xs" />
        {{ loading ? '加载中...' : '加载更多' }}
      </button>
    </div>

    <p v-else-if="list.length" class="inbox-list__footer">
      已显示全部 {{ total || list.length }} 条评论
    </p>
  </div>
</template>

<style scoped>
  .inbox-list__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .inbox-list__summary-chip {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    border: 1px solid var(--tech-border);
    background: var(--tech-header);
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
    color: var(--tech-muted, var(--tech-fg-muted));
  }

  .inbox-list__summary-chip--warn {
    border-color: color-mix(in oklch, var(--color-warning) 35%, var(--tech-border));
    color: var(--color-warning);
    background: color-mix(in oklch, var(--color-warning) 8%, transparent);
  }

  .inbox-list__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1rem;
    text-align: center;
  }

  .inbox-list__items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .inbox-item {
    border-radius: 1rem;
    border: 1px solid var(--tech-border);
    background: color-mix(in oklch, var(--tech-glass) 90%, transparent);
    padding: 0.875rem;
    transition:
      border-color 0.2s,
      transform 0.2s;
  }

  .inbox-item:hover {
    border-color: color-mix(in srgb, var(--tech-border) 150%, var(--tech-fg) 18%);
    transform: translateY(-1px);
  }

  .inbox-item--pending {
    border-left: 3px solid var(--color-warning);
  }

  .inbox-item__head {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .inbox-item__avatar {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    overflow: hidden;
    border-radius: 999px;
    border: 1px solid var(--tech-border);
    background: var(--tech-header);
    color: var(--tech-muted, var(--tech-fg-muted));
  }

  .inbox-item__meta {
    min-width: 0;
    flex: 1;
  }

  .inbox-item__author {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--tech-fg);
  }

  .inbox-item__time {
    display: block;
    margin-top: 0.125rem;
    font-size: 0.6875rem;
    color: var(--tech-muted, var(--tech-fg-muted));
  }

  .inbox-item__status {
    flex-shrink: 0;
    border-radius: 999px;
    padding: 0.125rem 0.5rem;
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.04em;
  }

  .inbox-item__status--pending {
    border: 1px solid color-mix(in oklch, var(--color-warning) 35%, transparent);
    background: color-mix(in oklch, var(--color-warning) 10%, transparent);
    color: var(--color-warning);
  }

  .inbox-item__status--approved {
    border: 1px solid color-mix(in oklch, var(--color-success) 35%, transparent);
    background: color-mix(in oklch, var(--color-success) 10%, transparent);
    color: var(--color-success);
  }

  .inbox-item__content {
    margin-top: 0.625rem;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--tech-fg);
    word-break: break-word;
  }

  .inbox-item__article {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    max-width: 100%;
    margin-top: 0.75rem;
    border-radius: 0.625rem;
    border: 1px solid var(--tech-border);
    background: var(--tech-header);
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
    color: var(--color-primary);
    transition:
      border-color 0.2s,
      background-color 0.2s;
  }

  .inbox-item__article:hover {
    border-color: color-mix(in oklch, var(--color-primary) 35%, var(--tech-border));
    background: color-mix(in oklch, var(--color-primary) 8%, transparent);
  }

  .inbox-list__more {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  .inbox-list__footer {
    margin-top: 1rem;
    text-align: center;
    font-size: 0.75rem;
    color: var(--tech-muted, var(--tech-fg-muted));
  }
</style>
