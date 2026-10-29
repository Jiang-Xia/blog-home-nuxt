<script setup lang="ts">
/**
   * 任务面板 - 每日 / 悬赏 / 周常 / 特殊任务（纯展示）
   * 数据来源：GET /rpg/my-quests 返回 daily/bounty/weekly/special 四组
   */
import type { UserQuestProgress } from '~~/types/rpg';

const props = defineProps<{
  questGroups: {
    daily: UserQuestProgress[];
    bounty: UserQuestProgress[];
    weekly: UserQuestProgress[];
    special: UserQuestProgress[];
  };
}>();

const emit = defineEmits<{
  claim: [questCode: string];
}>();

const { playSfx } = useRpgAudio();

type QuestTab = 'daily' | 'bounty' | 'weekly' | 'special';
const activeTab = ref<QuestTab>('daily');

const tabOptions: { key: QuestTab; label: string }[] = [
  { key: 'daily', label: '每日' },
  { key: 'bounty', label: '悬赏' },
  { key: 'weekly', label: '周常' },
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
  sign_in: 'calendar',
  comment: 'chat',
  article: 'pen',
  like: 'heart',
  collect: 'bookmark',
  msgboard: 'chat-star',
  tip: 'gem',
  reply: 'reply',
  lottery_draw: 'slot',
  social_cheer: 'hands',
  social_flower: 'flower',
  social_egg: 'egg',
  guild_join: 'shield',
  pet_hatch: 'paws',
};

const totalCompleted = computed(() => currentQuests.value.filter(q => q.completed).length);
const hasUnclaimed = computed(() => currentQuests.value.some(q => q.completed && !q.claimed));

/** 每日圆环进度（美术改版 v2） */
const progressPercent = computed(() =>
  currentQuests.value.length > 0
    ? Math.round((totalCompleted.value / currentQuests.value.length) * 100)
    : 0,
);

/** 默认折叠已领取任务，优先展示可领与进行中 */
const showCompleted = ref(false);

const questRank = (q: UserQuestProgress) => {
  if (q.completed && !q.claimed) return 0;
  if (!q.completed) return 1;
  return 2;
};

const sortedQuests = computed(() => {
  const quests = [...currentQuests.value].sort((a, b) => questRank(a) - questRank(b));
  if (showCompleted.value) return quests;
  return quests.filter(q => !q.claimed);
});

const hiddenCompletedCount = computed(() => currentQuests.value.filter(q => q.claimed).length);
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
        <span
          class="daily-ring"
          :style="{
            background: `conic-gradient(var(--rpg-daily-ring-fill, var(--rpg-art-violet, #7c5cf0)) 0 ${progressPercent}%, var(--rpg-daily-ring-track, var(--rpg-track, #efeaf9)) ${progressPercent}% 100%)`,
          }"
        >
          <i class="daily-ring__num">{{ totalCompleted }}/{{ currentQuests.length }}</i>
        </span>
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
        v-for="quest in sortedQuests"
        :key="quest.code"
        class="rpg-loot-card rpg-loot-card--quest rpg-loot-card--wall"
        :class="{
          'rpg-loot-card--done': quest.completed,
          'rpg-loot-card--claimed': quest.claimed,
          'rpg-loot-card--claimable': quest.completed && !quest.claimed,
          'rpg-loot-card--locked': !quest.completed && quest.progress === 0,
        }"
      >
        <div class="rpg-loot-card-head">
          <div class="rpg-loot-icon">
            <img
              v-if="QUEST_ICON_MAP[quest.targetAction]"
              class="quest-art"
              :src="`/rpg/icons/${QUEST_ICON_MAP[quest.targetAction]}.png`"
              alt=""
              loading="lazy"
            >
            <img
              v-else class="quest-art" src="/rpg/icons/scroll.png"
              alt=""
              loading="lazy"
            >
          </div>
          <span
            v-if="quest.claimed"
            class="rpg-loot-status rpg-loot-status--done rpg-loot-status--corner"
          >✓ 已领</span>
          <span
            v-else-if="quest.progress > 0"
            class="rpg-loot-status rpg-loot-status--pending rpg-loot-status--corner"
          >进行中</span>
        </div>
        <div class="rpg-loot-name">
          {{ quest.name }}
        </div>
        <div class="rpg-loot-progress">
          <div
            class="rpg-loot-progress__fill"
            :style="{ width: Math.min(100, (quest.progress / quest.targetCount) * 100) + '%' }"
          />
        </div>
        <div class="rpg-loot-desc">
          {{ quest.progress }}/{{ quest.targetCount }} · +{{ quest.expReward }} EXP
        </div>
        <div v-if="quest.completed && !quest.claimed" class="rpg-loot-action">
          <button
            class="rpg-loot-claim-btn"
            :disabled="claimingCode === quest.code"
            @click="handleClaim(quest.code)"
          >
            {{ claimingCode === quest.code ? '...' : '领取奖励' }}
          </button>
        </div>
      </div>
    </div>

    <button
      v-if="hiddenCompletedCount > 0"
      type="button"
      class="quest-expand-btn"
      @click="showCompleted = !showCompleted"
    >
      {{ showCompleted ? '收起已领取' : `展开已领取 (${hiddenCompletedCount})` }}
    </button>

    <div
      v-if="
        totalCompleted === currentQuests.length && currentQuests.length > 0 && activeTab === 'daily'
      "
      class="quest-all-done"
    >
      <img class="quest-all-done-art" src="/rpg/icons/sparkle.png" alt="" loading="lazy">
      今日任务已全部完成！
    </div>
  </div>
</template>

<style scoped>
  .quest-art {
    width: 90%;
    height: 90%;
    object-fit: contain;
    pointer-events: none;
  }

  .quest-all-done-art {
    width: 16px;
    height: 16px;
    object-fit: contain;
    vertical-align: -3px;
    margin-right: 3px;
  }

  /* 任务进度条 → 紫罗兰渐变（美术改版 v2） */
  .quest-list .rpg-loot-progress__fill {
    background: var(--rpg-art-violet-grad, linear-gradient(90deg, #7c5cf0, #a78bfa));
  }

  /* v6/A2 墙卡：单行进度说明 */
  .quest-list .rpg-loot-desc {
    font-size: 10.5px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.6));
    margin-top: -2px;
  }

  /* 每日圆环（cyber 下走 --rpg-daily-ring-*，避免暗底看不清） */
  .daily-ring {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 0 1px var(--rpg-border-subtle, rgb(255 255 255 / 0.1));
  }

  .daily-ring__num {
    width: 31px;
    height: 31px;
    border-radius: 50%;
    background: var(--rpg-daily-ring-center, var(--rpg-surface, #fff));
    display: grid;
    place-items: center;
    font-style: normal;
    font-size: 10.5px;
    font-weight: 800;
    color: var(--rpg-daily-ring-text, var(--rpg-art-violet, #7c5cf0));
  }

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

  /* v6：任务墙对齐原型 wall-grid —— 桌面 3 列/移动 2 列的紧凑竖卡，高度随内容 */
  .quest-list {
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  }

  .quest-list .rpg-loot-card {
    min-height: 0;
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

  .quest-expand-btn {
    display: block;
    width: 100%;
    margin-top: 8px;
    padding: 6px 10px;
    border: 1px dashed var(--rpg-border-subtle);
    border-radius: 8px;
    background: transparent;
    font-size: 11px;
    font-weight: 600;
    color: var(--rpg-text-secondary);
    cursor: pointer;
    transition:
      color 0.15s ease,
      border-color 0.15s ease,
      background 0.15s ease;
  }

  .quest-expand-btn:hover {
    color: var(--rpg-text-body);
    border-color: var(--rpg-border);
    background: var(--rpg-stat-hover);
  }
</style>
