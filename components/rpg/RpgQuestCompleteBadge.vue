<script setup lang="ts">
/**
   * 任务完成轻量徽章（questComplete WS）
   * 非全屏：底部浮层，自动消失；音效 questComplete
   */
import type { RpgQuestCompletePayload } from '~~/composables/use-realtime-socket';

const props = defineProps<{
  visible: boolean;
  data: RpgQuestCompletePayload | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { playSfx } = useRpgAudio();

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

const questLabel = computed(() => props.data?.questName || '任务');

const rewardHint = computed(() => {
  const parts: string[] = [];
  if (props.data?.expReward) parts.push(`+${props.data.expReward} EXP`);
  if (props.data?.hpReward) parts.push(`+${props.data.hpReward} HP`);
  return parts.join(' · ');
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
    void playSfx('questComplete');
    dismissTimer = setTimeout(dismiss, 3600);
  },
);

onUnmounted(clearDismissTimer);
</script>

<template>
  <Teleport to="body">
    <Transition name="quest-badge">
      <div
        v-if="visible && data"
        class="quest-complete-badge rpg-notify-panel rpg-notify-panel--success"
        role="status"
        @click="dismiss"
      >
        <span class="badge-icon">🎯</span>
        <div class="badge-body">
          <p class="rpg-notify-panel__kicker">
            任务已完成
          </p>
          <p class="rpg-notify-panel__title rpg-notify-panel__title--clip">
            {{ questLabel }}
          </p>
          <p v-if="rewardHint" class="rpg-notify-panel__sub">
            待领取 {{ rewardHint }}
          </p>
          <p v-else class="rpg-notify-panel__sub">
            去冒险页领取奖励吧
          </p>
        </div>
        <span class="rpg-notify-panel__chevron" aria-hidden="true">→</span>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .quest-complete-badge {
    position: fixed;
    bottom: 6.5rem;
    left: 50%;
    z-index: 10070;
    display: flex;
    align-items: center;
    gap: 12px;
    width: min(22rem, calc(100% - 1.5rem));
    padding: 12px 14px;
    border-radius: 16px;
    cursor: pointer;
    transform: translateX(-50%);
  }

  .badge-icon {
    font-size: 28px;
    line-height: 1;
    animation: iconPop 0.6s ease infinite alternate;
  }

  .badge-body {
    min-width: 0;
    flex: 1;
  }

  @keyframes iconPop {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.12);
    }
  }

  .quest-badge-enter-active,
  .quest-badge-leave-active {
    transition: all 0.35s ease;
  }

  .quest-badge-enter-from,
  .quest-badge-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
</style>
