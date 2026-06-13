<script setup lang="ts">
/**
   * 抽奖宝箱组件 - 宝箱开启动画 + 奖品展示
   */
import { RARITY_MAP, formatRewardDetail } from '~~/types/rpg';
import type { DrawResult } from '~~/types/rpg';
import { lotteryDraw } from '~~/api/rpg';
import { useRpg } from '~~/composables/use-rpg';
import { formactDate } from '@/utils/common';

const {
  lotteryPool,
  lotteryTickets,
  rpgStatus,
  drawing,
  fetchLotteryPool,
  fetchLotteryTickets,
  fetchLotteryHistory,
  fetchStatus,
  lotteryHistory,
} = useRpg();

const drawCurrency = ref<'ticket' | 'currency'>('ticket');

// 抽奖结果展示
const showResult = ref(false);
const drawResults = ref<DrawResult[]>([]);
const currentResultIndex = ref(0);
const isAnimating = ref(false);
const showHistory = ref(false);

onMounted(async () => {
  await Promise.all([fetchLotteryPool(), fetchLotteryTickets(), fetchStatus()]);
});

const canDraw = (count: number) => {
  if (drawCurrency.value === 'currency') {
    return (rpgStatus.value?.currency || 0) >= count * 10;
  }
  return lotteryTickets.value >= count;
};

/** 执行抽奖 */
const handleDraw = async (count = 1) => {
  if (drawing.value || isAnimating.value) return;
  if (!canDraw(count)) return;

  isAnimating.value = true;
  await new Promise(resolve => setTimeout(resolve, 600));

  drawing.value = true;
  try {
    const results = await lotteryDraw(count, drawCurrency.value);
    drawResults.value = results;
    currentResultIndex.value = 0;
    showResult.value = true;
    await Promise.all([fetchLotteryTickets(), fetchStatus()]);
  }
  finally {
    drawing.value = false;
    isAnimating.value = false;
  }
};

/** 查看下一个结果 */
const nextResult = () => {
  if (currentResultIndex.value < drawResults.value.length - 1) {
    currentResultIndex.value++;
  }
  else {
    showResult.value = false;
  }
};

/** 当前展示的结果 */
const currentResult = computed(() => drawResults.value[currentResultIndex.value]);

/** 稀有度对应动画样式 */
const getRarityGlow = (rarity: string): string => {
  const map: Record<string, string> = {
    common: '0 0 20px rgba(148, 163, 184, 0.3)',
    rare: '0 0 30px rgba(59, 130, 246, 0.5)',
    epic: '0 0 40px rgba(139, 92, 246, 0.6)',
    legendary: '0 0 50px rgba(245, 158, 11, 0.8)',
  };
  return map[rarity] || map.common;
};

/** 切换抽奖记录 */
const toggleHistory = async () => {
  showHistory.value = !showHistory.value;
  if (showHistory.value && lotteryHistory.value.length === 0) {
    await fetchLotteryHistory();
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

    <!-- 宝箱区域 -->
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

      <!-- 批量抽奖按钮 -->
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

    <!-- 抽奖结果弹窗 -->
    <div v-if="showResult && currentResult" class="result-overlay" @click="nextResult">
      <div class="result-card" :style="{ boxShadow: getRarityGlow(currentResult.item.rarity) }">
        <div
          class="rarity-badge"
          :style="{ backgroundColor: RARITY_MAP[currentResult.item.rarity]?.color || '#ccc' }"
        >
          {{ RARITY_MAP[currentResult.item.rarity]?.icon }}
          {{ RARITY_MAP[currentResult.item.rarity]?.label }}
        </div>
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

    <!-- 奖池预览 -->
    <div class="pool-preview">
      <div class="pool-title">
        奖池一览
      </div>
      <div class="pool-grid">
        <div
          v-for="item in lotteryPool"
          :key="item.id"
          class="pool-item"
          :style="{ borderColor: RARITY_MAP[item.rarity]?.color || '#ccc' }"
        >
          <span class="pool-rarity">{{ RARITY_MAP[item.rarity]?.icon }}</span>
          <span class="pool-name">{{ item.name }}</span>
        </div>
      </div>
    </div>

    <!-- 抽奖记录 -->
    <div class="history-toggle">
      <div class="history-btn" @click="toggleHistory">
        📜 抽奖记录 <span class="toggle-icon">{{ showHistory ? '▼' : '▶' }}</span>
      </div>
      <div v-if="showHistory" class="history-list">
        <div v-if="lotteryHistory.length === 0" class="history-empty">
          暂无记录
        </div>
        <div v-for="record in lotteryHistory" :key="record.id" class="history-item">
          <span class="history-rarity" :style="{ color: RARITY_MAP[record.poolRarity]?.color }">
            {{ RARITY_MAP[record.poolRarity]?.icon }}
          </span>
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
    color: #1e293b;
  }

  .ticket-count {
    font-size: 13px;
    font-weight: 700;
    color: #7c3aed;
    background: #ede9fe;
    padding: 3px 10px;
    border-radius: 12px;
  }

  /* Chest */
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
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border: 3px solid #f59e0b;
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
    color: #92400e;
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
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .draw-btn:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }

  .draw-btn:not(:disabled):hover {
    opacity: 0.9;
  }

  .draw-btn-multi {
    background: linear-gradient(135deg, #f59e0b, #d97706);
  }

  /* Result overlay */
  .result-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
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
    background: white;
    border-radius: 16px;
    padding: 28px 32px;
    text-align: center;
    max-width: 280px;
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

  .rarity-badge {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 12px;
    color: white;
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .result-name {
    font-size: 20px;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 6px;
  }

  .result-desc {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 10px;
  }

  .result-reward {
    font-size: 14px;
    font-weight: 700;
    color: #16a34a;
    margin-bottom: 12px;
  }

  .result-hint {
    font-size: 11px;
    color: #94a3b8;
  }

  /* Pool preview */
  .pool-preview {
    margin-bottom: 12px;
  }

  .pool-title {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 6px;
  }

  .pool-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 6px;
  }

  .pool-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    border-radius: 6px;
    border: 1.5px solid;
    background: white;
    font-size: 11px;
  }

  .pool-rarity {
    font-size: 12px;
  }
  .pool-name {
    color: #374151;
    font-weight: 500;
  }

  /* History */
  .history-toggle {
    margin-top: 8px;
  }

  .history-btn {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
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
    color: #94a3b8;
    padding: 8px;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    border-radius: 5px;
    background: white;
    margin-bottom: 3px;
    border: 1px solid #f1f5f9;
  }

  .history-rarity {
    font-size: 12px;
  }
  .history-name {
    font-size: 12px;
    color: #374151;
    font-weight: 500;
    flex: 1;
  }
  .history-time {
    font-size: 10px;
    color: #94a3b8;
  }
</style>
