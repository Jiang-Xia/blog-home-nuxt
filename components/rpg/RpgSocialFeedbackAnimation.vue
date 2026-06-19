<script setup lang="ts">
/**
   * 收到社交互动 / 打赏时的全屏弹框特效
   * 由 useRpgRealtimeHandlers 在 socialReceived、tipReceived 事件触发
   */
import type { RpgSocialFeedbackData } from '~~/types/rpg';

const props = defineProps<{
  visible: boolean;
  data: RpgSocialFeedbackData | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const handleClose = () => {
  emit('close');
};

const badgeText = computed(() => {
  switch (props.data?.kind) {
    case 'cheer':
      return '收到加油';
    case 'egg':
      return '收到鸡蛋';
    case 'flower':
      return '收到鲜花';
    case 'tip':
      return '收到打赏';
    default:
      return '收到互动';
  }
});

const icon = computed(() => {
  switch (props.data?.kind) {
    case 'cheer':
      return '💪';
    case 'egg':
      return '🥚';
    case 'flower':
      return '🌸';
    case 'tip':
      return '💎';
    default:
      return '✨';
  }
});

const titleText = computed(() => {
  if (!props.data) return '';
  const from = props.data.fromNickname || '冒险者';
  switch (props.data.kind) {
    case 'cheer':
      return `${from} 给你加油了！`;
    case 'egg':
      return `${from} 向你扔了鸡蛋！`;
    case 'flower':
      return `${from} 向你送了鲜花！`;
    case 'tip':
      return `${from} 打赏了你！`;
    default:
      return `${from} 与你互动`;
  }
});

const detailText = computed(() => {
  if (!props.data) return '';
  switch (props.data.kind) {
    case 'cheer':
      return props.data.hpDelta ? `HP +${Math.abs(props.data.hpDelta)}` : '';
    case 'egg':
      return props.data.hpDelta ? `HP ${props.data.hpDelta}` : '';
    case 'flower':
      return props.data.reputationDelta ? `声望 +${props.data.reputationDelta}` : '';
    case 'tip':
      return [
        props.data.amount ? `+${props.data.amount} 钻石` : '',
        props.data.articleTitle ? `《${props.data.articleTitle}》` : '',
      ]
        .filter(Boolean)
        .join(' · ');
    default:
      return '';
  }
});

const themeClass = computed(() => {
  switch (props.data?.kind) {
    case 'cheer':
      return 'theme-cheer';
    case 'egg':
      return 'theme-egg';
    case 'flower':
      return 'theme-flower';
    case 'tip':
      return 'theme-tip';
    default:
      return 'theme-cheer';
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="social-feedback">
      <div v-if="visible && data" class="social-feedback-overlay" @click="handleClose">
        <div class="social-feedback-modal" :class="themeClass" @click.stop>
          <div class="feedback-icon">
            {{ icon }}
          </div>
          <div class="feedback-badge">
            {{ badgeText }}
          </div>
          <div class="feedback-title">
            {{ titleText }}
          </div>
          <div v-if="detailText" class="feedback-detail">
            {{ detailText }}
          </div>
          <button class="close-btn" @click="handleClose">
            知道了
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .social-feedback-overlay {
    position: fixed;
    inset: 0;
    background: var(--rpg-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10080;
  }

  .social-feedback-modal {
    border-radius: 20px;
    padding: 32px 40px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    min-width: 280px;
    max-width: 380px;
  }

  .theme-cheer {
    background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 50%, #3b82f6 100%);
  }

  .theme-egg {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%);
  }

  .theme-flower {
    background: linear-gradient(135deg, #fce7f3 0%, #f9a8d4 50%, #ec4899 100%);
  }

  .theme-tip {
    background: linear-gradient(135deg, #ede9fe 0%, #c4b5fd 50%, #8b5cf6 100%);
  }

  .feedback-icon {
    font-size: 48px;
    margin-bottom: 8px;
    animation: bounce 0.8s ease infinite;
  }

  .feedback-badge {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    opacity: 0.85;
    margin-bottom: 10px;
  }

  .feedback-title {
    font-size: 20px;
    font-weight: 800;
    line-height: 1.35;
    margin-bottom: 8px;
  }

  .feedback-detail {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 20px;
    opacity: 0.9;
  }

  .close-btn {
    padding: 10px 28px;
    border: none;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.72);
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .close-btn:hover {
    opacity: 0.88;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-6px) scale(1.08);
    }
  }

  .social-feedback-enter-active,
  .social-feedback-leave-active {
    transition: opacity 0.25s ease;
  }

  .social-feedback-enter-from,
  .social-feedback-leave-to {
    opacity: 0;
  }
</style>
