<script setup lang="ts">
/**
   * 抽奖宝箱
   * 稀有度展示用 API 的 rarityLabel/rarityColor/rarityIcon，不用 RARITY_MAP
   * 动画分阶段：蓄力 → 滚轮 → 揭晓/汇总（见 components/rpg/lottery/）
   */
import type { LotteryDrawPhase } from '@/utils/lottery-reel';
import type { DrawResult, LotteryPoolItem, LotteryRecord, RpgStatus } from '~~/types/rpg';
import { formactDate } from '@/utils/common';
import {
  LOTTERY_CURRENCY_COST,
  LOTTERY_EPIC_PITY_THRESHOLD,
  LOTTERY_LEGENDARY_PITY_THRESHOLD,
} from '@/utils/rpg-economy';

const props = defineProps<{
  lotteryPool: LotteryPoolItem[];
  lotteryTickets: number;
  rpgStatus: RpgStatus | null;
  lotteryHistory: LotteryRecord[];
  drawing: boolean;
}>();

const emit = defineEmits<{
  draw: [count: number, currency: 'ticket' | 'currency'];
  loadHistory: [];
  finished: [results: DrawResult[]];
}>();

const drawCurrency = ref<'ticket' | 'currency'>('currency');
const { openRechargeModal } = useRpgRecharge();
const drawResults = ref<DrawResult[]>([]);
const drawPhase = ref<LotteryDrawPhase | 'idle'>('idle');
const pendingCount = ref(1);
const showHistory = ref(false);

const { playSfx } = useRpgAudio();

/** 传说/史诗级奖池 → 金底特殊卡（美术改版 v2） */
const isLegendRarity = (item: LotteryPoolItem) => {
  const r = (item.rarity || '').toLowerCase();
  return r === 'epic' || r === 'legendary' || r === 'ssr';
};

/** 概率展示：0-1 的小数按百分比换算，≥1 视为已是百分数 */
const formatProbability = (p?: number) => {
  if (p == null || Number.isNaN(p)) return '';
  const percent = p > 0 && p < 1 ? p * 100 : p;
  const rounded = Math.round(percent * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded}%`;
};

/** 切换抽奖支付方式（券 / 钻石） */
const setDrawCurrency = (currency: 'ticket' | 'currency') => {
  if (drawCurrency.value === currency) return;
  void playSfx('tabSwitch');
  drawCurrency.value = currency;
};

const showOverlay = computed(() => drawPhase.value !== 'idle');
const isAnimating = computed(() => drawPhase.value !== 'idle');
const overlayPhase = computed(() => (drawPhase.value === 'idle' ? 'charging' : drawPhase.value));

/** 判断是否可抽奖（券或钻石） */
const canDraw = (count: number) => {
  if (drawCurrency.value === 'currency') {
    return (props.rpgStatus?.currency || 0) >= count * LOTTERY_CURRENCY_COST;
  }
  return props.lotteryTickets >= count;
};

/** 抽奖按钮是否禁用：钻石不足仍可点击（弹充值），仅抽奖券不足时禁用 */
const isDrawDisabled = (count: number) => {
  if (props.drawing || isAnimating.value) return true;
  if (drawCurrency.value === 'ticket') return !canDraw(count);
  return false;
};

/** 进入揭晓或汇总阶段 */
const goToResultPhase = () => {
  drawPhase.value = pendingCount.value > 1 ? 'summary' : 'reveal';
};

/** 结束整轮抽奖动画 */
const finishDrawAnimation = () => {
  const results = [...drawResults.value];
  drawPhase.value = 'idle';
  drawResults.value = [];
  emit('finished', results);
};

/**
   * 触发抽奖：先进入蓄力阶段，再 emit 给父组件调 API。
   * 结果展示由父组件调用 showDrawResults 驱动滚轮与揭晓。
   */
/** 发起抽奖：进入蓄力阶段并播放 uiClick */
const handleDraw = (count = 1) => {
  if (props.drawing || isAnimating.value) return;
  if (drawCurrency.value === 'currency' && !canDraw(count)) {
    openRechargeModal();
    return;
  }
  if (!canDraw(count)) return;

  pendingCount.value = count;
  drawResults.value = [];
  drawPhase.value = 'charging';
  void playSfx('uiClick');
  emit('draw', count, drawCurrency.value);
};

/** 父组件抽奖成功后调用，进入滚轮阶段 */
defineExpose({
  showDrawResults: (results: DrawResult[]) => {
    if (!results.length) {
      finishDrawAnimation();
      return;
    }
    drawResults.value = results;
    drawPhase.value = 'spinning';
  },
  cancelDrawAnimation: () => {
    finishDrawAnimation();
  },
});

const onOverlaySkip = () => {
  if (drawPhase.value === 'spinning') {
    goToResultPhase();
  }
};

const onOverlayClose = () => {
  finishDrawAnimation();
};

/** 「再来五连」：收下本轮并立刻重抽数（余额不足时走充值弹窗） */
const onOverlayRedraw = () => {
  finishDrawAnimation();
  handleDraw(5);
};

/** 展开/收起抽奖记录；变更时播放 tabSwitch */
const toggleHistory = () => {
  showHistory.value = !showHistory.value;
  void playSfx('tabSwitch');
  if (showHistory.value && props.lotteryHistory.length === 0) {
    emit('loadHistory');
  }
};
</script>

<template>
  <div class="lottery-section">
    <div class="lottery-header">
      <span class="section-title"><img class="title-art" src="/rpg/icons/gift.png" alt=""> 幸运宝箱</span>
      <span class="ticket-count">
        <img class="count-art" src="/rpg/icons/ticket.png" alt=""> {{ lotteryTickets }}
        <i class="count-sep" />
        <img class="count-art" src="/rpg/icons/gem.png" alt=""> {{ rpgStatus?.currency ?? 0 }}
      </span>
    </div>
    <!-- v3 ③ 保底进度可视化：epic 90 / legendary 180 -->
    <div
      v-if="rpgStatus?.lotteryPityCounter != null || rpgStatus?.lotteryLegendaryPityCounter != null"
      class="pity-box"
    >
      <div v-if="rpgStatus?.lotteryPityCounter != null" class="pity-row">
        <small><b>已垫 {{ rpgStatus.lotteryPityCounter }} 抽</b><span>史诗保底 · {{ LOTTERY_EPIC_PITY_THRESHOLD }} 抽必得</span></small>
        <div class="pity-row__track">
          <i
            :style="{
              width:
                Math.min(100, (rpgStatus.lotteryPityCounter / LOTTERY_EPIC_PITY_THRESHOLD) * 100)
                + '%',
            }"
          />
        </div>
      </div>
      <div v-if="rpgStatus?.lotteryLegendaryPityCounter != null" class="pity-row">
        <small><b>已垫 {{ rpgStatus.lotteryLegendaryPityCounter }} 抽</b><span>传说保底 · {{ LOTTERY_LEGENDARY_PITY_THRESHOLD }} 抽必得</span></small>
        <div class="pity-row__track pity-row__track--gold">
          <i
            :style="{
              width:
                Math.min(
                  100,
                  (rpgStatus.lotteryLegendaryPityCounter / LOTTERY_LEGENDARY_PITY_THRESHOLD) * 100,
                ) + '%',
            }"
          />
        </div>
      </div>
    </div>
    <div class="flex gap-2 mb-3 rpg-panel-tabs !mb-3">
      <button
        class="rpg-panel-tab"
        :class="{ active: drawCurrency === 'ticket' }"
        @click="setDrawCurrency('ticket')"
      >
        抽奖券
      </button>
      <button
        class="rpg-panel-tab"
        :class="{ active: drawCurrency === 'currency' }"
        @click="setDrawCurrency('currency')"
      >
        钻石(10/抽)
      </button>
    </div>

    <div class="chest-area">
      <div
        class="chest"
        :class="{
          charging: drawPhase === 'charging',
          spinning: drawPhase === 'spinning',
          disabled: isAnimating || drawing,
        }"
        @click="!isAnimating && !drawing && handleDraw(1)"
      >
        <span v-if="drawPhase === 'charging'" class="chest-aura" aria-hidden="true" />
        <img
          v-if="drawPhase === 'charging'"
          class="chest-spark"
          src="/rpg/icons/sparkle.png"
          alt=""
        >
        <img
          v-if="drawPhase === 'charging'"
          class="chest-spark chest-spark--1"
          src="/rpg/icons/sparkle.png"
          alt=""
        >
        <img
          v-if="drawPhase === 'charging'"
          class="chest-spark chest-spark--2"
          src="/rpg/icons/sparkle.png"
          alt=""
        >
        <div class="chest-body">
          <img
            class="chest-icon"
            :src="
              drawPhase === 'charging'
                ? '/rpg/icons/sparkle.png'
                : drawPhase === 'spinning'
                  ? '/rpg/icons/dice.png'
                  : '/rpg/icons/gift.png'
            "
            alt=""
          >
          <span v-if="!isAnimating" class="chest-label">点击开启</span>
          <span v-else class="chest-label chest-label--active">
            {{ drawPhase === 'charging' ? '开启中…' : '抽奖中…' }}
          </span>
        </div>
      </div>

      <div class="draw-actions">
        <button class="draw-btn" :disabled="isDrawDisabled(1)" @click="handleDraw(1)">
          <img
            class="btn-art"
            :src="drawCurrency === 'ticket' ? '/rpg/icons/ticket.png' : '/rpg/icons/gem.png'"
            alt=""
          >
          单抽 ×1
        </button>
        <button
          class="draw-btn draw-btn-multi"
          :disabled="isDrawDisabled(5)"
          @click="handleDraw(5)"
        >
          <img
            class="btn-art"
            :src="drawCurrency === 'ticket' ? '/rpg/icons/ticket.png' : '/rpg/icons/gem.png'"
            alt=""
          >
          五连 ×5
        </button>
      </div>
    </div>

    <RpgLotteryDrawOverlay
      :visible="showOverlay"
      :phase="overlayPhase"
      :pool="lotteryPool"
      :results="drawResults"
      :draw-count="pendingCount"
      :can-redraw="pendingCount === 5 && canDraw(5) && !drawing"
      @skip="onOverlaySkip"
      @close="onOverlayClose"
      @redraw="onOverlayRedraw"
    />

    <div class="pool-preview">
      <div class="pool-title">
        奖池一览 <span class="pool-title__sub">probability 直出</span>
      </div>
      <div class="rpg-pool-grid">
        <div
          v-for="item in lotteryPool"
          :key="item.id"
          class="rpg-pool-chip"
          :class="{ 'pool-chip--legend': isLegendRarity(item) }"
          :style="{ borderColor: item.rarityColor || 'var(--rpg-loot-border)' }"
        >
          <RpgItemIcon
            class="rpg-pool-chip__icon"
            :icon="item.icon"
            :icon-url="item.iconUrl"
            :bg-url="item.bgUrl"
            :item-type-icon="item.itemTypeIcon"
            :rarity-color="item.rarityColor"
            size="lg"
            :tinted="true"
          />
          <RpgRarityBadge
            class="rpg-pool-chip__badge"
            :rarity="item.rarity"
            :rarity-label="item.rarityLabel"
            :rarity-color="item.rarityColor"
            :rarity-icon="item.rarityIcon"
          />
          <span class="rpg-pool-chip__name">{{ item.name }}</span>
          <span class="rpg-pool-chip__prob">{{ formatProbability(item.probability) }}</span>
        </div>
      </div>
    </div>

    <div class="history-toggle">
      <div class="history-btn" @click="toggleHistory">
        <img class="history-art" src="/rpg/icons/scroll.png" alt=""> 抽奖记录
        <span class="toggle-chevron" :class="{ 'toggle-chevron--open': showHistory }" />
      </div>
      <div v-if="showHistory" class="history-list">
        <div v-if="lotteryHistory.length === 0" class="rpg-empty-inline !py-2">
          暂无记录
        </div>
        <div
          v-for="record in lotteryHistory"
          :key="record.id"
          class="rpg-rank-row rpg-rank-row--compact"
        >
          <RpgItemIcon
            :icon="record.icon"
            :icon-url="record.iconUrl"
            :bg-url="record.bgUrl"
            :item-type-icon="record.itemTypeIcon"
            :rarity-color="record.rarityColor"
            size="sm"
          />
          <RpgRarityBadge
            class="history-rarity-badge"
            :rarity="record.poolRarity"
            :rarity-label="record.rarityLabel"
            :rarity-color="record.rarityColor"
            :rarity-icon="record.rarityIcon"
          />
          <span class="history-name">{{ record.poolName }}</span>
          <span class="history-time">{{ formactDate(record.createTime) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .lottery-section {
    margin-top: 12px;
  }

  .lottery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .section-title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 700;
    color: var(--rpg-text);
  }

  .title-art {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }

  .ticket-count {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 700;
    color: var(--rpg-violet);
    background: var(--rpg-violet-bg);
    padding: 3px 10px;
    border-radius: 12px;
  }

  .count-art {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }

  .count-sep {
    width: 1px;
    height: 10px;
    margin: 0 3px;
    background: var(--rpg-border);
  }

  .chest-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .chest {
    width: 108px;
    height: 108px;
    border-radius: 18px;
    background: var(--rpg-loot-bg);
    border: 2px solid var(--rpg-amber-border);
    box-shadow: var(--rpg-loot-shadow), var(--rpg-loot-inset);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.25s;
    position: relative;
    overflow: visible;
  }

  .chest:hover:not(.disabled) {
    transform: scale(1.05);
    box-shadow: 0 8px 28px rgb(245 158 11 / 0.28);
  }

  .chest.charging {
    animation: chestCharge 0.14s infinite alternate;
    box-shadow: 0 0 32px rgb(251 191 36 / 0.45);
  }

  .chest.spinning {
    box-shadow: 0 0 24px rgb(139 92 246 / 0.35);
  }

  .chest.disabled {
    cursor: default;
    opacity: 0.88;
  }

  .chest-aura {
    position: absolute;
    inset: -10px;
    border-radius: 22px;
    background: radial-gradient(circle, rgb(251 191 36 / 0.5), transparent 70%);
    animation: auraPulse 1s ease-in-out infinite;
  }

  .chest-spark {
    position: absolute;
    width: 16px;
    height: 16px;
    object-fit: contain;
    animation: sparkOrbit 1.6s linear infinite;
    filter: drop-shadow(0 0 6px rgb(251 191 36 / 0.8));
  }

  .chest-spark--1 {
    top: 6px;
    right: 10px;
  }

  .chest-spark--2 {
    bottom: 8px;
    left: 10px;
    animation-delay: 0.8s;
  }

  .chest-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .chest-icon {
    width: 44px;
    height: 44px;
    object-fit: contain;
    filter: drop-shadow(0 3px 8px rgb(217 161 60 / 0.45));
    transition: transform 0.2s;
  }

  .chest.charging .chest-icon {
    animation: iconPulse 0.8s ease-in-out infinite;
  }

  .chest-label {
    font-size: 10px;
    color: var(--rpg-amber-text);
    font-weight: 600;
    margin-top: 2px;
  }

  .chest-label--active {
    color: var(--rpg-amber-dark);
    animation: labelBlink 1s ease-in-out infinite;
  }

  .draw-actions {
    display: flex;
    gap: 8px;
  }

  .draw-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 20px;
    border: none;
    border-radius: 12px;
    background: var(--rpg-art-violet-grad, var(--rpg-violet-gradient));
    color: white;
    font-weight: 700;
    font-size: 13.5px;
    cursor: pointer;
    box-shadow: var(--rpg-art-shadow-violet);
    transition:
      opacity 0.2s,
      transform 0.2s;
  }

  .btn-art {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    object-fit: contain;
    background: rgb(255 255 255 / 0.16);
  }

  .draw-btn:disabled {
    background: var(--rpg-disabled);
    cursor: not-allowed;
  }

  .draw-btn:not(:disabled):hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .draw-btn-multi {
    background: var(--rpg-art-gold-grad, var(--rpg-level-badge-gradient));
    color: var(--rpg-art-gold-ink, #3a2408);
    box-shadow: var(--rpg-art-shadow-gold);
  }

  .pool-preview {
    margin-bottom: 12px;
  }

  .pool-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--rpg-text-label);
    margin-bottom: 8px;
    text-align: center;
  }

  .pool-title__sub {
    font-size: 10.5px;
    font-weight: 500;
    color: var(--rpg-text-muted);
    margin-left: 4px;
  }

  .rpg-pool-chip {
    position: relative;
  }

  .pool-chip--legend {
    background: linear-gradient(160deg, var(--rpg-art-gold-soft, #fdf6e4), var(--rpg-loot-bg));
    box-shadow: 0 0 0 3px var(--rpg-art-epic-glow, rgb(217 161 60 / 0.25));
  }

  .rpg-pool-chip__prob {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 9.5px;
    font-weight: 800;
    padding: 1px 6px;
    border-radius: 999px;
    background: var(--rpg-art-violet-soft, #f1edfb);
    color: var(--rpg-art-violet-deep, #5b3fd6);
  }

  .history-toggle {
    margin-top: 8px;
  }

  .history-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--rpg-text-label);
    cursor: pointer;
    user-select: none;
    margin-bottom: 6px;
  }

  .history-art {
    width: 15px;
    height: 15px;
    object-fit: contain;
  }

  /* v6/H：折叠箭头换 CSS chevron 旋转过渡 */
  .toggle-chevron {
    width: 7px;
    height: 7px;
    margin-left: 4px;
    flex-shrink: 0;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(-45deg);
    transition: transform 0.2s ease;
  }

  .toggle-chevron--open {
    transform: rotate(45deg);
  }

  .history-list {
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* v6/H：行 hover 浮起 + 金描边 */
  .history-list .rpg-rank-row {
    transition:
      transform 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .history-list .rpg-rank-row:hover {
    transform: translateY(-1px);
    border-color: color-mix(in oklch, var(--rpg-art-gold, #d9a13c) 55%, transparent);
    box-shadow: 0 3px 10px rgb(217 161 60 / 0.12);
  }

  .history-rarity-badge {
    flex-shrink: 0;
  }

  .history-name {
    font-size: 12px;
    color: var(--rpg-text-body);
    font-weight: 500;
    flex: 1;
  }

  .history-time {
    font-size: 10px;
    color: var(--rpg-text-muted);
    font-variant-numeric: tabular-nums;
  }

  @keyframes chestCharge {
    from {
      transform: rotate(-2deg) scale(1.03);
    }
    to {
      transform: rotate(2deg) scale(1.06);
    }
  }

  @keyframes auraPulse {
    0%,
    100% {
      opacity: 0.55;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.06);
    }
  }

  @keyframes sparkOrbit {
    0%,
    100% {
      transform: translateY(0) scale(1);
      opacity: 0.6;
    }
    50% {
      transform: translateY(-6px) scale(1.2);
      opacity: 1;
    }
  }

  @keyframes iconPulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.12);
    }
  }

  @keyframes labelBlink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.55;
    }
  }

  /* ── v3 ③ 保底进度可视化 ── */
  .pity-box {
    border-radius: 14px;
    padding: 12px 16px;
    margin-bottom: 12px;
    background: linear-gradient(
      160deg,
      var(--rpg-art-gold-soft, #fdf9ec),
      var(--rpg-art-violet-soft, #faf9fe)
    );
    border: 1px solid rgb(217 161 60 / 0.4);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pity-row small {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.65));
    margin-bottom: 5px;
  }

  .pity-row small b {
    color: var(--rpg-text-heading, oklch(var(--bc)));
    font-size: 12.5px;
  }

  .pity-row__track {
    height: 8px;
    border-radius: 999px;
    background: var(--rpg-border, #efe7d2);
    overflow: hidden;
  }

  .pity-row__track i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #a78bfa, #7c5cf0);
    border-radius: 999px;
    transition: width 0.4s ease;
  }

  .pity-row__track--gold i {
    background: linear-gradient(90deg, #e8b04b, #d9a13c);
  }
</style>
