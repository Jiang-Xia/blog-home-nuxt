<script setup lang="ts">
import { useScroll } from '@vueuse/core';
import { toggleCollect, checkCollected } from '@/api/article';
import { updateLikesHandle, xBLogStore } from '@/utils/common';
import { messageError, messageSuccess } from '@/utils/toast';
import { useRpg } from '~~/composables/use-rpg';

const { fetchQuests } = useRpg();

const props = defineProps<{
  articleId: string | number;
  authorUid: number;
  article: Record<string, any>;
}>();

const emit = defineEmits<{ tipped: [] }>();

const userInfo = useUserInfo();
const collected = ref(false);
const collectLoading = ref(false);
const showTipModal = ref(false);
const isLiked = ref(false);
const fabOpen = ref(false);

const { y: scrollY } = useScroll(window);
const showBackTop = computed(() => {
  if (!import.meta.client) return false;
  return scrollY.value > document.documentElement.clientHeight - 400;
});

const goTop = () => {
  window.scroll({ top: 0, left: 0, behavior: 'smooth' });
  fabOpen.value = false;
};

const ensureLogin = async () => {
  if (!userInfo.value?.uid) {
    messageError('请先登录');
    await navigateTo('/login');
    return false;
  }
  return true;
};

const syncLikeState = () => {
  isLiked.value = xBLogStore.value.likes.includes(props.articleId as never);
};

const handleLike = async () => {
  if (!(await ensureLogin())) return;
  await updateLikesHandle({ ...props.article, id: props.article.id ?? props.articleId });
  syncLikeState();
  await fetchQuests();
};

const handleCollect = async () => {
  if (!(await ensureLogin())) return;
  if (collectLoading.value) return;
  collectLoading.value = true;
  try {
    const res = await toggleCollect(props.articleId);
    collected.value = !!res?.collected;
    messageSuccess(collected.value ? '收藏成功' : '已取消收藏');
    if (collected.value) await fetchQuests();
  }
  catch (e: any) {
    messageError(e?.message || '收藏操作失败');
  }
  finally {
    collectLoading.value = false;
  }
};

const openTipModal = async () => {
  if (!(await ensureLogin())) return;
  showTipModal.value = true;
};

const onTipped = () => {
  showTipModal.value = false;
  emit('tipped');
};

const loadCollectState = async () => {
  if (!userInfo.value?.uid) return;
  try {
    const res = await checkCollected(props.articleId);
    collected.value = !!res?.collected;
  }
  catch {
    /* ignore */
  }
};

onMounted(() => {
  syncLikeState();
  loadCollectState();
});

watch(
  () => userInfo.value?.uid,
  () => {
    syncLikeState();
    loadCollectState();
  },
);
</script>

<template>
  <div class="article-rpg-fab-wrap">
    <div class="rpg-fab-cluster">
      <div
        v-if="!fabOpen"
        class="rpg-fab-hint pointer-events-none hidden whitespace-nowrap rounded-lg border border-[var(--rpg-amber-border)] bg-[var(--rpg-surface)] px-2.5 py-1 text-xs font-medium text-[var(--rpg-amber-text)] shadow-md sm:block"
      >
        互动赚经验 ↑
      </div>
      <div class="fab fab-flower article-rpg-fab" :class="{ 'fab-open': fabOpen }">
        <div
          tabindex="0"
          role="button"
          class="btn btn-circle btn-primary rpg-fab-bounce text-xl shadow-lg ring-2 ring-[var(--rpg-amber-border)]"
          @click="fabOpen = true"
        >
          ⚔️
        </div>
        <div class="fab-close" @click="fabOpen = false">
          <span class="btn btn-circle btn-primary text-xl shadow-lg">⚔️</span>
        </div>
        <div class="tooltip tooltip-left" :data-tip="isLiked ? '取消点赞' : '点赞'">
          <button
            class="btn btn-circle shadow-md"
            :class="isLiked ? 'btn-error' : 'btn-ghost bg-base-100'"
            @click="handleLike"
          >
            <xia-icon :icon="isLiked ? 'blog-like-solid' : 'blog-like'" class="size-5" />
          </button>
        </div>
        <div class="tooltip tooltip-left" :data-tip="collected ? '取消收藏' : '收藏'">
          <button
            class="btn btn-circle shadow-md"
            :class="collected ? 'btn-warning' : 'btn-ghost bg-base-100'"
            :disabled="collectLoading"
            @click="handleCollect"
          >
            {{ collected ? '🔖' : '📑' }}
          </button>
        </div>
        <div class="tooltip tooltip-left" data-tip="打赏作者">
          <button class="btn btn-circle btn-accent shadow-md" @click="openTipModal">
            💎
          </button>
        </div>
        <div v-if="showBackTop" class="tooltip tooltip-left" data-tip="返回顶部">
          <button class="btn btn-circle btn-neutral shadow-md" @click="goTop">
            <xia-icon icon="blog-rocket4" width="22px" height="22px" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <dialog class="modal rpg-theme" :class="{ 'modal-open': showTipModal }">
    <div class="modal-box max-w-sm">
      <h3 class="font-bold text-lg mb-2">
        💎 打赏作者
      </h3>
      <RpgArticleTipPanel
        :article-id="Number(articleId)"
        :author-uid="authorUid"
        @tipped="onTipped"
      />
      <div class="modal-action">
        <button class="btn btn-sm" @click="showTipModal = false">
          关闭
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="showTipModal = false">
      <button>close</button>
    </form>
  </dialog>
</template>

<style scoped>
  .article-rpg-fab-wrap {
    position: fixed;
    bottom: 6rem;
    right: 2.25rem;
    z-index: 40;
  }

  .rpg-fab-cluster {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.375rem;
  }

  .article-rpg-fab-wrap :deep(.article-rpg-fab) {
    position: relative !important;
    inset: auto !important;
    bottom: auto !important;
    right: auto !important;
  }

  .fab.fab-open > [tabindex]:first-child {
    pointer-events: none;
    opacity: 0;
    rotate: 90deg;
  }

  .fab.fab-open > :nth-child(n + 2) {
    visibility: visible;
    scale: 1;
    opacity: 1;
  }
</style>
