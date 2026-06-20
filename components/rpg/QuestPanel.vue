<script setup lang="ts">
/**
   * 任务面板 - 每日 / 悬赏 / 特殊任务（纯展示）
   */
import type { UserQuestProgress } from '~~/types/rpg';

const props = defineProps<{
  questGroups: {
    daily: UserQuestProgress[];
    bounty: UserQuestProgress[];
    special: UserQuestProgress[];
  };
}>();

const emit = defineEmits<{
  claim: [questCode: string];
}>();

const { playSfx } = useRpgAudio();

type QuestTab = 'daily' | 'bounty' | 'special';
const activeTab = ref<QuestTab>('daily');

const tabOptions: { key: QuestTab; label: string }[] = [
  { key: 'daily', label: '每日' },
  { key: 'bounty', label: '悬赏' },
  { key: 'special', label: '特殊' },
];

const currentQuests = computed(() => props.questGroups[activeTab.value] || []);

const claimingCode = ref<string | null>(null);

const handleClaim = async (questCode: string) => {
  claimingCode.value = questCode;
  try {
    emit('claim', questCode);
  }
  finally {
    claimingCode.value = null;
  }
};

/** 切换任务子 Tab（日常 / 悬赏 / 特殊） */
const switchQuestTab = (key: QuestTab) => {
  if (key !== activeTab.value) void playSfx('tabSwitch');
  activeTab.value = key;
};

const QUEST_ICON_MAP: Record<string, string> = {
  sign_in: '📅',
  comment: '💬',
  article: '✍️',
  like: '❤️',
  collect: '🔖',
  msgboard: '📝',
  tip: '💎',
};

const totalCompleted = computed(() => currentQuests.value.filter(q => q.completed).length);
const hasUnclaimed = computed(() => currentQuests.value.some(q => q.completed && !q.claimed));
</script>

<template>
  <div class="quest-panel">
    <div class="type-tabs">
      <button
        v-for="opt in tabOptions"
        :key="opt.key"
        class="type-tab"
        :class="{ active: activeTab === opt.key }"
        @click="switchQuestTab(opt.key)"
      >
        {{ opt.label }}
      </button>
    </div>

    <div class="quest-header">
      <div class="quest-summary">
        <span class="quest-label">{{ tabOptions.find((t) => t.key === activeTab)?.label }}任务</span>
        <span class="quest-count">{{ totalCompleted }}/{{ currentQuests.length }} 完成</span>
      </div>
      <div v-if="hasUnclaimed" class="claim-badge">
        有奖励可领!
      </div>
    </div>

    <div v-if="currentQuests.length === 0" class="quest-empty">
      暂无任务
    </div>

    <div v-else class="quest-list">
      <div
        v-for="quest in currentQuests"
        :key="quest.code"
        class="quest-card"
        :class="{ completed: quest.completed, claimed: quest.claimed }"
      >
        <div class="quest-card-head">
          <div class="quest-icon">
            {{ QUEST_ICON_MAP[quest.targetAction] || '📋' }}
          </div>
          <span v-if="quest.claimed" class="quest-claimed">✓ 已领</span>
        </div>
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
        <div class="quest-card-footer">
          <div class="quest-meta">
            <span class="quest-progress-text">{{ quest.progress }}/{{ quest.targetCount }}</span>
            <span class="quest-reward">
              +{{ quest.expReward }} 经验
              <template v-if="quest.hpReward"> · 生命+{{ quest.hpReward }}</template>
            </span>
          </div>
          <div class="quest-action">
            <button
              v-if="quest.completed && !quest.claimed"
              class="quest-claim-btn"
              :disabled="claimingCode === quest.code"
              @click="handleClaim(quest.code)"
            >
              {{ claimingCode === quest.code ? '...' : '领取' }}
            </button>
            <span v-else-if="!quest.completed" class="quest-pending">进行中</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="
        totalCompleted === currentQuests.length && currentQuests.length > 0 && activeTab === 'daily'
      "
      class="quest-all-done"
    >
      🎉 今日任务已全部完成！
    </div>
  </div>
</template>

<style scoped>
  .quest-panel {
    padding: 0;
  }

  .type-tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 10px;
  }

  .type-tab {
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid var(--rpg-border);
    background: var(--rpg-surface);
    color: var(--rpg-text-secondary);
    cursor: pointer;
  }

  .type-tab.active {
    background: var(--rpg-primary);
    color: white;
    border-color: var(--rpg-primary);
  }

  .quest-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .quest-summary {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .quest-label {
    font-size: 13px;
    font-weight: 700;
    color: var(--rpg-text-heading);
  }

  .quest-count {
    font-size: 12px;
    color: var(--rpg-text-secondary);
    background: var(--rpg-bg-alt);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .claim-badge {
    font-size: 11px;
    font-weight: 600;
    color: var(--rpg-amber-dark);
    background: var(--rpg-amber-bg);
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

  .quest-empty {
    text-align: center;
    color: var(--rpg-text-muted);
    font-size: 12px;
    padding: 24px;
  }

  .quest-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(188px, 1fr));
    gap: 10px;
  }

  .quest-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    border-radius: 10px;
    background: var(--rpg-surface);
    border: 1px solid var(--rpg-border-subtle);
    transition: all 0.2s;
    min-height: 148px;
  }

  .quest-card.completed {
    border-color: var(--rpg-success-border);
    background: var(--rpg-success-gradient);
  }

  .quest-card.claimed {
    opacity: 0.72;
  }

  .quest-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .quest-icon {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: var(--rpg-bg-alt);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
  }

  .quest-name {
    font-size: 12px;
    font-weight: 700;
    color: var(--rpg-text-heading);
    line-height: 1.3;
  }

  .quest-desc {
    font-size: 10px;
    color: var(--rpg-text-muted);
    line-height: 1.35;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .quest-progress-bar {
    height: 3px;
    background: var(--rpg-track);
    border-radius: 2px;
    overflow: hidden;
  }

  .quest-progress-fill {
    height: 100%;
    background: var(--rpg-progress-green);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .quest-card-footer {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: auto;
  }

  .quest-meta {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
  }

  .quest-progress-text {
    color: var(--rpg-text-secondary);
  }

  .quest-reward {
    color: var(--rpg-amber-dark);
    font-weight: 600;
  }

  .quest-action {
    display: flex;
    justify-content: flex-end;
  }

  .quest-claim-btn {
    padding: 3px 10px;
    border-radius: 6px;
    background: var(--rpg-level-badge-gradient);
    color: white;
    font-size: 11px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .quest-claim-btn:hover {
    opacity: 0.85;
  }

  .quest-claimed {
    font-size: 11px;
    color: var(--rpg-success);
    font-weight: 600;
  }

  .quest-pending {
    font-size: 10px;
    color: var(--rpg-text-muted);
  }

  .quest-all-done {
    margin-top: 10px;
    text-align: center;
    font-size: 12px;
    color: var(--rpg-success);
    font-weight: 600;
    padding: 8px;
    background: var(--rpg-success-bg);
    border-radius: 8px;
  }
</style>
