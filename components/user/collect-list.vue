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
const formatTime = (item: any) => {
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
      <div v-for="item in list" :key="item.id" class="collect-item">
        <NuxtLink
          :to="`/detail/${item.article?.id || item.articleId}`"
          class="block hover:bg-base-200 transition-colors rounded-lg p-3 -mx-3"
        >
          <h4 class="font-medium text-sm leading-snug line-clamp-2">
            {{ item.article?.title || '文章已删除' }}
          </h4>
          <div class="flex items-center gap-2 mt-1.5 text-xs text-base-content/50">
            <span v-if="item.article?.category?.name" class="badge badge-ghost badge-xs">
              {{ item.article.category.name }}
            </span>
            <span>{{ formatTime(item) }}收藏</span>
          </div>
        </NuxtLink>
      </div>

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
    border-bottom: 1px solid oklch(var(--b3) / 0.5);
  }
  .collect-item:last-child {
    border-bottom: none;
  }
</style>
