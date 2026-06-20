<script setup lang="ts">
/**
   * 成就达成弹窗
   */
const props = defineProps<{
  visible: boolean;
  name: string;
  expReward?: number;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { playSfx } = useRpgAudio();

/** 成就弹窗展示时播放庆祝音 */
watch(
  () => props.visible,
  (v) => {
    if (v) void playSfx('achievement');
  },
);

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="achievement">
      <div v-if="visible" class="achievement-overlay" @click="handleClose">
        <div class="achievement-modal" @click.stop>
          <div class="achievement-icon">
            🏆
          </div>
          <div class="achievement-badge">
            成就达成
          </div>
          <div class="achievement-name">
            {{ name }}
          </div>
          <div v-if="expReward" class="achievement-reward">
            +{{ expReward }} EXP
          </div>
          <button class="close-btn" @click="handleClose">
            太棒了！
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .achievement-overlay {
    position: fixed;
    inset: 0;
    background: var(--rpg-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10080;
  }

  .achievement-modal {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 45%, #fbbf24 100%);
    border-radius: 20px;
    padding: 32px 40px 28px;
    text-align: center;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.35),
      0 0 48px rgba(251, 191, 36, 0.35);
    min-width: 280px;
    max-width: 380px;
    animation: modalGlow 2.4s ease-in-out infinite;
  }

  .achievement-icon {
    font-size: 52px;
    line-height: 1;
    margin-bottom: 8px;
    animation: iconBounce 0.9s ease infinite;
    filter: drop-shadow(0 4px 8px rgba(146, 64, 14, 0.25));
  }

  .achievement-badge {
    font-size: 14px;
    font-weight: 800;
    color: #92400e;
    margin-bottom: 12px;
    letter-spacing: 0.12em;
    animation: badgePulse 1.1s ease infinite;
  }

  .achievement-name {
    font-size: 22px;
    font-weight: 800;
    color: #78350f;
    margin-bottom: 10px;
    line-height: 1.35;
    animation: gentleFloat 2.6s ease-in-out infinite;
  }

  .achievement-reward {
    font-size: 17px;
    font-weight: 800;
    color: #b45309;
    margin-bottom: 22px;
    animation: rewardPulse 1.6s ease-in-out infinite;
  }

  .close-btn {
    padding: 10px 28px;
    border: none;
    border-radius: 999px;
    background: #78350f;
    color: #fef3c7;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition:
      opacity 0.2s,
      transform 0.2s;
  }

  .close-btn:hover {
    opacity: 0.92;
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

  @keyframes iconBounce {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-8px) scale(1.1);
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

  @keyframes rewardPulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.06);
      opacity: 0.92;
    }
  }

  @keyframes modalGlow {
    0%,
    100% {
      box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.35),
        0 0 32px rgba(251, 191, 36, 0.28);
    }
    50% {
      box-shadow:
        0 24px 64px rgba(0, 0, 0, 0.38),
        0 0 56px rgba(251, 191, 36, 0.45);
    }
  }

  .achievement-enter-active {
    animation: fadeIn 0.32s ease;
  }

  .achievement-leave-active {
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
