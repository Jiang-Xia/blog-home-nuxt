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
    <div class="rpg-panel-tabs">
      <button
        v-for="opt in tabOptions"
        :key="opt.key"
        class="rpg-panel-tab"
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

    <div v-else class="rpg-loot-grid quest-list">
      <div
        v-for="quest in currentQuests"
        :key="quest.code"
        class="rpg-loot-card rpg-loot-card--quest"
        :class="{
          'rpg-loot-card--done': quest.completed,
          'rpg-loot-card--claimed': quest.claimed,
          'rpg-loot-card--claimable': quest.completed && !quest.claimed,
        }"
      >
        <div class="rpg-loot-card-head">
          <div class="rpg-loot-icon">
            {{ QUEST_ICON_MAP[quest.targetAction] || '📋' }}
          </div>
          <span v-if="quest.claimed" class="rpg-loot-status rpg-loot-status--done">✓ 已领</span>
        </div>
        <div class="rpg-loot-name">
          {{ quest.name }}
        </div>
        <div class="rpg-loot-desc">
          {{ quest.description }}
        </div>
        <div class="rpg-loot-progress">
          <div
            class="rpg-loot-progress__fill"
            :style="{ width: Math.min(100, (quest.progress / quest.targetCount) * 100) + '%' }"
          />
        </div>
        <div class="rpg-loot-footer">
          <div class="rpg-loot-meta">
            <span class="rpg-loot-progress-text">{{ quest.progress }}/{{ quest.targetCount }}</span>
            <div class="rpg-loot-rewards">
              <span class="rpg-loot-reward-chip rpg-loot-reward-chip--exp">⭐ +{{ quest.expReward }}</span>
              <span v-if="quest.hpReward" class="rpg-loot-reward-chip rpg-loot-reward-chip--hp">
                ❤ +{{ quest.hpReward }}
              </span>
            </div>
          </div>
          <div class="rpg-loot-action">
            <button
              v-if="quest.completed && !quest.claimed"
              class="rpg-loot-claim-btn"
              :disabled="claimingCode === quest.code"
              @click="handleClaim(quest.code)"
            >
              {{ claimingCode === quest.code ? '...' : '领取奖励' }}
            </button>
            <span v-else-if="!quest.completed" class="rpg-loot-status rpg-loot-status--pending">进行中</span>
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
    min-height: 148px;
  }

  .quest-list .rpg-loot-card {
    min-height: 156px;
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
