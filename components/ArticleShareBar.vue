<script setup lang="ts">
/**
   * 详情页分享条：复制链接 / Web Share API
   */
import { messageSuccess } from '@/utils/toast';

const props = defineProps<{
  articleId?: string | number;
  title?: string;
}>();

const shareUrl = computed(() => {
  if (!import.meta.client || !props.articleId) return '';
  return `${window.location.origin}/detail/${props.articleId}`;
});

const copyLink = async () => {
  if (!shareUrl.value) return;
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    messageSuccess('链接已复制');
  }
  catch {
    messageSuccess(shareUrl.value);
  }
};

const shareNative = async () => {
  if (!shareUrl.value) return;
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.title || '文章分享',
        url: shareUrl.value,
      });
      return;
    }
    catch {
      // user cancelled
    }
  }
  await copyLink();
};
</script>

<template>
  <div v-if="articleId" class="article-share-bar mt-4 flex flex-wrap items-center gap-2">
    <span class="text-xs text-tech-muted">分享</span>
    <button type="button" class="btn btn-xs cyber-btn-secondary" @click="copyLink">
      复制链接
    </button>
    <button type="button" class="btn btn-xs cyber-btn-secondary" @click="shareNative">
      分享
    </button>
  </div>
</template>
