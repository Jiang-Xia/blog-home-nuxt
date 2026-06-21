<script setup lang="ts">
/**
   * 文章升级轻量徽章（articleLevelUp WS）
   * 顶部浮层，非全屏；音效 articleLevelUp
   */
import type { RpgArticleLevelUpPayload } from '~~/composables/use-realtime-socket';

const props = defineProps<{
  visible: boolean;
  data: RpgArticleLevelUpPayload | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { playSfx } = useRpgAudio();

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

const titleText = computed(() => props.data?.articleTitle || '文章');

const levelText = computed(() => {
  if (!props.data) return '';
  return `Lv${props.data.oldLevel} → Lv${props.data.newLevel}`;
});

const clearDismissTimer = () => {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
};

const dismiss = () => {
  clearDismissTimer();
  emit('close');
};

watch(
  () => props.visible,
  (v) => {
    clearDismissTimer();
    if (!v || !props.data) return;
    void playSfx('articleLevelUp');
    dismissTimer = setTimeout(dismiss, 3600);
  },
);

onUnmounted(clearDismissTimer);
</script>

<template>
  <Teleport to="body">
    <Transition name="article-level-badge">
      <div
        v-if="visible && data"
        class="article-level-badge rpg-notify-panel rpg-notify-panel--info"
        role="status"
        @click="dismiss"
      >
        <span class="badge-icon">📈</span>
        <div class="badge-body">
          <p class="rpg-notify-panel__kicker">
            文章升级
          </p>
          <p class="rpg-notify-panel__title rpg-notify-panel__title--clip">
            {{ titleText }}
          </p>
          <p class="rpg-notify-panel__sub badge-level">
            {{ levelText }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .article-level-badge {
    position: fixed;
    top: 5rem;
    right: 1rem;
    z-index: 10070;
    display: flex;
    align-items: center;
    gap: 12px;
    width: min(20rem, calc(100% - 1.5rem));
    padding: 12px 14px;
    border-radius: 16px;
    cursor: pointer;
  }

  .badge-icon {
    font-size: 28px;
    line-height: 1;
    animation: iconRise 0.7s ease infinite alternate;
  }

  .badge-body {
    min-width: 0;
    flex: 1;
  }

  .badge-level {
    font-weight: 700;
    font-size: 13px;
  }

  @keyframes iconRise {
    from {
      transform: translateY(2px);
    }
    to {
      transform: translateY(-4px);
    }
  }

  .article-level-badge-enter-active,
  .article-level-badge-leave-active {
    transition: all 0.35s ease;
  }

  .article-level-badge-enter-from,
  .article-level-badge-leave-to {
    opacity: 0;
    transform: translateX(16px);
  }
</style>
