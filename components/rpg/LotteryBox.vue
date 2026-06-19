<script setup lang="ts">
/**
   * 抽奖宝箱
   * 稀有度展示用 API 的 rarityLabel/rarityColor/rarityIcon，不用 RARITY_MAP
   */
import { formatRewardDetail } from '~~/types/rpg';
import type { DrawResult, LotteryPoolItem, LotteryRecord, RpgStatus } from '~~/types/rpg';
import { formactDate } from '@/utils/common';

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
}>();

const drawCurrency = ref<'ticket' | 'currency'>('ticket');
const showResult = ref(false);
const drawResults = ref<DrawResult[]>([]);
const currentResultIndex = ref(0);
const isAnimating = ref(false);
const showHistory = ref(false);

/** 判断是否可抽奖（券或钻石） */
const canDraw = (count: number) => {
  if (drawCurrency.value === 'currency') {
    return (props.rpgStatus?.currency || 0) >= count * 10;
  }
  return props.lotteryTickets >= count;
};

/**
   * 触发抽奖：先播开箱动画，再 emit 给父组件调 API。
   * 结果展示由父组件调用 showDrawResults 回填。
   */
const handleDraw = async (count = 1) => {
  if (props.drawing || isAnimating.value) return;
  if (!canDraw(count)) return;

  isAnimating.value = true;
  await new Promise(resolve => setTimeout(resolve, 600));
  emit('draw', count, drawCurrency.value);
  isAnimating.value = false;
};

/** 父组件抽奖成功后调用，展示结果弹窗 */
defineExpose({
  showDrawResults: (results: DrawResult[]) => {
    drawResults.value = results;
    currentResultIndex.value = 0;
    showResult.value = true;
  },
});

const nextResult = () => {
  if (currentResultIndex.value < drawResults.value.length - 1) {
    currentResultIndex.value++;
  }
  else {
    showResult.value = false;
  }
};

const currentResult = computed(() => drawResults.value[currentResultIndex.value]);

const getRarityGlow = (rarity: string): string => {
  const map: Record<string, string> = {
    common: '0 0 20px rgba(148, 163, 184, 0.3)',
    rare: '0 0 30px rgba(59, 130, 246, 0.5)',
    epic: '0 0 40px rgba(139, 92, 246, 0.6)',
    legendary: '0 0 50px rgba(245, 158, 11, 0.8)',
  };
  return map[rarity] || map.common || '';
};

/** 展开抽奖记录时懒加载（首次展开 emit 给父组件） */
const toggleHistory = () => {
  showHistory.value = !showHistory.value;
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
    <div v-if="rpgStatus?.lotteryPityCounter != null" class="text-xs text-base-content/60 mb-2">
      保底进度 {{ rpgStatus.lotteryPityCounter }} / 90
    </div>
    <div class="flex gap-2 mb-3">
      <button
        class="btn btn-xs"
        :class="{ 'btn-primary': drawCurrency === 'ticket' }"
        @click="drawCurrency = 'ticket'"
      >
        抽奖券
      </button>
      <button
        class="btn btn-xs"
        :class="{ 'btn-primary': drawCurrency === 'currency' }"
        @click="drawCurrency = 'currency'"
      >
        钻石(10/抽)
      </button>
    </div>

    <div class="chest-area">
      <div
        class="chest"
        :class="{ shaking: isAnimating, opened: showResult }"
        @click="!showResult && !drawing && handleDraw(1)"
      >
        <div class="chest-body">
          <span class="chest-icon">{{ showResult ? '📦' : isAnimating ? '✨' : '🎁' }}</span>
          <span v-if="!showResult" class="chest-label">点击开启</span>
        </div>
      </div>

      <div class="draw-actions">
        <button
          class="draw-btn"
          :disabled="!canDraw(1) || drawing || isAnimating"
          @click="handleDraw(1)"
        >
          单抽 x1
        </button>
        <button
          class="draw-btn draw-btn-multi"
          :disabled="!canDraw(5) || drawing || isAnimating"
          @click="handleDraw(5)"
        >
          五连 x5
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showResult && currentResult" class="result-overlay" @click="nextResult">
        <div
          class="result-card"
          :style="{ '--rarity-glow': getRarityGlow(currentResult.item.rarity) }"
          @click.stop
        >
          <RpgRarityBadge
            class="result-rarity"
            :rarity="currentResult.item.rarity"
            :rarity-label="currentResult.item.rarityLabel"
            :rarity-color="currentResult.item.rarityColor"
            :rarity-icon="currentResult.item.rarityIcon"
          />
          <div class="result-name">
            {{ currentResult.item.name }}
          </div>
          <div class="result-desc">
            {{ currentResult.item.description }}
          </div>
          <div v-if="currentResult.rewardDetail" class="result-reward">
            {{ formatRewardDetail(currentResult.rewardDetail) }}
          </div>
          <div class="result-hint">
            {{
              drawResults.length > 1 && currentResultIndex < drawResults.length - 1
                ? '点击查看下一个 →'
                : '点击关闭'
            }}
          </div>
        </div>
      </div>
    </Teleport>

    <div class="pool-preview">
      <div class="pool-title">
        奖池一览
      </div>
      <div class="pool-grid">
        <div
          v-for="item in lotteryPool"
          :key="item.id"
          class="pool-item"
          :style="{ borderColor: item.rarityColor || '#ccc' }"
        >
          <RpgRarityBadge
            class="pool-rarity-badge"
            :rarity="item.rarity"
            :rarity-label="item.rarityLabel"
            :rarity-color="item.rarityColor"
            :rarity-icon="item.rarityIcon"
          />
          <span class="pool-name">{{ item.name }}</span>
        </div>
      </div>
    </div>

    <div class="history-toggle">
      <div class="history-btn" @click="toggleHistory">
        📜 抽奖记录 <span class="toggle-icon">{{ showHistory ? '▼' : '▶' }}</span>
      </div>
      <div v-if="showHistory" class="history-list">
        <div v-if="lotteryHistory.length === 0" class="history-empty">
          暂无记录
        </div>
        <div v-for="record in lotteryHistory" :key="record.id" class="history-item">
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
    width: 100px;
    height: 100px;
    border-radius: 16px;
    background: var(--rpg-amber-bg-gradient);
    border: 3px solid var(--rpg-amber);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s;
    position: relative;
  }

  .chest:hover:not(.opened) {
    transform: scale(1.05);
  }

  .chest.shaking {
    animation: shake 0.1s infinite alternate;
  }

  .chest.opened {
    opacity: 0.5;
    cursor: default;
  }

  @keyframes shake {
    from {
      transform: rotate(-3deg) scale(1.05);
    }
    to {
      transform: rotate(3deg) scale(1.05);
    }
  }

  .chest-body {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .chest-icon {
    font-size: 36px;
  }

  .chest-label {
    font-size: 10px;
    color: var(--rpg-amber-text);
    font-weight: 600;
    margin-top: 2px;
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
    transition: opacity 0.2s;
  }

  .draw-btn:disabled {
    background: var(--rpg-disabled);
    cursor: not-allowed;
  }

  .draw-btn:not(:disabled):hover {
    opacity: 0.9;
  }

  .draw-btn-multi {
    background: var(--rpg-level-badge-gradient);
  }

  .result-overlay {
    position: fixed;
    inset: 0;
    background: var(--rpg-overlay);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10050;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .result-card {
    background: var(--rpg-modal-surface, var(--rpg-surface));
    border: 1.5px solid var(--rpg-border);
    border-radius: 16px;
    padding: 32px 32px 28px;
    text-align: center;
    min-width: 280px;
    max-width: 320px;
    box-shadow:
      var(--rarity-glow, 0 0 24px rgb(148 163 184 / 0.25)),
      0 0 0 1px rgb(255 255 255 / 0.06),
      0 24px 64px rgb(0 0 0 / 0.55);
    animation: popIn 0.3s ease;
  }

  @keyframes popIn {
    from {
      transform: scale(0.7);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .result-rarity {
    margin-bottom: 14px;
  }

  .result-name {
    font-size: 20px;
    font-weight: 800;
    color: var(--rpg-text);
    margin-bottom: 6px;
  }

  .result-desc {
    font-size: 13px;
    color: var(--rpg-text-secondary);
    margin-bottom: 10px;
  }

  .result-reward {
    font-size: 14px;
    font-weight: 700;
    color: var(--rpg-success);
    margin-bottom: 12px;
  }

  .result-hint {
    font-size: 11px;
    color: var(--rpg-text-muted);
    margin-top: 4px;
  }

  .pool-preview {
    margin-bottom: 12px;
  }

  .pool-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--rpg-text-label);
    margin-bottom: 6px;
  }

  .pool-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 6px;
  }

  .pool-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 5px 8px;
    border-radius: 6px;
    border: 1.5px solid;
    background: var(--rpg-surface);
    font-size: 11px;
  }

  .pool-rarity-badge {
    flex-shrink: 0;
  }

  .pool-name {
    color: var(--rpg-text-body);
    font-weight: 500;
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
  }

  .history-empty {
    font-size: 11px;
    color: var(--rpg-text-muted);
    padding: 8px;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    border-radius: 5px;
    background: var(--rpg-surface);
    margin-bottom: 3px;
    border: 1px solid var(--rpg-border-subtle);
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
</style>
