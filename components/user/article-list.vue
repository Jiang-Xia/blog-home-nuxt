<script setup lang="ts">
/**
   * 用户文章列表组件
   * - 分页加载我的文章
   * - 客户端状态/标题筛选（status 字段来自 API，badge 文案本地映射）
   */
import { ref, onMounted, computed, watch } from 'vue';
import { getMyArticleList, disableArticle } from '@/api/article';
import { beforeTimeNow } from '@/utils';
import { messageSuccess, messageError } from '~~/utils/toast';

const loading = ref(false);
const list = ref<any[]>([]);
const page = ref(1);
const pageSize = 10;
const total = ref(0);
const hasMore = ref(true);
const statusFilter = ref<'all' | 'publish' | 'draft' | 'scheduled'>('all');
const titleKeyword = ref('');

/** 客户端筛选：状态 Tab + 标题关键字 */
const filteredList = computed(() => {
  let rows = list.value;
  if (statusFilter.value !== 'all') {
    rows = rows.filter(item => item.status === statusFilter.value);
  }
  const kw = titleKeyword.value.trim().toLowerCase();
  if (kw) {
    rows = rows.filter(item => (item.title || '').toLowerCase().includes(kw));
  }
  return rows;
});

const resetAndLoad = async () => {
  page.value = 1;
  list.value = [];
  hasMore.value = true;
  await loadData();
};

watch(statusFilter, () => {
  // 状态筛选在客户端进行；若列表未拉全则继续 load
});

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  publish: { label: '已发布', class: 'badge-outline badge-success' },
  draft: { label: '草稿', class: 'badge-outline' },
  scheduled: { label: '定时发布', class: 'badge-outline badge-warning' },
};

const getStatusBadge = (item: any) => {
  return STATUS_MAP[item.status] || { label: item.status, class: 'badge-outline' };
};

const canVisit = (item: any) => item.status === 'publish';

const getTagLabels = (item: any) => {
  const tags = item.tags || [];
  return tags
    .map((tag: { label?: string; name?: string }) => tag.label || tag.name)
    .filter(Boolean);
};

const deletingId = ref<number | null>(null);
const confirm = useConfirmDialog();

/** 软删除文章 */
const handleDelete = async (item: { id: number; title?: string }) => {
  const confirmed = await confirm({
    title: '删除文章',
    description: `确定删除「${item.title || '未命名文章'}」吗？删除后将不再对外展示。`,
    confirmLabel: '删除',
    cancelLabel: '取消',
    confirmColor: 'error',
  });
  if (!confirmed) return;
  deletingId.value = item.id;
  try {
    await disableArticle(item.id, true);
    list.value = list.value.filter(row => row.id !== item.id);
    total.value = Math.max(0, total.value - 1);
    messageSuccess('文章已删除');
  }
  catch {
    messageError('删除失败，请稍后重试');
  }
  finally {
    deletingId.value = null;
  }
};

/** 加载文章列表 */
const loadData = async () => {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  try {
    const res = await getMyArticleList({ page: page.value, pageSize });
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

/** 格式化发布时间 */
const formatTime = (item: any) => {
  const t = item.createTime ? new Date(item.createTime).getTime() : 0;
  return beforeTimeNow(t);
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="article-list">
    <!-- 加载中（首次） -->
    <div v-if="loading && list.length === 0" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-md text-primary" />
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredList.length === 0" class="text-center py-10 text-base-content/50">
      <p class="text-3xl mb-2">
        📝
      </p>
      <p>还没有编写文章</p>
    </div>

    <!-- 列表 -->
    <div v-else>
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" class="tabs tabs-boxed tabs-sm">
          <button
            v-for="tab in [
              { key: 'all', label: '全部' },
              { key: 'publish', label: '已发布' },
              { key: 'draft', label: '草稿' },
              { key: 'scheduled', label: '定时' },
            ]"
            :key="tab.key"
            type="button"
            role="tab"
            class="tab"
            :class="{ 'tab-active': statusFilter === tab.key }"
            @click="statusFilter = tab.key as typeof statusFilter"
          >
            {{ tab.label }}
          </button>
        </div>
        <input
          v-model="titleKeyword"
          type="search"
          class="input input-bordered input-sm w-full sm:max-w-xs"
          placeholder="搜索标题..."
          aria-label="搜索文章标题"
        >
      </div>
      <article v-for="item in filteredList" :key="item.id" class="article-item">
        <div class="article-item-inner rounded-lg p-3 -mx-3 hover:bg-base-200/70 transition-colors">
          <div class="flex items-start justify-between gap-3">
            <component
              :is="canVisit(item) ? 'NuxtLink' : 'div'"
              v-bind="canVisit(item) ? { to: `/detail/${item.id}` } : {}"
              class="flex-1 min-w-0"
              :class="{ 'opacity-80': !canVisit(item) }"
            >
              <h4 class="font-medium text-sm leading-snug line-clamp-2">
                {{ item.title }}
              </h4>
              <p v-if="item.description" class="text-xs text-base-content/50 mt-1 line-clamp-1">
                {{ item.description }}
              </p>

              <!-- 状态 + 标签 -->
              <div class="article-tags mt-2">
                <span class="badge badge-xs shrink-0" :class="getStatusBadge(item).class">
                  {{ getStatusBadge(item).label }}
                </span>
                <span
                  v-if="item.topping"
                  class="badge badge-outline badge-primary badge-xs shrink-0"
                >置顶</span>
                <span
                  v-if="item.category?.label"
                  class="badge badge-outline badge-secondary badge-xs shrink-0"
                >
                  {{ item.category.label }}
                </span>
                <span
                  v-for="(label, index) in getTagLabels(item)"
                  :key="`${item.id}-tag-${index}`"
                  class="badge badge-outline badge-xs shrink-0"
                >
                  {{ label }}
                </span>
              </div>

              <!-- 统计信息 -->
              <div class="article-meta mt-1.5">
                <span>{{ formatTime(item) }}</span>
                <template v-if="canVisit(item)">
                  <span class="meta-dot" aria-hidden="true">·</span>
                  <span>{{ item.views ?? 0 }} 阅读</span>
                  <span class="meta-dot" aria-hidden="true">·</span>
                  <span>{{ item.likes ?? 0 }} 点赞</span>
                </template>
              </div>
            </component>

            <div class="flex flex-col gap-1 shrink-0">
              <NuxtLink
                :to="`/user/article/edit?id=${item.id}`"
                class="btn btn-ghost btn-xs"
                title="编辑文章"
              >
                编辑
              </NuxtLink>
              <button
                type="button"
                class="btn btn-ghost btn-xs text-error"
                title="删除文章"
                :disabled="deletingId === item.id"
                @click="handleDelete(item)"
              >
                {{ deletingId === item.id ? '删除中...' : '删除' }}
              </button>
            </div>
          </div>
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
        已显示全部 {{ total }} 篇文章
      </div>
    </div>
  </div>
</template>

<style scoped>
  .article-item {
    border-bottom: 1px solid color-mix(in oklab, var(--color-base-300) 50%, transparent);
  }

  .article-item:last-child {
    border-bottom: none;
  }

  .article-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .article-meta {
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
