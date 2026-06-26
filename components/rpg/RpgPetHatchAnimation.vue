<script setup lang="ts">
/**
   * 宠物孵化全屏动画（petHatched WS）
   * 蛋裂开 → 宠物展示；揭晓区 flex 居中，宠物图标外包 pet-icon-wrap
   */
import type { RpgPetHatchedPayload } from '~~/composables/use-realtime-socket';
import { rarityLabelToTier } from '~~/utils/rpg-rarity';

const props = defineProps<{
  visible: boolean;
  data: RpgPetHatchedPayload | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { playSfx } = useRpgAudio();

type HatchPhase = 'egg' | 'reveal';

const phase = ref<HatchPhase>('egg');
let hatchTimer: ReturnType<typeof setTimeout> | null = null;

const tier = computed(() => rarityLabelToTier(props.data?.rarityLabel));

const clearHatchTimer = () => {
  if (hatchTimer) {
    clearTimeout(hatchTimer);
    hatchTimer = null;
  }
};

/** 弹窗打开：先播蛋动画，再揭晓宠物 + petHatch 音 */
watch(
  () => props.visible,
  (v) => {
    clearHatchTimer();
    phase.value = 'egg';
    if (!v || !props.data) return;
    hatchTimer = setTimeout(() => {
      phase.value = 'reveal';
      void playSfx('petHatch');
    }, 1100);
  },
);

onUnmounted(clearHatchTimer);

const handleClose = () => {
  if (phase.value === 'egg') return;
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="pet-hatch">
      <div
        v-if="visible && data"
        class="pet-hatch-overlay"
        :class="{ 'can-close': phase === 'reveal' }"
        @click="handleClose"
      >
        <RpgLotteryConfetti :active="phase === 'reveal'" :rarity="tier" density="medium" />

        <div class="hatch-panel" @click.stop>
          <!-- 蛋阶段 -->
          <div v-if="phase === 'egg'" class="egg-stage">
            <div class="egg-wrap">
              <span class="egg-glow" aria-hidden="true" />
              <span class="egg-emoji">🥚</span>
              <span class="crack crack-1" aria-hidden="true" />
              <span class="crack crack-2" aria-hidden="true" />
            </div>
            <p class="egg-tip">
              孵化中…
            </p>
          </div>

          <!-- 揭晓阶段 -->
          <div v-else class="reveal-stage">
            <div class="hatch-badge">
              孵化成功
            </div>
            <div class="pet-icon-wrap">
              <RpgItemIcon
                class="pet-icon"
                :icon="data.petCode"
                :rarity-color="data.rarityColor"
                size="lg"
              />
            </div>
            <RpgRarityBadge
              class="pet-rarity"
              :rarity="tier"
              :rarity-label="data.rarityLabel"
              :rarity-color="data.rarityColor"
            />
            <div class="pet-name">
              {{ data.name }}
            </div>
            <button type="button" class="close-btn" @click="handleClose">
              太棒了！
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .pet-hatch-overlay {
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

  .pet-hatch-overlay.can-close {
    cursor: pointer;
  }

  .hatch-panel {
    position: relative;
    z-index: 3;
    text-align: center;
    min-width: 280px;
    max-width: 360px;
    padding: 0 1rem;
  }

  /* --- 蛋阶段 --- */
  .egg-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 120px;
    animation: eggShake 0.55s ease-in-out infinite;
  }

  .egg-glow {
    position: absolute;
    inset: -12px;
    border-radius: 50%;
    background: radial-gradient(circle, rgb(251 191 36 / 0.35) 0%, transparent 70%);
    animation: glowPulse 1.1s ease-in-out infinite;
  }

  .egg-emoji {
    font-size: 72px;
    line-height: 1;
    filter: drop-shadow(0 6px 12px rgb(0 0 0 / 0.25));
  }

  .crack {
    position: absolute;
    width: 2px;
    height: 28px;
    background: #fef3c7;
    border-radius: 1px;
    opacity: 0;
    animation: crackShow 1.1s ease forwards;
  }

  .crack-1 {
    top: 38%;
    left: 46%;
    transform: rotate(-28deg);
    animation-delay: 0.35s;
  }

  .crack-2 {
    top: 42%;
    left: 52%;
    transform: rotate(22deg);
    animation-delay: 0.65s;
  }

  .egg-tip {
    margin-top: 20px;
    font-size: 14px;
    font-weight: 600;
    color: rgb(253 230 138 / 0.85);
    letter-spacing: 0.08em;
  }

  /* --- 揭晓阶段：纵向居中，孵化成功弹框内宠物图标水平居中 --- */
  .reveal-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 45%, #6ee7b7 100%);
    border-radius: 20px;
    padding: 28px 32px 24px;
    box-shadow:
      0 20px 60px rgb(0 0 0 / 0.35),
      0 0 40px rgb(52 211 153 / 0.35);
    animation: revealPop 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .hatch-badge {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #047857;
    margin-bottom: 10px;
  }

  /* pet-icon 在 flex 容器内居中，避免大尺寸 lg 图标偏左 */
  .pet-icon-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-bottom: 8px;
  }

  .pet-icon {
    animation: petBounce 0.9s ease infinite;
  }

  .pet-rarity {
    margin-bottom: 10px;
  }

  .pet-name {
    font-size: 22px;
    font-weight: 800;
    color: #064e3b;
    margin-bottom: 20px;
  }

  .close-btn {
    padding: 10px 28px;
    border: none;
    border-radius: 999px;
    background: #047857;
    color: #ecfdf5;
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

  @keyframes eggShake {
    0%,
    100% {
      transform: rotate(0deg) scale(1);
    }
    25% {
      transform: rotate(-6deg) scale(1.02);
    }
    75% {
      transform: rotate(6deg) scale(1.02);
    }
  }

  @keyframes glowPulse {
    0%,
    100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.08);
    }
  }

  @keyframes crackShow {
    0% {
      opacity: 0;
      height: 0;
    }
    100% {
      opacity: 0.9;
      height: 28px;
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

  @keyframes petBounce {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-8px) scale(1.08);
    }
  }

  .pet-hatch-enter-active {
    animation: overlayIn 0.28s ease;
  }

  .pet-hatch-leave-active {
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
