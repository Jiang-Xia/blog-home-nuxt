<script setup lang="ts">
/**
   * 活动开始顶部横幅（activityUpdate WS，type === 'start'）
   * 自顶部滑入，自动消失；音效 activityStart
   */
import type { RpgActivityUpdatePayload } from '~~/composables/use-realtime-socket';

const props = defineProps<{
  visible: boolean;
  data: RpgActivityUpdatePayload | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { playSfx } = useRpgAudio();

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

const activities = computed(() => props.data?.activities ?? []);

const headline = computed(() => {
  const names = activities.value.map(a => a.name).join('、');
  return names || '新活动';
});

const subtitle = computed(() => {
  const first = activities.value[0];
  if (!first) return '';
  const parts: string[] = [];
  if (first.description) parts.push(first.description);
  if (first.expBuffRate && first.expBuffRate > 0) {
    parts.push(`EXP +${Math.round(first.expBuffRate * 100)}%`);
  }
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
    if (!v || !props.data?.activities.length) return;
    void playSfx('activityStart');
    dismissTimer = setTimeout(dismiss, 4800);
  },
);

onUnmounted(clearDismissTimer);
</script>

<template>
  <Teleport to="body">
    <Transition name="activity-banner">
      <div
        v-if="visible && data?.activities.length"
        class="activity-start-banner rpg-notify-panel rpg-notify-panel--info"
        role="status"
        @click="dismiss"
      >
        <span class="banner-icon">🎪</span>
        <div class="banner-body">
          <p class="rpg-notify-panel__kicker">
            活动开始
          </p>
          <p class="rpg-notify-panel__title">
            {{ headline }}
          </p>
          <p v-if="subtitle" class="rpg-notify-panel__sub">
            {{ subtitle }}
          </p>
        </div>
        <button
          type="button"
          class="rpg-notify-panel__close"
          aria-label="关闭"
          @click.stop="dismiss"
        >
          ✕
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .activity-start-banner {
    position: fixed;
    top: 4.5rem;
    left: 50%;
    z-index: 10070;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    width: min(28rem, calc(100% - 1.5rem));
    padding: 12px 14px;
    border-radius: 16px;
    cursor: pointer;
    transform: translateX(-50%);
  }

  .banner-icon {
    font-size: 28px;
    line-height: 1;
    flex-shrink: 0;
    animation: bannerPulse 1.2s ease infinite;
  }

  .banner-body {
    min-width: 0;
    flex: 1;
  }

  @keyframes bannerPulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .activity-banner-enter-active,
  .activity-banner-leave-active {
    transition: all 0.38s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .activity-banner-enter-from,
  .activity-banner-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-24px);
  }
</style>
