<script setup lang="ts">
/**
   * 移动端文章目录抽屉（< lg 显示）
   * 复用 Catalogue 组件，点击目录项后自动关闭 drawer
   */
import type { PropType } from 'vue';
import type { tocInter } from '@/utils';

defineProps({
  topics: {
    type: Array as PropType<tocInter[]>,
    default: () => [],
  },
});

const open = ref(false);

const closeDrawer = () => {
  open.value = false;
};

const onTopicClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.topic-item')) {
    closeDrawer();
  }
};
</script>

<template>
  <div v-if="topics.length" class="article-toc-drawer lg:hidden">
    <button
      type="button"
      class="toc-drawer__fab btn btn-sm cyber-btn-secondary shadow-lg"
      aria-label="打开文章目录"
      @click="open = true"
    >
      目录
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        class="toc-drawer__backdrop fixed inset-0 z-[10030] bg-black/40 backdrop-blur-[1px]"
        aria-hidden="true"
        @click="closeDrawer"
      />
      <div
        v-if="open"
        class="toc-drawer__panel fixed inset-x-0 bottom-0 z-[10031] max-h-[70vh] rounded-t-2xl border border-tech bg-[var(--tech-dropdown-bg)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="文章目录"
      >
        <div class="flex items-center justify-between border-b border-tech px-4 py-3">
          <span class="text-sm font-semibold text-tech">目录</span>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-circle"
            aria-label="关闭目录"
            @click="closeDrawer"
          >
            ✕
          </button>
        </div>
        <div
          class="overflow-y-auto px-2 py-2"
          style="max-height: calc(70vh - 3rem)"
          @click="onTopicClick"
        >
          <Catalogue :topics="topics" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="less">
  .article-toc-drawer {
    .toc-drawer__fab {
      position: fixed;
      left: 1rem;
      right: auto;
      bottom: max(5.5rem, calc(env(safe-area-inset-bottom, 0px) + 4.5rem));
      z-index: 39;
    }
  }
</style>
