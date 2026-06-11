<script setup lang="ts">
/**
   * 成就展示面板 - 分类展示用户成就进度
   */
import { ACHIEVEMENT_CATEGORY_MAP, ACHIEVEMENT_ICON_MAP } from '~~/types/rpg';
import type { UserAchievementProgress } from '~~/types/rpg';
import { useRpg } from '~~/composables/use-rpg';

const { achievements } = useRpg();

// 按分类分组
const groupedAchievements = computed(() => {
  const groups: Record<string, UserAchievementProgress[]> = {};
  for (const a of achievements.value) {
    if (!groups[a.category]) groups[a.category] = [];
    groups[a.category]!.push(a);
  }
  return groups;
});

// 统计
const totalCount = computed(() => achievements.value.length);
const completedCount = computed(() => achievements.value.filter(a => a.completed).length);
const completionPercent = computed(() =>
  totalCount.value > 0 ? Math.round((completedCount.value / totalCount.value) * 100) : 0,
);

// 当前选中的分类
const activeCategory = ref<string>('all');

const filteredAchievements = computed(() => {
  if (activeCategory.value === 'all') return achievements.value;
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
            stroke="#e2e8f0"
            stroke-width="3"
          />
          <path
            class="ring-fill"
            :stroke-dasharray="`${completionPercent}, 100`"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#f59e0b"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
        <span class="ring-text">{{ completionPercent }}%</span>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="ach-tabs">
      <button
        class="ach-tab"
        :class="{ active: activeCategory === 'all' }"
        @click="activeCategory = 'all'"
      >
        全部
      </button>
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="ach-tab"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }}
        <span class="tab-count">{{ cat.completed }}/{{ cat.count }}</span>
      </button>
    </div>

    <!-- 成就列表 -->
    <div class="ach-list">
      <div
        v-for="ach in filteredAchievements"
        :key="ach.code"
        class="ach-card"
        :class="{ completed: ach.completed }"
      >
        <div class="ach-card-head">
          <div class="ach-icon" :style="{ background: ach.badge?.color || '#94a3b8' }">
            {{ ACHIEVEMENT_ICON_MAP[ach.icon] || '🏆' }}
          </div>
          <span v-if="ach.completed" class="ach-done">✓</span>
        </div>
        <div class="ach-name">
          {{ ach.name }}
        </div>
        <div class="ach-desc">
          {{ ach.description }}
        </div>
        <div v-if="ach.maxProgress > 1" class="ach-progress-bar">
          <div
            class="ach-progress-fill"
            :style="{ width: Math.min(100, (ach.progress / ach.maxProgress) * 100) + '%' }"
          />
        </div>
        <div class="ach-meta">
          <span v-if="ach.maxProgress > 1" class="ach-progress-text">
            {{ ach.progress }}/{{ ach.maxProgress }}
          </span>
          <span v-if="ach.expReward" class="ach-exp">+{{ ach.expReward }} EXP</span>
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
    color: #f59e0b;
  }

  .ach-total {
    font-size: 14px;
    color: #94a3b8;
  }

  .ach-label {
    font-size: 12px;
    color: #64748b;
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
    color: #f59e0b;
  }

  .ach-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .ach-tab {
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background: white;
    font-size: 12px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
  }

  .ach-tab.active {
    background: #fef3c7;
    border-color: #fbbf24;
    color: #92400e;
    font-weight: 600;
  }

  .tab-count {
    margin-left: 4px;
    opacity: 0.7;
    font-size: 11px;
  }

  .ach-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
    gap: 10px;
    max-height: 360px;
    overflow-y: auto;
    padding-right: 2px;
  }

  .ach-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    border-radius: 10px;
    background: white;
    border: 1px solid #f1f5f9;
    opacity: 0.72;
    transition: all 0.2s;
    min-height: 132px;
  }

  .ach-card.completed {
    opacity: 1;
    border-color: #fde68a;
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
  }

  .ach-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ach-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    color: white;
  }

  .ach-name {
    font-size: 12px;
    font-weight: 700;
    color: #334155;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .ach-done {
    color: #16a34a;
    font-weight: 900;
    font-size: 12px;
  }

  .ach-desc {
    font-size: 10px;
    color: #94a3b8;
    line-height: 1.35;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .ach-progress-bar {
    height: 3px;
    background: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
  }

  .ach-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .ach-meta {
    display: flex;
    justify-content: space-between;
    gap: 4px;
    font-size: 10px;
    margin-top: auto;
  }

  .ach-progress-text {
    color: #64748b;
  }

  .ach-exp {
    color: #d97706;
    font-weight: 600;
  }
</style>
