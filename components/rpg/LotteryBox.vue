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
      <span class="section-title">🎁 幸运宝箱</span>
      <span class="ticket-count">🎫 {{ lotteryTickets }} · 💎 {{ rpgStatus?.currency ?? 0 }}</span>
    </div>
    <div
      v-if="rpgStatus?.lotteryPityCounter != null || rpgStatus?.lotteryLegendaryPityCounter != null"
      class="text-xs text-base-content/60 mb-2 flex flex-wrap gap-x-3 gap-y-1"
    >
      <span v-if="rpgStatus?.lotteryPityCounter != null">
        史诗保底 {{ rpgStatus.lotteryPityCounter }} / {{ LOTTERY_EPIC_PITY_THRESHOLD }}
      </span>
      <span v-if="rpgStatus?.lotteryLegendaryPityCounter != null">
        传说保底 {{ rpgStatus.lotteryLegendaryPityCounter }} /
        {{ LOTTERY_LEGENDARY_PITY_THRESHOLD }}
      </span>
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
        <span v-if="drawPhase === 'charging'" class="chest-spark chest-spark--1" aria-hidden="true">✦</span>
        <span v-if="drawPhase === 'charging'" class="chest-spark chest-spark--2" aria-hidden="true">✦</span>
        <div class="chest-body">
          <span class="chest-icon">
            {{ drawPhase === 'charging' ? '✨' : drawPhase === 'spinning' ? '🎲' : '🎁' }}
          </span>
          <span v-if="!isAnimating" class="chest-label">点击开启</span>
          <span v-else class="chest-label chest-label--active">
            {{ drawPhase === 'charging' ? '开启中…' : '抽奖中…' }}
          </span>
        </div>
      </div>

      <div class="draw-actions">
        <button class="draw-btn" :disabled="isDrawDisabled(1)" @click="handleDraw(1)">
          单抽 x1
        </button>
        <button
          class="draw-btn draw-btn-multi"
          :disabled="isDrawDisabled(5)"
          @click="handleDraw(5)"
        >
          五连 x5
        </button>
      </div>
    </div>

    <RpgLotteryDrawOverlay
      :visible="showOverlay"
      :phase="overlayPhase"
      :pool="lotteryPool"
      :results="drawResults"
      :draw-count="pendingCount"
      @skip="onOverlaySkip"
      @close="onOverlayClose"
    />

    <div class="pool-preview">
      <div class="pool-title">
        奖池一览
      </div>
      <div class="rpg-pool-grid">
        <div
          v-for="item in lotteryPool"
          :key="item.id"
          class="rpg-pool-chip"
          :style="{ borderColor: item.rarityColor || 'var(--rpg-loot-border)' }"
        >
          <RpgItemIcon
            class="rpg-pool-chip__icon"
            :icon="item.icon"
            :icon-url="item.iconUrl"
            :bg-url="item.bgUrl"
            :item-type-icon="item.itemTypeIcon"
            :rarity-color="item.rarityColor"
            size="sm"
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
        </div>
      </div>
    </div>

    <div class="history-toggle">
      <div class="history-btn" @click="toggleHistory">
        📜 抽奖记录 <span class="toggle-icon">{{ showHistory ? '▼' : '▶' }}</span>
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
    font-size: 14px;
    font-weight: 700;
    color: var(--rpg-text);
  }

  .ticket-count {
    font-size: 13px;
    font-weight: 700;
    color: var(--rpg-violet);
    background: var(--rpg-violet-bg);
    padding: 3px 10px;
    border-radius: 12px;
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
    font-size: 12px;
    color: var(--rpg-amber-light);
    animation: sparkOrbit 1.6s linear infinite;
    text-shadow: 0 0 8px rgb(251 191 36 / 0.8);
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
    font-size: 38px;
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
    padding: 7px 18px;
    border: none;
    border-radius: 8px;
    background: var(--rpg-violet-gradient);
    color: white;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition:
      opacity 0.2s,
      transform 0.2s;
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
    background: var(--rpg-level-badge-gradient);
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

  .history-toggle {
    margin-top: 8px;
  }

  .history-btn {
    font-size: 12px;
    font-weight: 600;
    color: var(--rpg-text-label);
    cursor: pointer;
    user-select: none;
    margin-bottom: 6px;
  }

  .toggle-icon {
    font-size: 9px;
    margin-left: 4px;
  }

  .history-list {
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
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
</style>
