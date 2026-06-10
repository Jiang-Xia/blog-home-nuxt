<script setup lang="ts">
/**
   * 用户文章列表组件
   * 展示当前用户编写的所有文章，支持分页加载
   */
import { ref, onMounted } from 'vue';
import { getMyArticleList } from '@/api/article';
import { beforeTimeNow } from '@/utils';

const loading = ref(false);
const list = ref<any[]>([]);
const page = ref(1);
const pageSize = 10;
const total = ref(0);
const hasMore = ref(true);

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  publish: { label: '已发布', class: 'badge-success' },
  draft: { label: '草稿', class: 'badge-ghost' },
  scheduled: { label: '定时发布', class: 'badge-warning' },
};

const getStatusBadge = (item: any) => {
  if (item.isDelete) {
    return { label: '已禁用', class: 'badge-error' };
  }
  return STATUS_MAP[item.status] || { label: item.status, class: 'badge-ghost' };
};

const canVisit = (item: any) => item.status === 'publish' && !item.isDelete;

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
    <div v-else-if="list.length === 0" class="text-center py-10 text-base-content/50">
      <p class="text-3xl mb-2">
        📝
      </p>
      <p>还没有编写文章</p>
    </div>

    <!-- 列表 -->
    <div v-else>
      <div v-for="item in list" :key="item.id" class="article-item">
        <div class="article-item-inner rounded-lg p-3 -mx-3 hover:bg-base-200 transition-colors">
          <div class="flex items-start justify-between gap-3">
            <NuxtLink v-if="canVisit(item)" :to="`/detail/${item.id}`" class="flex-1 min-w-0">
              <h4 class="font-medium text-sm leading-snug line-clamp-2">
                {{ item.title }}
              </h4>
              <p v-if="item.description" class="text-xs text-base-content/50 mt-1 line-clamp-1">
                {{ item.description }}
              </p>
              <div class="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-base-content/50">
                <span v-if="item.category?.label" class="badge badge-ghost badge-xs">
                  {{ item.category.label }}
                </span>
                <span class="badge badge-xs" :class="getStatusBadge(item).class">
                  {{ getStatusBadge(item).label }}
                </span>
                <span v-if="item.topping" class="badge badge-primary badge-xs">置顶</span>
                <span>{{ formatTime(item) }}</span>
                <span>{{ item.views ?? 0 }} 阅读</span>
                <span>{{ item.likes ?? 0 }} 点赞</span>
              </div>
            </NuxtLink>
            <div v-else class="flex-1 min-w-0">
              <h4 class="font-medium text-sm leading-snug line-clamp-2 text-base-content/70">
                {{ item.title }}
              </h4>
              <p v-if="item.description" class="text-xs text-base-content/50 mt-1 line-clamp-1">
                {{ item.description }}
              </p>
              <div class="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-base-content/50">
                <span v-if="item.category?.label" class="badge badge-ghost badge-xs">
                  {{ item.category.label }}
                </span>
                <span class="badge badge-xs" :class="getStatusBadge(item).class">
                  {{ getStatusBadge(item).label }}
                </span>
                <span>{{ formatTime(item) }}</span>
              </div>
            </div>
            <NuxtLink
              :to="`/user/article/edit?id=${item.id}`"
              class="btn btn-ghost btn-xs shrink-0"
              title="编辑文章"
            >
              编辑
            </NuxtLink>
          </div>
        </div>
      </div>

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
    border-bottom: 1px solid oklch(var(--b3) / 0.5);
  }
  .article-item:last-child {
    border-bottom: none;
  }
</style>
