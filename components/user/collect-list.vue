<script setup lang="ts">
/**
   * 用户收藏文章列表组件
   * 展示当前用户收藏的文章，支持分页加载
   */
import { ref, onMounted } from 'vue';
import { getMyCollectList } from '@/api/article';
import { beforeTimeNow } from '@/utils';

const loading = ref(false);
const list = ref<any[]>([]);
const page = ref(1);
const pageSize = 10;
const total = ref(0);
const hasMore = ref(true);

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  publish: { label: '已发布', class: 'badge-outline badge-success' },
  draft: { label: '草稿', class: 'badge-outline' },
  scheduled: { label: '定时发布', class: 'badge-outline badge-warning' },
};

const getArticle = (item: any) => item.article;

const getStatusBadge = (article: any) => {
  if (!article) {
    return { label: '已删除', class: 'badge-outline badge-error' };
  }
  if (article.isDelete) {
    return { label: '已禁用', class: 'badge-outline badge-error' };
  }
  return STATUS_MAP[article.status] || { label: article.status, class: 'badge-outline' };
};

const canVisit = (article: any) => article?.status === 'publish' && !article?.isDelete;

const getTagLabels = (article: any) => {
  const tags = article?.tags || [];
  return tags
    .map((tag: { label?: string; name?: string }) => tag.label || tag.name)
    .filter(Boolean);
};

/** 加载收藏列表 */
const loadData = async () => {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  try {
    const res = await getMyCollectList({ page: page.value, pageSize });
    const items = res?.list || [];
    const pagination = res?.pagination || {};
    list.value = [...list.value, ...items];
    total.value = pagination.total || 0;
    hasMore.value = list.value.length < total.value;
    page.value++;
  }
  catch {
    // 请求失败由全局拦截器处理
  }
  finally {
    loading.value = false;
  }
};

/** 格式化收藏时间 */
const formatCollectTime = (item: any) => {
  const t = item.createTime ? new Date(item.createTime).getTime() : 0;
  return beforeTimeNow(t);
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="collect-list">
    <!-- 加载中（首次） -->
    <div v-if="loading && list.length === 0" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-md text-primary" />
    </div>

    <!-- 空状态 -->
    <div v-else-if="list.length === 0" class="text-center py-10 text-base-content/50">
      <p class="text-3xl mb-2">
        📭
      </p>
      <p>还没有收藏文章</p>
    </div>

    <!-- 列表 -->
    <div v-else>
      <article v-for="item in list" :key="item.id" class="collect-item">
        <div class="collect-item-inner rounded-lg p-3 -mx-3 hover:bg-base-200/70 transition-colors">
          <component
            :is="canVisit(getArticle(item)) ? 'NuxtLink' : 'div'"
            v-bind="
              canVisit(getArticle(item))
                ? { to: `/detail/${getArticle(item)?.id || item.articleId}` }
                : {}
            "
            class="block min-w-0"
            :class="{ 'opacity-80': !canVisit(getArticle(item)) }"
          >
            <h4 class="font-medium text-sm leading-snug line-clamp-2">
              {{ getArticle(item)?.title || '文章已删除' }}
            </h4>
            <p
              v-if="getArticle(item)?.description"
              class="text-xs text-base-content/50 mt-1 line-clamp-1"
            >
              {{ getArticle(item).description }}
            </p>

            <!-- 状态 + 标签 -->
            <div class="collect-tags mt-2">
              <span class="badge badge-xs shrink-0" :class="getStatusBadge(getArticle(item)).class">
                {{ getStatusBadge(getArticle(item)).label }}
              </span>
              <span
                v-if="getArticle(item)?.topping"
                class="badge badge-outline badge-primary badge-xs shrink-0"
              >置顶</span>
              <span
                v-if="getArticle(item)?.category?.label"
                class="badge badge-outline badge-secondary badge-xs shrink-0"
              >
                {{ getArticle(item).category.label }}
              </span>
              <span
                v-for="(label, index) in getTagLabels(getArticle(item))"
                :key="`${item.id}-tag-${index}`"
                class="badge badge-outline badge-xs shrink-0"
              >
                {{ label }}
              </span>
            </div>

            <!-- 统计信息 -->
            <div class="collect-meta mt-1.5">
              <span>{{ formatCollectTime(item) }}收藏</span>
              <template v-if="canVisit(getArticle(item))">
                <span class="meta-dot" aria-hidden="true">·</span>
                <span>{{ getArticle(item)?.views ?? 0 }} 阅读</span>
                <span class="meta-dot" aria-hidden="true">·</span>
                <span>{{ getArticle(item)?.likes ?? 0 }} 点赞</span>
              </template>
            </div>
          </component>
        </div>
      </article>

      <!-- 加载更多 -->
      <div v-if="hasMore" class="flex justify-center pt-4">
        <button class="btn btn-ghost btn-sm" :disabled="loading" @click="loadData">
          <span v-if="loading" class="loading loading-spinner loading-xs" />
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>
      <div v-else-if="list.length > 0" class="text-center pt-4 pb-2 text-xs text-base-content/40">
        已显示全部 {{ total }} 条收藏
      </div>
    </div>
  </div>
</template>

<style scoped>
  .collect-item {
    border-bottom: 1px solid color-mix(in oklab, var(--color-base-300) 50%, transparent);
  }

  .collect-item:last-child {
    border-bottom: none;
  }

  .collect-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .collect-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: color-mix(in oklab, var(--color-base-content) 50%, transparent);
  }

  .meta-dot {
    opacity: 0.45;
  }
</style>
