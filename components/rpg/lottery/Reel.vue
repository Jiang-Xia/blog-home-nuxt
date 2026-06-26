<script setup lang="ts">
/**
   * 横向滚轮槽（电商抽奖滚轴）
   * 使用 Web Animations API 驱动滚动，避免 transition 同帧更新不生效
   */
import {
  LOTTERY_REEL_ITEM_GAP,
  LOTTERY_REEL_ITEM_WIDTH,
  LOTTERY_SPIN_LOOPS,
  LOTTERY_SPIN_LOOPS_COMPACT,
  LOTTERY_SPIN_MS,
  buildReelStrip,
  calcReelOffset,
  measureReelTargetOffset,
  type ReelStripItem,
} from '@/utils/lottery-reel';
import type { DrawResult, LotteryPoolItem } from '~~/types/rpg';
import { getRarityFallbackColor } from '~~/utils/rpg-rarity';

const props = withDefaults(
  defineProps<{
    pool: LotteryPoolItem[];
    winner: DrawResult['item'] | null;
    spinning: boolean;
    compact?: boolean;
    spinDurationMs?: number;
  }>(),
  {
    compact: false,
    spinDurationMs: LOTTERY_SPIN_MS,
  },
);

const emit = defineEmits<{
  landed: [];
}>();

const { playSfx } = useRpgAudio();

const viewportRef = ref<HTMLElement | null>(null);
const stripRef = ref<HTMLElement | null>(null);
const offsetPx = ref(0);
const isMoving = ref(false);
const stripPlan = ref<{ strip: ReelStripItem[]; targetIndex: number } | null>(null);
const hasLanded = ref(false);

let landTimer: ReturnType<typeof setTimeout> | null = null;
let activeAnimation: Animation | null = null;
let activeSpinToken = '';

const itemWidth = computed(() => (props.compact ? 76 : LOTTERY_REEL_ITEM_WIDTH));
const itemGap = computed(() => (props.compact ? 10 : LOTTERY_REEL_ITEM_GAP));
/** 五连 compact：卡片略大，小图标 + 稀有度标签上下分开 */
const itemHeight = computed(() => (props.compact ? 62 : 80));

const stripStyle = computed(() =>
  isMoving.value ? undefined : { transform: `translateX(-${offsetPx.value}px)` },
);

const clearLandTimer = () => {
  if (landTimer) {
    clearTimeout(landTimer);
    landTimer = null;
  }
};

const stopAnimation = () => {
  if (activeAnimation) {
    activeAnimation.cancel();
    activeAnimation = null;
  }
};

const resetReel = () => {
  clearLandTimer();
  stopAnimation();
  activeSpinToken = '';
  isMoving.value = false;
  hasLanded.value = false;
  stripPlan.value = null;
  offsetPx.value = 0;
};

const waitForViewport = async (maxFrames = 24) => {
  for (let i = 0; i < maxFrames; i++) {
    await nextTick();
    if (viewportRef.value?.clientWidth) return viewportRef.value;
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }
  return viewportRef.value;
};

const settleAtTarget = (target: number) => {
  if (activeAnimation) {
    activeAnimation.commitStyles?.();
    activeAnimation.cancel();
    activeAnimation = null;
  }
  offsetPx.value = target;
  isMoving.value = false;
};

/** 滚轮落格：对齐目标位并播放 tick 音 */
const finishSpin = (token: string, target: number) => {
  if (activeSpinToken !== token || hasLanded.value) return;
  clearLandTimer();
  settleAtTarget(target);
  hasLanded.value = true;
  void playSfx('lotteryTick');
  emit('landed');
};

const scheduleFallbackFinish = (token: string, target: number, delayMs: number) => {
  clearLandTimer();
  landTimer = window.setTimeout(() => finishSpin(token, target), delayMs);
};

const runSpin = async () => {
  if (!props.spinning || !props.winner) return;

  const token = `${props.winner.code}:${props.spinDurationMs}`;
  if (activeSpinToken === token && stripPlan.value) return;

  activeSpinToken = token;
  clearLandTimer();
  stopAnimation();
  hasLanded.value = false;
  isMoving.value = false;
  offsetPx.value = 0;
  stripPlan.value = buildReelStrip(
    props.pool,
    props.winner,
    props.compact ? LOTTERY_SPIN_LOOPS_COMPACT : LOTTERY_SPIN_LOOPS,
  );

  await nextTick();
  const viewport = await waitForViewport();
  const stripEl = stripRef.value;

  if (!viewport?.clientWidth || !stripEl || activeSpinToken !== token) {
    scheduleFallbackFinish(token, 0, 500);
    return;
  }

  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

  if (activeSpinToken !== token) return;

  const targetIndex = stripPlan.value!.targetIndex;
  const measured = measureReelTargetOffset(stripEl, targetIndex, viewport.clientWidth);
  const target
    = measured ?? calcReelOffset(targetIndex, viewport.clientWidth, itemWidth.value, itemGap.value);

  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

  if (activeSpinToken !== token) return;

  isMoving.value = true;
  offsetPx.value = 0;

  if (typeof stripEl.animate !== 'function') {
    settleAtTarget(target);
    scheduleFallbackFinish(token, target, props.spinDurationMs + 80);
    return;
  }

  activeAnimation = stripEl.animate(
    [{ transform: 'translateX(0px)' }, { transform: `translateX(-${target}px)` }],
    {
      duration: props.spinDurationMs,
      easing: 'cubic-bezier(0.06, 0.78, 0.12, 1)',
      fill: 'forwards',
    },
  );

  const onDone = () => {
    if (activeSpinToken !== token) return;
    finishSpin(token, target);
  };

  activeAnimation.addEventListener('finish', onDone, { once: true });
  activeAnimation.addEventListener(
    'cancel',
    () => {
      if (activeSpinToken === token) activeSpinToken = '';
    },
    { once: true },
  );

  scheduleFallbackFinish(token, target, props.spinDurationMs + 200);
};

watch(
  () => `${props.spinning}:${props.winner?.code ?? ''}:${props.spinDurationMs}`,
  () => {
    if (!props.spinning || !props.winner) {
      resetReel();
      return;
    }
    runSpin();
  },
  { immediate: true, flush: 'post' },
);

onUnmounted(() => {
  resetReel();
});
</script>

<template>
  <div
    class="lottery-reel"
    :class="{ compact, landed: hasLanded, moving: isMoving }"
    :style="{
      '--item-w': `${itemWidth}px`,
      '--item-h': `${itemHeight}px`,
      '--item-gap': `${itemGap}px`,
    }"
  >
    <div class="reel-pointer reel-pointer--left" />
    <div class="reel-pointer reel-pointer--right" />
    <div class="reel-highlight" />

    <div ref="viewportRef" class="reel-viewport">
      <div ref="stripRef" class="reel-strip" :style="stripStyle">
        <div
          v-for="item in stripPlan?.strip || []"
          :key="item.id"
          class="reel-item"
          :style="{ borderColor: item.rarityColor || getRarityFallbackColor() }"
        >
          <RpgItemIcon
            class="reel-item-icon"
            :icon="item.icon"
            :icon-url="item.iconUrl"
            :bg-url="item.bgUrl"
            :item-type-icon="item.itemTypeIcon"
            :rarity-color="item.rarityColor"
            size="sm"
            :tinted="true"
          />
          <span v-if="!compact" class="reel-name">{{ item.name }}</span>
          <RpgRarityBadge
            class="reel-badge"
            :rarity="item.rarity"
            :rarity-label="item.rarityLabel"
            :rarity-color="item.rarityColor"
            :rarity-icon="item.rarityIcon"
          />
        </div>
      </div>
      <div v-if="!stripPlan?.strip.length" class="reel-placeholder">
        <span class="placeholder-dot" />
        <span class="placeholder-dot" />
        <span class="placeholder-dot" />
      </div>
    </div>

    <div v-if="isMoving" class="reel-blur" />
  </div>
</template>

<style scoped>
  .lottery-reel {
    position: relative;
    width: 100%;
    border-radius: 14px;
    background: linear-gradient(180deg, rgb(0 0 0 / 0.35), rgb(0 0 0 / 0.2));
    border: 1px solid rgb(255 255 255 / 0.12);
    padding: 10px 0;
    overflow: hidden;
  }

  .lottery-reel.compact {
    padding: 8px 0;
    border-radius: 12px;
  }

  .reel-viewport {
    position: relative;
    width: 100%;
    height: var(--item-h);
    overflow: hidden;
    mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  }

  .reel-strip {
    display: flex;
    align-items: stretch;
    gap: var(--item-gap);
    height: 100%;
    will-change: transform;
  }

  .reel-item {
    box-sizing: border-box;
    flex: 0 0 var(--item-w);
    width: var(--item-w);
    min-width: var(--item-w);
    max-width: var(--item-w);
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 6px 4px;
    border-radius: 10px;
    border: 1.5px solid;
    background: color-mix(in oklch, var(--rpg-surface) 88%, #1e293b);
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.06);
  }

  .compact .reel-item {
    border-radius: 11px;
    border-width: 2px;
    padding: 6px 8px 7px;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
  }

  .reel-item-icon {
    flex-shrink: 0;
  }

  .compact .reel-item-icon {
    width: 24px;
    height: 24px;
    font-size: 12px;
    border-radius: 7px;
  }

  .compact .reel-item-icon :deep(.rpg-loot-icon__img) {
    width: 66%;
    height: 66%;
  }

  .compact .reel-badge {
    transform: scale(0.84);
    max-width: 100%;
    flex-shrink: 0;
  }

  .reel-name {
    font-size: 11px;
    font-weight: 700;
    color: #f1f5f9;
    text-align: center;
    line-height: 1.2;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .compact .reel-name {
    font-size: 10px;
  }

  .reel-badge {
    transform: scale(0.85);
  }

  .compact .reel-pointer {
    border-top-width: 8px;
    border-bottom-width: 8px;
  }

  .compact .reel-pointer--left {
    left: calc(50% - var(--item-w) / 2 - 14px);
    border-right-width: 10px;
  }

  .compact .reel-pointer--right {
    left: calc(50% + var(--item-w) / 2 + 4px);
    border-left-width: 10px;
  }

  .reel-highlight {
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 50%;
    width: var(--item-w);
    transform: translateX(-50%);
    border: 2px solid var(--rpg-amber-light);
    border-radius: 12px;
    box-shadow:
      0 0 20px rgb(251 191 36 / 0.45),
      inset 0 0 16px rgb(251 191 36 / 0.12);
    pointer-events: none;
    z-index: 3;
  }

  .compact .reel-highlight {
    top: 7px;
    bottom: 7px;
    border-radius: 12px;
    border-width: 3px;
    box-shadow:
      0 0 28px rgb(251 191 36 / 0.58),
      inset 0 0 22px rgb(251 191 36 / 0.16);
  }

  .reel-pointer {
    position: absolute;
    top: 50%;
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    transform: translateY(-50%);
    z-index: 4;
    filter: drop-shadow(0 0 6px rgb(251 191 36 / 0.8));
  }

  .reel-pointer--left {
    left: calc(50% - var(--item-w) / 2 - 14px);
    border-right: 10px solid var(--rpg-amber-light);
  }

  .reel-pointer--right {
    left: calc(50% + var(--item-w) / 2 + 4px);
    border-left: 10px solid var(--rpg-amber-light);
  }

  .reel-blur {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.06), transparent);
    animation: reelShine 0.55s linear infinite;
    pointer-events: none;
    z-index: 2;
  }

  .lottery-reel.landed .reel-highlight {
    animation: highlightPulse 0.9s ease-in-out infinite;
  }

  .reel-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .placeholder-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--rpg-amber-light);
    animation: dotPulse 0.9s ease-in-out infinite;
  }

  .placeholder-dot:nth-child(2) {
    animation-delay: 0.15s;
  }

  .placeholder-dot:nth-child(3) {
    animation-delay: 0.3s;
  }

  @keyframes reelShine {
    from {
      transform: translateX(-120%);
    }
    to {
      transform: translateX(120%);
    }
  }

  @keyframes highlightPulse {
    0%,
    100% {
      box-shadow:
        0 0 20px rgb(251 191 36 / 0.45),
        inset 0 0 16px rgb(251 191 36 / 0.12);
    }
    50% {
      box-shadow:
        0 0 32px rgb(251 191 36 / 0.7),
        inset 0 0 24px rgb(251 191 36 / 0.2);
    }
  }

  @keyframes dotPulse {
    0%,
    100% {
      opacity: 0.35;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.15);
    }
  }
</style>
