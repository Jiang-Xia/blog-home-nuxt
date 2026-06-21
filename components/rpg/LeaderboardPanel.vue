<script setup lang="ts">
/**
   * RPG 排行榜面板 - 支持经验/签到/等级等多种维度（纯展示）
   */
import type { LeaderboardPeriod, LeaderboardScoreType } from '~~/types/rpg';

defineProps<{
  leaderboard: any[];
  loading: boolean;
}>();

const activeType = defineModel<LeaderboardScoreType>('activeType', { default: 'exp' });
const activePeriod = defineModel<LeaderboardPeriod>('activePeriod', { default: 'total' });

const { playSfx } = useRpgAudio();

/** 切换排行榜周期 Tab */
const switchPeriod = (key: LeaderboardPeriod) => {
  if (key !== activePeriod.value) void playSfx('tabSwitch');
  activePeriod.value = key;
};

/** 切换排行榜维度 Tab */
const switchType = (key: LeaderboardScoreType) => {
  if (key !== activeType.value) void playSfx('tabSwitch');
  activeType.value = key;
};

const typeOptions: { key: LeaderboardScoreType; label: string; icon: string }[] = [
  { key: 'exp', label: '经验', icon: '✨' },
  { key: 'reputation', label: '声望', icon: '🏅' },
  { key: 'currency', label: '钻石', icon: '💎' },
  { key: 'level', label: '等级', icon: '⚔️' },
  { key: 'signDays', label: '签到', icon: '📅' },
];

const periodOptions: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'total', label: '总榜' },
  { key: 'season', label: '赛季榜' },
  { key: 'week', label: '周榜' },
  { key: 'month', label: '月榜' },
];

const getScoreText = (entry: any) => {
  if (entry.score !== undefined) return String(entry.score);
  switch (activeType.value) {
    case 'exp':
      return `${entry.exp} 经验`;
    case 'reputation':
      return `${entry.reputation} 声望`;
    case 'currency':
      return `${entry.currency} 钻石`;
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
    <div class="rpg-panel-tabs">
      <button
        v-for="opt in periodOptions"
        :key="opt.key"
        class="rpg-panel-tab"
        :class="{ active: activePeriod === opt.key }"
        @click="switchPeriod(opt.key)"
      >
        {{ opt.label }}
      </button>
    </div>
    <div class="rpg-panel-tabs">
      <button
        v-for="opt in typeOptions"
        :key="opt.key"
        class="rpg-panel-tab"
        :class="{ active: activeType === opt.key }"
        @click="switchType(opt.key)"
      >
        {{ opt.icon }} {{ opt.label }}
      </button>
    </div>

    <RpgPanelLoading v-if="loading" />
    <div v-else-if="leaderboard.length === 0" class="rpg-empty-inline">
      暂无排行数据
    </div>
    <div v-else class="rank-list">
      <div
        v-for="entry in leaderboard"
        :key="entry.uid"
        class="rpg-rank-row"
        :class="{ 'rpg-rank-row--top': entry.rank <= 3 }"
      >
        <span class="rank-num" :class="`rank-${entry.rank}`">
          {{ entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank }}
        </span>
        <div class="rank-avatar">
          <img v-if="entry.avatar" :src="entry.avatar" :alt="entry.nickname">
          <span v-else class="avatar-placeholder">{{ entry.nickname?.charAt(0) || '?' }}</span>
        </div>
        <div class="rank-info">
          <NuxtLink :to="`/user/${entry.uid}`" class="rank-name link link-hover">{{
            entry.nickname
          }}</NuxtLink>
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

  .rank-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .rank-num {
    min-width: 28px;
    text-align: center;
    font-weight: 800;
    font-size: 14px;
    color: var(--rpg-text-muted);
  }

  .rank-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--rpg-track);
    flex-shrink: 0;
    border: 1px solid var(--rpg-border-subtle);
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
    color: var(--rpg-text-secondary);
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
    color: var(--rpg-text-heading);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rank-sub {
    font-size: 11px;
    color: var(--rpg-text-muted);
  }

  .rank-score {
    font-weight: 700;
    color: var(--rpg-amber-text-soft);
    font-size: 13px;
    white-space: nowrap;
  }
</style>
