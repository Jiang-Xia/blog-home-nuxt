<script setup lang="ts">
/**
   * 任务奖励领取全屏庆祝（questReward WS）
   * 宝箱开启 + 奖励展示；音效 questReward 在弹窗打开时播放
   */
import type { RpgQuestRewardPayload } from '~~/composables/use-realtime-socket';

const props = defineProps<{
  visible: boolean;
  data: RpgQuestRewardPayload | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { playSfx } = useRpgAudio();

type RewardPhase = 'opening' | 'revealed';

const phase = ref<RewardPhase>('opening');
let revealTimer: ReturnType<typeof setTimeout> | null = null;

const questLabel = computed(() => props.data?.questName || '任务');

const clearRevealTimer = () => {
  if (revealTimer) {
    clearTimeout(revealTimer);
    revealTimer = null;
  }
};

/** 弹窗打开：宝箱动画 → 揭晓奖励 + 播音 */
watch(
  () => props.visible,
  (v) => {
    clearRevealTimer();
    phase.value = 'opening';
    if (!v || !props.data) return;
    revealTimer = setTimeout(() => {
      phase.value = 'revealed';
      void playSfx('questReward');
    }, 750);
  },
);

onUnmounted(clearRevealTimer);

const handleClose = () => {
  if (phase.value === 'opening') return;
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="quest-reward">
      <div
        v-if="visible && data"
        class="quest-reward-overlay"
        :class="{ 'can-close': phase === 'revealed' }"
        @click="handleClose"
      >
        <RpgLotteryConfetti :active="phase === 'revealed'" rarity="rare" density="medium" />

        <div class="reward-panel" @click.stop>
          <!-- 宝箱开启 -->
          <div v-if="phase === 'opening'" class="chest-stage">
            <div class="chest-wrap">
              <span class="chest-glow" aria-hidden="true" />
              <span class="chest-lid" aria-hidden="true">🎁</span>
              <span class="chest-base" aria-hidden="true">📦</span>
            </div>
            <p class="chest-tip">
              开启奖励中…
            </p>
          </div>

          <!-- 奖励揭晓 -->
          <div v-else class="reveal-stage">
            <div class="reward-badge">
              奖励已发放
            </div>
            <div class="reward-icon">
              ✨
            </div>
            <div class="quest-name">
              {{ questLabel }}
            </div>
            <div v-if="data.expReward" class="exp-reward">
              +{{ data.expReward }} EXP
            </div>
            <button type="button" class="close-btn" @click="handleClose">
              收下奖励
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .quest-reward-overlay {
    position: fixed;
    inset: 0;
    z-index: 10080;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--rpg-overlay, rgb(0 0 0 / 0.72));
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    overflow: hidden;
  }

  .quest-reward-overlay.can-close {
    cursor: pointer;
  }

  .reward-panel {
    position: relative;
    z-index: 3;
    text-align: center;
    min-width: 280px;
    max-width: 380px;
    padding: 0 1rem;
  }

  /* --- 宝箱阶段 --- */
  .chest-wrap {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: 100px;
    height: 96px;
  }

  .chest-glow {
    position: absolute;
    inset: -16px;
    border-radius: 50%;
    background: radial-gradient(circle, rgb(251 191 36 / 0.4) 0%, transparent 70%);
    animation: glowPulse 0.9s ease-in-out infinite;
  }

  .chest-lid {
    position: relative;
    z-index: 2;
    font-size: 48px;
    line-height: 1;
    animation: lidPop 0.75s ease-in-out forwards;
    filter: drop-shadow(0 4px 8px rgb(0 0 0 / 0.25));
  }

  .chest-base {
    font-size: 36px;
    line-height: 1;
    margin-top: -8px;
    opacity: 0.85;
  }

  .chest-tip {
    margin-top: 20px;
    font-size: 14px;
    font-weight: 600;
    color: rgb(253 230 138 / 0.9);
    letter-spacing: 0.08em;
  }

  /* --- 揭晓阶段 --- */
  .reveal-stage {
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 45%, #fed7aa 100%);
    border-radius: 20px;
    padding: 28px 32px 24px;
    box-shadow:
      0 20px 60px rgb(0 0 0 / 0.35),
      0 0 40px rgb(251 191 36 / 0.3);
    animation: revealPop 0.42s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .reward-badge {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #c2410c;
    margin-bottom: 10px;
  }

  .reward-icon {
    font-size: 48px;
    line-height: 1;
    margin-bottom: 8px;
    animation: sparkleBounce 0.9s ease infinite;
  }

  .quest-name {
    font-size: 20px;
    font-weight: 800;
    color: #9a3412;
    margin-bottom: 10px;
    line-height: 1.35;
  }

  .exp-reward {
    font-size: 18px;
    font-weight: 800;
    color: #b45309;
    margin-bottom: 20px;
    animation: expPulse 1.4s ease-in-out infinite;
  }

  .close-btn {
    padding: 10px 28px;
    border: none;
    border-radius: 999px;
    background: #9a3412;
    color: #fff7ed;
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

  @keyframes glowPulse {
    0%,
    100% {
      opacity: 0.55;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  @keyframes lidPop {
    0% {
      transform: translateY(0) rotate(0deg) scale(1);
    }
    40% {
      transform: translateY(-6px) rotate(-8deg) scale(1.05);
    }
    70% {
      transform: translateY(-18px) rotate(-14deg) scale(1.08);
    }
    100% {
      transform: translateY(-22px) rotate(-16deg) scale(1.1);
      opacity: 0.3;
    }
  }

  @keyframes revealPop {
    from {
      opacity: 0;
      transform: scale(0.78);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes sparkleBounce {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-6px) scale(1.08);
    }
  }

  @keyframes expPulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.92;
    }
  }

  .quest-reward-enter-active {
    animation: overlayIn 0.28s ease;
  }

  .quest-reward-leave-active {
    animation: overlayIn 0.2s ease reverse;
  }

  @keyframes overlayIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
