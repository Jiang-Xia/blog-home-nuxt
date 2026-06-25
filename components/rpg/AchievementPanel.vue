<script setup lang="ts">
/**
   * 成就展示面板 - 分类展示用户成就进度（纯展示）
   */
import { ACHIEVEMENT_CATEGORY_MAP, ACHIEVEMENT_ICON_MAP } from '~~/types/rpg';
import type { UserAchievementProgress } from '~~/types/rpg';
import { resolveRpgItemTint } from '~~/utils/rpg-item-icon';
import {
  getRarityFallbackColor,
  isSilverRarityColor,
  shouldUseSilverRarityStyle,
} from '~~/utils/rpg-rarity';

/** 成就卡片完成态：边框随稀有度，背景走主题 CSS 变量 */
const achievementCardStyle = (ach: UserAchievementProgress) => {
  if (!ach.completed) return undefined;
  if (shouldUseSilverRarityStyle(ach)) {
    return { borderColor: 'var(--rpg-rarity-silver-border)' };
  }
  if (!ach.rarityColor) return undefined;
  return { borderColor: ach.rarityColor };
};

/** 成就图标底：银色用 CSS 渐变 class */
const achievementIconStyle = (ach: UserAchievementProgress) => {
  if (shouldUseSilverRarityStyle(ach) || isSilverRarityColor(ach.rarityColor)) return undefined;
  return { background: resolveRpgItemTint(ach) || getRarityFallbackColor() };
};

const props = defineProps<{
  achievements: UserAchievementProgress[];
}>();

const { playSfx } = useRpgAudio();

// 按分类分组
const groupedAchievements = computed(() => {
  const groups: Record<string, UserAchievementProgress[]> = {};
  for (const a of props.achievements) {
    if (!groups[a.category]) groups[a.category] = [];
    groups[a.category]!.push(a);
  }
  return groups;
});

// 统计
const totalCount = computed(() => props.achievements.length);
const completedCount = computed(() => props.achievements.filter(a => a.completed).length);
const completionPercent = computed(() =>
  totalCount.value > 0 ? Math.round((completedCount.value / totalCount.value) * 100) : 0,
);

// 当前选中的分类
const activeCategory = ref<string>('all');

/** 切换成就分类 Tab，变更时播放 tabSwitch */
const switchCategory = (key: string) => {
  if (key !== activeCategory.value) void playSfx('tabSwitch');
  activeCategory.value = key;
};

const filteredAchievements = computed(() => {
  if (activeCategory.value === 'all') return props.achievements;
  return groupedAchievements.value[activeCategory.value] || [];
});

const categories = computed(() => {
  return Object.keys(groupedAchievements.value).map(key => ({
    key,
    label: ACHIEVEMENT_CATEGORY_MAP[key] || key,
    count: groupedAchievements.value[key]?.length || 0,
    completed: groupedAchievements.value[key]?.filter(a => a.completed).length || 0,
  }));
});
</script>

<template>
  <div class="achievement-panel">
    <!-- 总览 -->
    <div class="ach-overview">
      <div class="ach-summary">
        <div class="ach-count">
          <span class="ach-num">{{ completedCount }}</span>
          <span class="ach-total">/{{ totalCount }}</span>
        </div>
        <div class="ach-label">
          已完成成就
        </div>
      </div>
      <div class="ach-progress-ring">
        <svg viewBox="0 0 36 36" class="ring-svg">
          <path
            class="ring-bg"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--rpg-track)"
            stroke-width="3"
          />
          <path
            class="ring-fill"
            :stroke-dasharray="`${completionPercent}, 100`"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--rpg-amber)"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
        <span class="ring-text">{{ completionPercent }}%</span>
      </div>
    </div>

    <div class="rpg-panel-tabs ach-tabs">
      <button
        class="rpg-panel-tab rpg-panel-tab--amber"
        :class="{ active: activeCategory === 'all' }"
        @click="switchCategory('all')"
      >
        全部
      </button>
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="rpg-panel-tab rpg-panel-tab--amber"
        :class="{ active: activeCategory === cat.key }"
        @click="switchCategory(cat.key)"
      >
        {{ cat.label }}
        <span class="tab-count">{{ cat.completed }}/{{ cat.count }}</span>
      </button>
    </div>

    <!-- 成就列表 -->
    <div class="rpg-loot-grid rpg-loot-grid--compact ach-list">
      <div
        v-for="ach in filteredAchievements"
        :key="ach.code"
        class="rpg-loot-card rpg-loot-card--achievement"
        :class="{
          'rpg-loot-card--locked': !ach.completed,
        }"
        :style="achievementCardStyle(ach)"
      >
        <div class="rpg-loot-card-head">
          <div
            class="rpg-loot-icon"
            :class="{
              'rpg-loot-icon--silver':
                shouldUseSilverRarityStyle(ach) || isSilverRarityColor(ach.rarityColor),
              'rpg-loot-icon--tinted':
                !!achievementIconStyle(ach) && !shouldUseSilverRarityStyle(ach),
            }"
            :style="achievementIconStyle(ach)"
          >
            {{ ACHIEVEMENT_ICON_MAP[ach.icon] || '🏆' }}
          </div>
          <span v-if="ach.completed" class="rpg-loot-status rpg-loot-status--done">✓ 达成</span>
        </div>
        <div class="rpg-loot-name">
          {{ ach.name }}
        </div>
        <div class="rpg-loot-desc">
          {{ ach.description }}
        </div>
        <div v-if="ach.maxProgress > 1" class="rpg-loot-progress">
          <div
            class="rpg-loot-progress__fill rpg-loot-progress__fill--exp"
            :style="{ width: Math.min(100, (ach.progress / ach.maxProgress) * 100) + '%' }"
          />
        </div>
        <div class="rpg-loot-footer">
          <div class="rpg-loot-meta">
            <RpgRarityBadge
              v-if="ach.rarityLabel"
              :rarity="ach.rarity"
              :rarity-label="ach.rarityLabel"
              :rarity-color="ach.rarityColor"
              :rarity-icon="ach.rarityIcon"
            />
            <span v-if="ach.maxProgress > 1" class="rpg-loot-progress-text">
              {{ ach.progress }}/{{ ach.maxProgress }}
            </span>
            <span v-else class="rpg-loot-status rpg-loot-status--pending">单次成就</span>
            <div v-if="ach.expReward" class="rpg-loot-rewards">
              <span class="rpg-loot-reward-chip rpg-loot-reward-chip--exp">⭐ +{{ ach.expReward }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .achievement-panel {
    padding: 0;
  }

  .ach-overview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .ach-summary {
    display: flex;
    flex-direction: column;
  }

  .ach-count {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  .ach-num {
    font-size: 24px;
    font-weight: 900;
    color: var(--rpg-amber);
  }

  .ach-total {
    font-size: 14px;
    color: var(--rpg-text-muted);
  }

  .ach-label {
    font-size: 12px;
    color: var(--rpg-text-secondary);
  }

  .ach-progress-ring {
    position: relative;
    width: 44px;
    height: 44px;
  }

  .ring-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .ring-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 10px;
    font-weight: 700;
    color: var(--rpg-amber);
  }

  .ach-tabs {
    margin-bottom: 10px;
  }

  .ach-list {
    max-height: 360px;
    overflow-y: auto;
    padding-right: 2px;
  }

  .ach-list .rpg-loot-card {
    min-height: 136px;
  }
</style>
