<script setup lang="ts">
/**
   * RPG 排行榜面板 - 支持经验/签到/等级三种维度
   */
import type { LeaderboardType } from '~~/types/rpg';
import { useRpg } from '~~/composables/use-rpg';

const { leaderboard, fetchLeaderboard } = useRpg();

const activeType = ref<LeaderboardType>('exp');
const loading = ref(false);

const typeOptions: { key: LeaderboardType; label: string; icon: string }[] = [
  { key: 'exp', label: '经验榜', icon: '✨' },
  { key: 'signDays', label: '签到榜', icon: '📅' },
  { key: 'level', label: '等级榜', icon: '⚔️' },
];

const loadLeaderboard = async (type: LeaderboardType) => {
  activeType.value = type;
  loading.value = true;
  try {
    await fetchLeaderboard(type, 20);
  }
  finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadLeaderboard('exp');
});

const getScoreText = (entry: (typeof leaderboard.value)[0]) => {
  switch (activeType.value) {
    case 'exp':
      return `${entry.exp} EXP`;
    case 'signDays':
      return `${entry.totalSignDays} 天`;
    case 'level':
      return `LV${entry.level}`;
    default:
      return '';
  }
};
</script>

<template>
  <div class="leaderboard-panel">
    <div class="type-tabs">
      <button
        v-for="opt in typeOptions"
        :key="opt.key"
        class="type-tab"
        :class="{ active: activeType === opt.key }"
        @click="loadLeaderboard(opt.key)"
      >
        {{ opt.icon }} {{ opt.label }}
      </button>
    </div>

    <div v-if="loading" class="loading">
      加载中...
    </div>
    <div v-else-if="leaderboard.length === 0" class="empty">
      暂无排行数据
    </div>
    <div v-else class="rank-list">
      <div
        v-for="entry in leaderboard"
        :key="entry.uid"
        class="rank-item"
        :class="{ 'top-three': entry.rank <= 3 }"
      >
        <span class="rank-num" :class="`rank-${entry.rank}`">
          {{ entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank }}
        </span>
        <div class="rank-avatar">
          <img v-if="entry.avatar" :src="entry.avatar" :alt="entry.nickname">
          <span v-else class="avatar-placeholder">{{ entry.nickname?.charAt(0) || '?' }}</span>
        </div>
        <div class="rank-info">
          <span class="rank-name">{{ entry.nickname }}</span>
          <span class="rank-sub">LV{{ entry.level }}</span>
        </div>
        <span class="rank-score">{{ getScoreText(entry) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .leaderboard-panel {
    font-size: 14px;
  }

  .type-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .type-tab {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
  }

  .type-tab.active {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border-color: transparent;
  }

  .loading,
  .empty {
    text-align: center;
    color: #94a3b8;
    padding: 32px 0;
  }

  .rank-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .rank-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
  }

  .rank-item.top-three {
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    border-color: #fde68a;
  }

  .rank-num {
    min-width: 28px;
    text-align: center;
    font-weight: 800;
    font-size: 14px;
    color: #94a3b8;
  }

  .rank-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    background: #e2e8f0;
    flex-shrink: 0;
  }

  .rank-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-weight: 700;
    color: #64748b;
    font-size: 14px;
  }

  .rank-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .rank-name {
    font-weight: 600;
    color: #334155;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rank-sub {
    font-size: 11px;
    color: #94a3b8;
  }

  .rank-score {
    font-weight: 700;
    color: #d97706;
    font-size: 13px;
    white-space: nowrap;
  }
</style>
