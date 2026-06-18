<script setup lang="ts">
/**
   * 用户评论/回复列表组件
   * 包含两个子标签页：评论和回复，支持分页加载
   */
import { ref, watch, onMounted } from 'vue';
import { getMyComments, getMyReplies } from '@/api/article';
import { beforeTimeNow } from '@/utils';

/** 当前子标签：comment | reply */
const activeTab = ref<'comment' | 'reply'>('comment');

// ========== 评论 ==========
const commentLoading = ref(false);
const commentList = ref<any[]>([]);
const commentPage = ref(1);
const commentPageSize = 10;
const commentTotal = ref(0);
const commentHasMore = ref(true);

const loadComments = async () => {
  if (commentLoading.value || !commentHasMore.value) return;
  commentLoading.value = true;
  try {
    const res = await getMyComments({ page: commentPage.value, pageSize: commentPageSize });
    const items = res?.list || [];
    const pagination = res?.pagination || {};
    commentList.value = [...commentList.value, ...items];
    commentTotal.value = pagination.total || 0;
    commentHasMore.value = commentList.value.length < commentTotal.value;
    commentPage.value++;
  }
  catch {
    // 全局拦截器处理
  }
  finally {
    commentLoading.value = false;
  }
};

// ========== 回复 ==========
const replyLoading = ref(false);
const replyList = ref<any[]>([]);
const replyPage = ref(1);
const replyPageSize = 10;
const replyTotal = ref(0);
const replyHasMore = ref(true);

const loadReplies = async () => {
  if (replyLoading.value || !replyHasMore.value) return;
  replyLoading.value = true;
  try {
    const res = await getMyReplies({ page: replyPage.value, pageSize: replyPageSize });
    const items = res?.list || [];
    const pagination = res?.pagination || {};
    replyList.value = [...replyList.value, ...items];
    replyTotal.value = pagination.total || 0;
    replyHasMore.value = replyList.value.length < replyTotal.value;
    replyPage.value++;
  }
  catch {
    // 全局拦截器处理
  }
  finally {
    replyLoading.value = false;
  }
};

/** 格式化时间 */
const formatTime = (timeStr: string) => {
  const t = timeStr ? new Date(timeStr).getTime() : 0;
  return beforeTimeNow(t);
};

/** 截断文本 */
const truncate = (text: string, maxLen = 60) => {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
};

/** 切换子标签 */
watch(activeTab, (val) => {
  if (val === 'comment' && commentList.value.length === 0) {
    loadComments();
  }
  else if (val === 'reply' && replyList.value.length === 0) {
    loadReplies();
  }
});

onMounted(() => {
  loadComments();
  getMyReplies({ page: 1, pageSize: 1 })
    .then((res) => {
      replyTotal.value = res?.pagination?.total || 0;
    })
    .catch(() => {});
});
</script>

<template>
  <div class="comment-reply-list">
    <!-- 子标签切换 -->
    <div class="flex gap-1 mb-4">
      <button
        class="btn btn-xs"
        :class="activeTab === 'comment' ? 'btn-primary' : 'btn-ghost'"
        @click="activeTab = 'comment'"
      >
        评论 ({{ commentTotal }})
      </button>
      <button
        class="btn btn-xs"
        :class="activeTab === 'reply' ? 'btn-primary' : 'btn-ghost'"
        @click="activeTab = 'reply'"
      >
        回复 ({{ replyTotal }})
      </button>
    </div>

    <!-- ========== 评论列表 ========== -->
    <div v-show="activeTab === 'comment'">
      <div v-if="commentLoading && commentList.length === 0" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-md text-primary" />
      </div>
      <div v-else-if="commentList.length === 0" class="text-center py-8 text-base-content/50">
        <p class="text-2xl mb-2">
          💬
        </p>
        <p>还没有发表评论</p>
      </div>
      <div v-else>
        <div v-for="item in commentList" :key="item.id" class="comment-item">
          <p class="text-sm leading-relaxed">
            {{ item.content }}
          </p>
          <div class="flex items-center gap-2 mt-1.5 text-xs text-base-content/50">
            <NuxtLink
              v-if="item.articleId"
              :to="`/detail/${item.articleId}`"
              class="link link-hover text-primary/70"
            >
              {{ item.articleTitle || '查看文章' }}
            </NuxtLink>
            <span>{{ formatTime(item.createTime) }}</span>
          </div>
        </div>

        <div v-if="commentHasMore" class="flex justify-center pt-4">
          <button class="btn btn-ghost btn-sm" :disabled="commentLoading" @click="loadComments">
            <span v-if="commentLoading" class="loading loading-spinner loading-xs" />
            {{ commentLoading ? '加载中...' : '加载更多' }}
          </button>
        </div>
        <div v-else class="text-center pt-4 pb-2 text-xs text-base-content/40">
          已显示全部 {{ commentTotal }} 条评论
        </div>
      </div>
    </div>

    <!-- ========== 回复列表 ========== -->
    <div v-show="activeTab === 'reply'">
      <div v-if="replyLoading && replyList.length === 0" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-md text-primary" />
      </div>
      <div v-else-if="replyList.length === 0" class="text-center py-8 text-base-content/50">
        <p class="text-2xl mb-2">
          ↩️
        </p>
        <p>还没有发表回复</p>
      </div>
      <div v-else>
        <div v-for="item in replyList" :key="item.id" class="reply-item">
          <p class="text-sm leading-relaxed">
            {{ item.content }}
          </p>
          <div
            v-if="item.parentCommentContent"
            class="mt-1.5 pl-3 border-l-2 border-base-300 text-xs text-base-content/40 italic"
          >
            {{ truncate(item.parentCommentContent) }}
          </div>
          <div class="flex items-center gap-2 mt-1.5 text-xs text-base-content/50">
            <NuxtLink
              v-if="item.articleId"
              :to="`/detail/${item.articleId}`"
              class="link link-hover text-primary/70"
            >
              {{ item.articleTitle || '查看文章' }}
            </NuxtLink>
            <span>{{ formatTime(item.createTime) }}</span>
          </div>
        </div>

        <div v-if="replyHasMore" class="flex justify-center pt-4">
          <button class="btn btn-ghost btn-sm" :disabled="replyLoading" @click="loadReplies">
            <span v-if="replyLoading" class="loading loading-spinner loading-xs" />
            {{ replyLoading ? '加载中...' : '加载更多' }}
          </button>
        </div>
        <div v-else class="text-center pt-4 pb-2 text-xs text-base-content/40">
          已显示全部 {{ replyTotal }} 条回复
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .comment-item,
  .reply-item {
    padding: 10px 0;
    border-bottom: 1px solid oklch(var(--b3) / 0.5);
  }
  .comment-item:last-child,
  .reply-item:last-child {
    border-bottom: none;
  }
</style>
