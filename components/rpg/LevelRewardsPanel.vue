<script setup lang="ts">
/**
   * 等级奖励路线图
   * 直接使用 API 返回的 avatarFrame/title/currencyName，不做本地物品 map
   */
import type { LevelReward, RpgStatus } from '~~/types/rpg';

const props = defineProps<{
  rpgStatus: RpgStatus | null;
  levelRewards: LevelReward[];
  loading?: boolean;
}>();

const currentLevel = computed(() => props.rpgStatus?.level ?? 0);

const unlockedCount = computed(
  () => props.levelRewards.filter(r => currentLevel.value >= r.level).length,
);

const unlockPercent = computed(() =>
  props.levelRewards.length > 0
    ? Math.round((unlockedCount.value / props.levelRewards.length) * 100)
    : 0,
);

const isUnlocked = (level: number) => currentLevel.value >= level;

const getRewardSummary = (reward: LevelReward) => {
  const parts: string[] = [];
  if (reward.currencyReward) {
    parts.push(`${reward.currencyReward} ${reward.currencyName || '钻石'}`);
  }
  if (reward.avatarFrame?.name) {
    parts.push(reward.avatarFrame.name);
  }
  if (reward.title?.name) {
    parts.push(reward.title.name);
  }
  return parts.filter(Boolean).join(' · ') || '暂无奖励';
};

const hasAnyReward = (reward: LevelReward) =>
  !!(reward.currencyReward || reward.avatarFrame?.name || reward.title?.name);
</script>

<template>
  <div class="level-rewards-panel">
    <div class="panel-header">
      <div class="panel-summary">
        <div class="summary-count">
          <span class="summary-num">{{ unlockedCount }}</span>
          <span class="summary-total">/{{ levelRewards.length }}</span>
        </div>
        <div class="summary-label">
          已解锁等级奖励
        </div>
      </div>
      <div class="summary-ring">
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
            :stroke-dasharray="`${unlockPercent}, 100`"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--rpg-amber)"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
        <span class="ring-text">{{ unlockPercent }}%</span>
      </div>
    </div>

    <div v-if="loading" class="empty">
      加载中...
    </div>
    <div v-else-if="levelRewards.length === 0" class="empty">
      暂无等级奖励配置
    </div>
    <div v-else class="reward-grid">
      <div
        v-for="reward in levelRewards"
        :key="reward.level"
        class="reward-card"
        :class="{ unlocked: isUnlocked(reward.level) }"
      >
        <div class="reward-card-head">
          <span class="lv-badge">LV{{ reward.level }}</span>
          <span v-if="isUnlocked(reward.level)" class="unlocked-tag">✓</span>
          <span v-else class="locked-tag">🔒</span>
        </div>

        <div class="reward-summary">
          {{ getRewardSummary(reward) }}
        </div>

        <div class="reward-tags">
          <span v-if="reward.currencyReward" class="reward-tag diamond">
            💎 {{ reward.currencyReward }} {{ reward.currencyName || '钻石' }}
          </span>
          <span
            v-if="reward.avatarFrame?.name"
            class="reward-tag frame"
            :style="{ borderColor: reward.avatarFrame.color || '#ccc' }"
          >
            🖼 {{ reward.avatarFrame.name }}
          </span>
          <span v-if="reward.title?.name" class="reward-tag title">
            🏆 {{ reward.title.name }}
          </span>
          <span v-if="!hasAnyReward(reward)" class="reward-tag empty"> 暂无奖励 </span>
        </div>

        <div class="reward-footer">
          <span v-if="isUnlocked(reward.level)" class="footer-status done">已达成</span>
          <span v-else class="footer-status pending">还需 {{ reward.level - currentLevel }} 级</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .level-rewards-panel {
    font-size: 13px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .panel-summary {
    display: flex;
    flex-direction: column;
  }

  .summary-count {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  .summary-num {
    font-size: 24px;
    font-weight: 900;
    color: var(--rpg-amber);
  }

  .summary-total {
    font-size: 14px;
    color: var(--rpg-text-muted);
  }

  .summary-label {
    font-size: 12px;
    color: var(--rpg-text-secondary);
  }

  .summary-ring {
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

  .empty {
    color: var(--rpg-text-muted);
    padding: 12px;
    text-align: center;
    background: var(--rpg-empty-bg);
    border-radius: 8px;
    border: 1px dashed var(--rpg-empty-border);
  }

  .reward-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
    gap: 10px;
  }

  .reward-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    border-radius: 10px;
    background: var(--rpg-surface);
    border: 1px solid var(--rpg-border-subtle);
    opacity: 0.72;
    transition: all 0.2s;
    min-height: 132px;
  }

  .reward-card.unlocked {
    opacity: 1;
    border-color: var(--rpg-amber-border);
    background: var(--rpg-amber-bg-gradient);
  }

  .reward-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .lv-badge {
    font-weight: 800;
    font-size: 13px;
    color: var(--rpg-amber-dark);
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--rpg-amber-bg-faint);
  }

  .unlocked-tag {
    color: var(--rpg-success);
    font-weight: 900;
    font-size: 12px;
  }

  .locked-tag {
    font-size: 11px;
    opacity: 0.6;
  }

  .reward-summary {
    font-size: 11px;
    font-weight: 600;
    color: var(--rpg-text-label);
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .reward-tags {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .reward-tag {
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .reward-tag.frame {
    background: var(--rpg-surface);
    border: 1.5px solid;
    color: var(--rpg-text-label);
  }

  .reward-tag.title {
    background: var(--rpg-amber-bg);
    color: var(--rpg-amber-text);
  }

  .reward-tag.diamond {
    background: var(--rpg-diamond-bg);
    color: var(--rpg-diamond-text);
  }

  .reward-tag.empty {
    color: var(--rpg-text-muted);
    font-weight: 400;
    background: var(--rpg-empty-bg);
  }

  .reward-footer {
    margin-top: auto;
    font-size: 10px;
  }

  .footer-status.done {
    color: var(--rpg-success);
    font-weight: 600;
  }

  .footer-status.pending {
    color: var(--rpg-text-muted);
  }
</style>
