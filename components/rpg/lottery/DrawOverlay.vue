<script setup lang="ts">
/**
   * 抽奖全屏动画层
   * 阶段：charging（蓄力等待 API）→ spinning（滚轮）→ reveal（单抽揭晓）→ summary（多连汇总）
   */
import { formatRewardDetail } from '~~/types/rpg';
import type { DrawResult, LotteryPoolItem } from '~~/types/rpg';
import { lotteryRevealSfxKey } from '~~/constants/rpg-audio';
import {
  getBestRarityTier,
  getCompactSpinDurationMs,
  getRarityCelebrationTier,
  getSpinPhaseFallbackMs,
  LOTTERY_PAUSE_MS,
  LOTTERY_PAUSE_MS_MULTI,
  LOTTERY_SPIN_MS,
  type LotteryDrawPhase,
} from '@/utils/lottery-reel';

const { playSfx, playSfxLoop, stopSfx } = useRpgAudio();

const props = defineProps<{
  visible: boolean;
  phase: LotteryDrawPhase;
  pool: LotteryPoolItem[];
  results: DrawResult[];
  drawCount: number;
}>();

const emit = defineEmits<{
  skip: [];
  close: [];
}>();

const reelsLanded = ref(0);
const revealReady = ref(false);
let spinFallbackTimer: ReturnType<typeof setTimeout> | null = null;
const skipEmitted = ref(false);

const clearSpinFallback = () => {
  if (spinFallbackTimer) {
    clearTimeout(spinFallbackTimer);
    spinFallbackTimer = null;
  }
};

const safeEmitSkip = () => {
  if (skipEmitted.value || props.phase !== 'spinning') return;
  skipEmitted.value = true;
  void playSfx('uiClick');
  emit('skip');
};

const isMulti = computed(() => props.drawCount > 1);

/** 滚轮动画时长（与 Reel spinDurationMs 一致，用于对齐 lotterySpin 循环音） */
const activeSpinDurationMs = computed(() => {
  if (!isMulti.value) return LOTTERY_SPIN_MS;
  const lastIdx = Math.max(props.drawCount - 1, 0);
  return getCompactSpinDurationMs(lastIdx);
});
const currentResult = computed(() => props.results[0] ?? null);
const celebrationRarity = computed(() => {
  if (props.phase === 'summary') {
    return getBestRarityTier(props.results);
  }
  return currentResult.value
    ? getRarityCelebrationTier(currentResult.value.item.rarity)
    : 'common';
});

const phaseTitle = computed(() => {
  const map: Record<LotteryDrawPhase, string> = {
    charging: '宝箱开启中…',
    spinning: isMulti.value
      ? `五连开启中 (${reelsLanded.value}/${props.drawCount})`
      : '好运滚动中…',
    reveal: '恭喜获得',
    summary: '本轮收获',
  };
  return map[props.phase];
});

const getRarityGlow = (rarity: string): string => {
  const map: Record<string, string> = {
    common: '0 0 24px rgba(148, 163, 184, 0.35)',
    rare: '0 0 36px rgba(59, 130, 246, 0.55)',
    epic: '0 0 48px rgba(139, 92, 246, 0.65)',
    legendary: '0 0 60px rgba(245, 158, 11, 0.85)',
  };
  return map[rarity] || map.common || '';
};

const resetSpinState = () => {
  reelsLanded.value = 0;
  revealReady.value = false;
  skipEmitted.value = false;
  clearSpinFallback();
};

/** 抽奖全屏层打开时禁止页面滚动 */
const lockPageScroll = (lock: boolean) => {
  if (!import.meta.client) return;
  const value = lock ? 'hidden' : '';
  document.documentElement.style.overflow = value;
  document.body.style.overflow = value;
};

onUnmounted(() => {
  lockPageScroll(false);
  resetSpinState();
  clearSpinFallback();
});

watch(
  () => props.visible,
  (v) => {
    lockPageScroll(v);
    if (!v) {
      resetSpinState();
      // 关闭 overlay 时立即停止循环/蓄力音
      void stopSfx('lotterySpin', 0);
      void stopSfx('lotteryCharge', 0);
    }
  },
  { immediate: true },
);

/** 抽奖阶段切换：蓄力 → 滚轮循环 → 揭晓按稀有度播音 */
watch(
  () => props.phase,
  (phase, prev) => {
    if (phase === 'charging') {
      void playSfx('lotteryCharge');
    }
    if (phase === 'spinning') {
      resetSpinState();
      void stopSfx('lotteryCharge', 0);
      void playSfxLoop('lotterySpin', { durationMs: activeSpinDurationMs.value });
      const maxSpinMs = getSpinPhaseFallbackMs(props.results.length, isMulti.value);
      clearSpinFallback();
      spinFallbackTimer = window.setTimeout(() => {
        safeEmitSkip();
      }, maxSpinMs);
    }
    else if (prev === 'spinning') {
      void stopSfx('lotterySpin');
    }
    else {
      clearSpinFallback();
    }
    if (phase === 'reveal' && currentResult.value) {
      void playSfx(lotteryRevealSfxKey(currentResult.value.item.rarity));
      revealReady.value = false;
      window.setTimeout(() => {
        revealReady.value = true;
      }, 120);
    }
    if (phase === 'summary' && props.results.length) {
      void playSfx(lotteryRevealSfxKey(getBestRarityTier(props.results)));
    }
  },
);

const onReelLanded = () => {
  reelsLanded.value += 1;

  const allLanded = !isMulti.value || reelsLanded.value >= props.results.length;
  if (allLanded) {
    // 滚轮停格即停循环底噪，避免动画已停但 lotterySpin 仍响
    void stopSfx('lotterySpin', 60);
  }

  if (isMulti.value) {
    if (reelsLanded.value >= props.results.length) {
      window.setTimeout(() => safeEmitSkip(), LOTTERY_PAUSE_MS_MULTI);
    }
    return;
  }

  window.setTimeout(() => safeEmitSkip(), LOTTERY_PAUSE_MS);
};

const handleOverlayClick = () => {
  if (props.phase === 'charging') return;
  if (props.phase === 'spinning') {
    safeEmitSkip();
    return;
  }
  if (props.phase === 'reveal') {
    emit('close');
    return;
  }
  if (props.phase === 'summary') {
    emit('close');
  }
};

const handleConfirm = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="lottery-draw">
      <div
        v-if="visible"
        class="lottery-draw-overlay"
        :class="[`phase-${phase}`, { multi: isMulti }]"
        @click="handleOverlayClick"
      >
        <div class="overlay-rays" aria-hidden="true" />
        <RpgLotteryConfetti
          :active="phase === 'reveal' || phase === 'summary'"
          :rarity="celebrationRarity"
          :density="phase === 'summary' ? 'high' : 'medium'"
        />

        <div class="draw-panel" @click.stop>
          <div class="panel-header">
            <span class="panel-title">{{ phaseTitle }}</span>
            <button
              v-if="phase === 'spinning'"
              type="button"
              class="skip-btn"
              @click="safeEmitSkip"
            >
              跳过
            </button>
          </div>

          <!-- 蓄力阶段 -->
          <div v-if="phase === 'charging'" class="charging-stage">
            <div class="charging-chest">
              <span class="chest-glow" />
              <span class="chest-emoji">🎁</span>
            </div>
            <div class="charging-rings">
              <span /><span /><span />
            </div>
            <p class="charging-tip">
              幸运值汇聚中，请稍候…
            </p>
          </div>

          <!-- 滚轮阶段 -->
          <div v-else-if="phase === 'spinning'" class="spinning-stage">
            <template v-if="isMulti">
              <div class="multi-reels">
                <RpgLotteryReel
                  v-for="(result, idx) in results"
                  :key="`${result.item.code}-${idx}`"
                  class="multi-reel"
                  :pool="pool"
                  :winner="result.item"
                  :spinning="true"
                  :compact="true"
                  :spin-duration-ms="getCompactSpinDurationMs(idx)"
                  @landed="onReelLanded"
                />
              </div>
            </template>
            <RpgLotteryReel
              v-else-if="currentResult"
              :pool="pool"
              :winner="currentResult.item"
              :spinning="true"
              @landed="onReelLanded"
            />
          </div>

          <!-- 单抽揭晓 -->
          <div v-else-if="phase === 'reveal' && currentResult" class="reveal-stage">
            <div
              class="reveal-card"
              :class="{ ready: revealReady }"
              :style="{ '--rarity-glow': getRarityGlow(currentResult.item.rarity) }"
            >
              <div class="reveal-banner">
                ✨ 恭喜获得 ✨
              </div>
              <RpgRarityBadge
                class="reveal-rarity"
                :rarity="currentResult.item.rarity"
                :rarity-label="currentResult.item.rarityLabel"
                :rarity-color="currentResult.item.rarityColor"
                :rarity-icon="currentResult.item.rarityIcon"
              />
              <RpgItemIcon
                class="reveal-item-icon"
                :icon="currentResult.item.icon"
                :item-type-icon="currentResult.item.itemTypeIcon"
                :rarity-color="currentResult.item.rarityColor"
                size="lg"
              />
              <div class="reveal-name">
                {{ currentResult.item.name }}
              </div>
              <div class="reveal-desc">
                {{ currentResult.item.description }}
              </div>
              <div v-if="currentResult.rewardDetail" class="reveal-reward">
                {{ formatRewardDetail(currentResult.rewardDetail) }}
              </div>
            </div>
            <p class="reveal-hint">
              点击任意处收下奖励
            </p>
          </div>

          <!-- 多连汇总 -->
          <div v-else-if="phase === 'summary'" class="summary-stage">
            <div class="summary-grid">
              <div
                v-for="(result, idx) in results"
                :key="`${result.item.code}-${idx}`"
                class="summary-card"
                :style="{
                  borderColor: result.item.rarityColor || '#94a3b8',
                  animationDelay: `${idx * 0.08}s`,
                }"
              >
                <RpgItemIcon
                  class="summary-item-icon"
                  :icon="result.item.icon"
                  :item-type-icon="result.item.itemTypeIcon"
                  :rarity-color="result.item.rarityColor"
                  size="sm"
                />
                <RpgRarityBadge
                  :rarity="result.item.rarity"
                  :rarity-label="result.item.rarityLabel"
                  :rarity-color="result.item.rarityColor"
                  :rarity-icon="result.item.rarityIcon"
                />
                <span class="summary-name">{{ result.item.name }}</span>
                <span v-if="result.rewardDetail" class="summary-reward">
                  {{ formatRewardDetail(result.rewardDetail) }}
                </span>
              </div>
            </div>
            <button type="button" class="confirm-btn" @click="handleConfirm">
              全部收下
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .lottery-draw-overlay {
    position: fixed;
    inset: 0;
    z-index: 10060;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 0.72);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    overflow: hidden;
    overscroll-behavior: none;
  }

  /* 旋转层须大于视口（用 vmax 而非窗口尺寸），避免手机端旋转时露出空白 */
  .overlay-rays {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 200vmax;
    height: 200vmax;
    transform: translate(-50%, -50%);
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      rgb(251 191 36 / 0.08) 30deg,
      transparent 60deg,
      rgb(139 92 246 / 0.06) 120deg,
      transparent 150deg,
      rgb(59 130 246 / 0.06) 210deg,
      transparent 240deg,
      rgb(251 191 36 / 0.08) 300deg,
      transparent 330deg
    );
    animation: raysSpin 8s linear infinite;
    pointer-events: none;
  }

  .phase-charging .overlay-rays {
    animation-duration: 4s;
  }

  .draw-panel {
    position: relative;
    z-index: 5;
    width: min(92vw, 420px);
    padding: 20px 18px 22px;
    border-radius: 20px;
    background: linear-gradient(160deg, rgb(30 27 46 / 0.95), rgb(15 23 42 / 0.92));
    border: 1px solid rgb(255 255 255 / 0.1);
    box-shadow:
      0 24px 80px rgb(0 0 0 / 0.55),
      inset 0 1px 0 rgb(255 255 255 / 0.08);
  }

  .multi .draw-panel {
    width: min(94vw, 480px);
    padding: 14px 12px 16px;
  }

  @media (max-width: 639px) {
    .multi .draw-panel {
      width: min(96vw, 480px);
      padding: 12px 10px 14px;
    }

    .multi-reels {
      gap: 3px;
    }
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .panel-title {
    font-size: 15px;
    font-weight: 800;
    color: #fde68a;
    letter-spacing: 0.04em;
  }

  .skip-btn {
    padding: 4px 12px;
    border-radius: 999px;
    border: 1px solid rgb(255 255 255 / 0.2);
    background: rgb(255 255 255 / 0.06);
    color: rgb(255 255 255 / 0.75);
    font-size: 11px;
    cursor: pointer;
  }

  .skip-btn:hover {
    background: rgb(255 255 255 / 0.12);
  }

  .charging-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0 8px;
  }

  .charging-chest {
    position: relative;
    width: 96px;
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chest-glow {
    position: absolute;
    inset: -8px;
    border-radius: 22px;
    background: radial-gradient(circle, rgb(251 191 36 / 0.55), transparent 68%);
    animation: chestGlow 1.1s ease-in-out infinite;
  }

  .chest-emoji {
    position: relative;
    font-size: 52px;
    animation: chestShake 0.12s infinite alternate;
    filter: drop-shadow(0 0 16px rgb(251 191 36 / 0.6));
  }

  .charging-rings {
    position: relative;
    width: 140px;
    height: 48px;
    margin-top: 4px;
  }

  .charging-rings span {
    position: absolute;
    left: 50%;
    top: 50%;
    border: 2px solid rgb(251 191 36 / 0.45);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: ringExpand 1.6s ease-out infinite;
  }

  .charging-rings span:nth-child(1) {
    width: 60px;
    height: 60px;
  }

  .charging-rings span:nth-child(2) {
    width: 90px;
    height: 90px;
    animation-delay: 0.35s;
  }

  .charging-rings span:nth-child(3) {
    width: 120px;
    height: 120px;
    animation-delay: 0.7s;
  }

  .charging-tip {
    margin-top: 14px;
    font-size: 12px;
    color: rgb(255 255 255 / 0.55);
  }

  .spinning-stage {
    min-height: 110px;
  }

  .multi-reels {
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: visible;
  }

  .multi-reel {
    flex-shrink: 0;
  }

  .reveal-stage {
    text-align: center;
    padding: 4px 0 2px;
  }

  .reveal-card {
    padding: 22px 20px 18px;
    border-radius: 16px;
    background: var(--rpg-modal-surface, var(--rpg-surface));
    border: 1.5px solid var(--rpg-border);
    box-shadow: var(--rarity-glow, 0 0 24px rgb(148 163 184 / 0.25));
    transform: scale(0.72);
    opacity: 0;
    transition:
      transform 0.45s cubic-bezier(0.22, 1.12, 0.36, 1),
      opacity 0.35s ease;
  }

  .reveal-card.ready {
    transform: scale(1);
    opacity: 1;
  }

  .reveal-banner {
    font-size: 13px;
    font-weight: 800;
    color: var(--rpg-amber);
    margin-bottom: 12px;
    letter-spacing: 0.08em;
    animation: bannerFlash 1.2s ease-in-out infinite;
  }

  .reveal-rarity {
    margin-bottom: 10px;
  }

  .reveal-item-icon {
    margin: 0 auto 12px;
  }

  .reveal-name {
    font-size: 22px;
    font-weight: 900;
    color: var(--rpg-text);
    margin-bottom: 6px;
  }

  .reveal-desc {
    font-size: 13px;
    color: var(--rpg-text-secondary);
    margin-bottom: 8px;
  }

  .reveal-reward {
    font-size: 14px;
    font-weight: 700;
    color: var(--rpg-success);
  }

  .reveal-hint {
    margin-top: 14px;
    font-size: 11px;
    color: rgb(255 255 255 / 0.45);
  }

  .summary-stage {
    padding: 2px 0;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
    margin-bottom: 16px;
  }

  .summary-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 8px;
    border-radius: 10px;
    border: 1.5px solid;
    background: var(--rpg-surface);
    animation: cardPop 0.4s cubic-bezier(0.22, 1.1, 0.36, 1) both;
  }

  .summary-name {
    font-size: 11px;
    font-weight: 700;
    color: var(--rpg-text);
    text-align: center;
    line-height: 1.25;
  }

  .summary-reward {
    font-size: 10px;
    color: var(--rpg-success);
    font-weight: 600;
  }

  .confirm-btn {
    width: 100%;
    padding: 10px 0;
    border: none;
    border-radius: 10px;
    background: var(--rpg-level-badge-gradient);
    color: white;
    font-weight: 800;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 8px 24px rgb(217 119 6 / 0.35);
  }

  .confirm-btn:hover {
    opacity: 0.92;
  }

  @keyframes raysSpin {
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  @keyframes chestGlow {
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

  @keyframes chestShake {
    from {
      transform: rotate(-4deg) scale(1.04);
    }
    to {
      transform: rotate(4deg) scale(1.04);
    }
  }

  @keyframes ringExpand {
    0% {
      opacity: 0.7;
      transform: translate(-50%, -50%) scale(0.6);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }

  @keyframes bannerFlash {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.85;
      transform: scale(1.04);
    }
  }

  @keyframes cardPop {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .lottery-draw-enter-active {
    animation: overlayIn 0.28s ease;
  }

  .lottery-draw-leave-active {
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
