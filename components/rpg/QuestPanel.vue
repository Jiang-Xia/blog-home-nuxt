<script setup lang="ts">
/**
   * 每日任务面板 - 展示任务进度和领取奖励
   */
import { useRpg } from '~~/composables/use-rpg';

const { quests, claimQuest } = useRpg();

// 领取中状态
const claimingCode = ref<string | null>(null);

const handleClaim = async (questCode: string) => {
  claimingCode.value = questCode;
  try {
    await claimQuest(questCode);
  }
  finally {
    claimingCode.value = null;
  }
};

// 任务图标映射
const QUEST_ICON_MAP: Record<string, string> = {
  sign_in: '📅',
  comment: '💬',
  article: '✍️',
  like: '❤️',
  collect: '🔖',
  msgboard: '📝',
};

const totalCompleted = computed(() => quests.value.filter(q => q.completed).length);
const totalClaimed = computed(() => quests.value.filter(q => q.claimed).length);
const hasUnclaimed = computed(() => quests.value.some(q => q.completed && !q.claimed));
</script>

<template>
  <div class="quest-panel">
    <!-- 顶部统计 -->
    <div class="quest-header">
      <div class="quest-summary">
        <span class="quest-label">今日任务</span>
        <span class="quest-count">{{ totalCompleted }}/{{ quests.length }} 完成</span>
      </div>
      <div v-if="hasUnclaimed" class="claim-badge">
        有奖励可领!
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="quest-list">
      <div
        v-for="quest in quests"
        :key="quest.code"
        class="quest-item"
        :class="{ completed: quest.completed, claimed: quest.claimed }"
      >
        <div class="quest-icon">
          {{ QUEST_ICON_MAP[quest.targetAction] || '📋' }}
        </div>
        <div class="quest-info">
          <div class="quest-name">
            {{ quest.name }}
          </div>
          <div class="quest-desc">
            {{ quest.description }}
          </div>
          <div class="quest-progress-bar">
            <div
              class="quest-progress-fill"
              :style="{ width: Math.min(100, (quest.progress / quest.targetCount) * 100) + '%' }"
            />
          </div>
          <div class="quest-meta">
            <span class="quest-progress-text">{{ quest.progress }}/{{ quest.targetCount }}</span>
            <span class="quest-reward">+{{ quest.expReward }} EXP</span>
          </div>
        </div>
        <div class="quest-action">
          <span v-if="quest.claimed" class="quest-claimed">✓ 已领</span>
          <button
            v-else-if="quest.completed"
            class="quest-claim-btn"
            :disabled="claimingCode === quest.code"
            @click="handleClaim(quest.code)"
          >
            {{ claimingCode === quest.code ? '...' : '领取' }}
          </button>
          <span v-else class="quest-pending">进行中</span>
        </div>
      </div>
    </div>

    <!-- 全部完成奖励提示 -->
    <div v-if="totalCompleted === quests.length && quests.length > 0" class="quest-all-done">
      🎉 今日任务已全部完成！
    </div>
  </div>
</template>

<style scoped>
  .quest-panel {
    padding: 16px;
  }

  .quest-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .quest-summary {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .quest-label {
    font-size: 14px;
    font-weight: 700;
    color: #334155;
  }

  .quest-count {
    font-size: 12px;
    color: #64748b;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .claim-badge {
    font-size: 11px;
    font-weight: 600;
    color: #d97706;
    background: #fef3c7;
    padding: 2px 8px;
    border-radius: 4px;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  .quest-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .quest-item {
    display: flex;
    gap: 10px;
    padding: 10px;
    border-radius: 10px;
    background: white;
    border: 1px solid #f1f5f9;
    transition: all 0.2s;
  }

  .quest-item.completed {
    border-color: #bbf7d0;
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  }

  .quest-item.claimed {
    opacity: 0.7;
  }

  .quest-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }

  .quest-info {
    flex: 1;
    min-width: 0;
  }

  .quest-name {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }

  .quest-desc {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 1px;
  }

  .quest-progress-bar {
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    margin-top: 4px;
    overflow: hidden;
  }

  .quest-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4ade80, #22c55e);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .quest-meta {
    display: flex;
    justify-content: space-between;
    margin-top: 2px;
    font-size: 11px;
  }

  .quest-progress-text {
    color: #64748b;
  }

  .quest-reward {
    color: #d97706;
    font-weight: 600;
  }

  .quest-action {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .quest-claim-btn {
    padding: 4px 12px;
    border-radius: 6px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    font-size: 12px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .quest-claim-btn:hover {
    opacity: 0.85;
  }

  .quest-claimed {
    font-size: 12px;
    color: #16a34a;
    font-weight: 600;
  }

  .quest-pending {
    font-size: 11px;
    color: #94a3b8;
  }

  .quest-all-done {
    margin-top: 12px;
    text-align: center;
    font-size: 13px;
    color: #16a34a;
    font-weight: 600;
    padding: 8px;
    background: #f0fdf4;
    border-radius: 8px;
  }
</style>
