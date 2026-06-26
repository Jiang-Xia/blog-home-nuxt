<script setup lang="ts">
/**
   * 成就达成弹窗：弹框配色统一；仅图标方块底色随稀有度
   */
import { resolveRarityDisplayColor } from '~~/utils/rpg-rarity';

const props = defineProps<{
  visible: boolean;
  name: string;
  expReward?: number;
  rarityColor?: string;
  rarityLabel?: string;
  rarityIcon?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { playSfx } = useRpgAudio();

const iconStyle = computed(() => ({
  background: resolveRarityDisplayColor({
    rarityColor: props.rarityColor,
    rarityLabel: props.rarityLabel,
  }),
}));

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
          <div class="achievement-icon rpg-loot-icon rpg-loot-icon--tinted" :style="iconStyle">
            {{ rarityIcon || '🏆' }}
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
    border-radius: 20px;
    padding: 32px 40px 28px;
    text-align: center;
    min-width: 280px;
    max-width: 380px;
    background: var(--rpg-amber-bg-gradient);
    border: 1px solid var(--rpg-amber-border);
    box-shadow:
      0 20px 60px rgb(15 23 42 / 0.28),
      0 0 40px rgb(245 158 11 / 0.18);
    animation: modalGlow 2.4s ease-in-out infinite;
  }

  .achievement-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 12px;
    font-size: 28px;
    border-radius: 14px;
    animation: iconBounce 0.9s ease infinite;
  }

  .achievement-badge {
    font-size: 14px;
    font-weight: 800;
    color: var(--rpg-amber-text-soft);
    margin-bottom: 12px;
    letter-spacing: 0.12em;
    animation: badgePulse 1.1s ease infinite;
  }

  .achievement-name {
    font-size: 22px;
    font-weight: 800;
    color: var(--rpg-amber-text);
    margin-bottom: 10px;
    line-height: 1.35;
    animation: gentleFloat 2.6s ease-in-out infinite;
  }

  .achievement-reward {
    font-size: 17px;
    font-weight: 800;
    color: var(--rpg-amber-dark);
    margin-bottom: 22px;
    animation: rewardPulse 1.6s ease-in-out infinite;
  }

  .close-btn {
    padding: 10px 28px;
    border: none;
    border-radius: 999px;
    background: var(--rpg-level-badge-gradient);
    color: #fffbeb;
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
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.04);
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
