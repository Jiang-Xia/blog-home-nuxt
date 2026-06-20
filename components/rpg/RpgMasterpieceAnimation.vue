<script setup lang="ts">
/**
   * 神作晋升动画
   */
import type { RpgMasterpiecePayload } from '~~/composables/use-realtime-socket';

const props = defineProps<{
  visible: boolean;
  data: RpgMasterpiecePayload | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { playSfx } = useRpgAudio();

/** 神作弹窗展示时播放庆祝音 */
watch(
  () => props.visible,
  (v) => {
    if (v && props.data) void playSfx('masterpiece');
  },
);

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="masterpiece">
      <div v-if="visible && data" class="masterpiece-overlay" @click="handleClose">
        <div class="masterpiece-modal" @click.stop>
          <div class="masterpiece-icon">
            ✨
          </div>
          <div class="masterpiece-badge">
            神作诞生
          </div>
          <div class="masterpiece-title">
            {{ data.articleTitle }}
          </div>
          <p class="masterpiece-desc">
            你的文章已晋升神作，继续创作吧！
          </p>
          <button class="close-btn" @click="handleClose">
            太棒了！
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .masterpiece-overlay {
    position: fixed;
    inset: 0;
    background: var(--rpg-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10080;
  }

  .masterpiece-modal {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%);
    border-radius: 20px;
    padding: 28px 48px 32px;
    text-align: center;
    box-shadow:
      0 20px 60px rgba(245, 158, 11, 0.4),
      0 0 44px rgba(251, 191, 36, 0.32);
    min-width: 300px;
    max-width: 420px;
    animation: modalGlow 2.2s ease-in-out infinite;
  }

  .masterpiece-icon {
    font-size: 50px;
    line-height: 1;
    margin-bottom: 6px;
    animation: sparkleSpin 2.4s ease-in-out infinite;
    filter: drop-shadow(0 4px 12px rgba(146, 64, 14, 0.3));
  }

  .masterpiece-badge {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 3px;
    color: #92400e;
    margin-bottom: 14px;
    animation: badgePulse 1.15s ease infinite;
  }

  .masterpiece-title {
    font-size: 20px;
    font-weight: 700;
    color: #78350f;
    margin-bottom: 12px;
    line-height: 1.4;
    animation: gentleFloat 2.5s ease-in-out infinite;
  }

  .masterpiece-desc {
    font-size: 14px;
    color: #92400e;
    margin-bottom: 24px;
    animation: descPulse 2.8s ease-in-out infinite;
  }

  .close-btn {
    padding: 8px 32px;
    border-radius: 8px;
    background: #92400e;
    color: white;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition:
      background 0.2s,
      transform 0.2s;
  }

  .close-btn:hover {
    background: #78350f;
    transform: scale(1.03);
  }

  @keyframes badgePulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.08);
    }
  }

  @keyframes sparkleSpin {
    0%,
    100% {
      transform: translateY(0) scale(1) rotate(0deg);
    }
    25% {
      transform: translateY(-6px) scale(1.1) rotate(-8deg);
    }
    75% {
      transform: translateY(-6px) scale(1.1) rotate(8deg);
    }
  }

  @keyframes gentleFloat {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  @keyframes descPulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.78;
    }
  }

  @keyframes modalGlow {
    0%,
    100% {
      box-shadow:
        0 20px 60px rgba(245, 158, 11, 0.38),
        0 0 36px rgba(251, 191, 36, 0.28);
    }
    50% {
      box-shadow:
        0 26px 68px rgba(245, 158, 11, 0.48),
        0 0 58px rgba(251, 191, 36, 0.45);
    }
  }

  .masterpiece-enter-active {
    animation: fadeIn 0.32s ease;
  }

  .masterpiece-leave-active {
    animation: fadeIn 0.22s ease reverse;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.78);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
