<script setup lang="ts">
/**
   * 等级奖励路线图
   * 直接使用 API 返回的 avatarFrame/title/currencyName，不做本地物品 map
   */
import type { LevelReward, RpgStatus } from '~~/types/rpg';
import { resolveRpgItemEmoji } from '~~/utils/rpg-item-icon';

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

    <RpgPanelLoading v-if="loading" compact />
    <div v-else-if="levelRewards.length === 0" class="empty">
      暂无等级奖励配置
    </div>
    <div v-else class="rpg-loot-grid rpg-loot-grid--compact reward-grid">
      <div
        v-for="reward in levelRewards"
        :key="reward.level"
        class="rpg-loot-card rpg-loot-card--reward"
        :class="{
          'rpg-loot-card--gold': isUnlocked(reward.level),
          'rpg-loot-card--locked': !isUnlocked(reward.level),
        }"
      >
        <div class="rpg-loot-card-head">
          <span class="lv-badge">LV{{ reward.level }}</span>
          <span v-if="isUnlocked(reward.level)" class="rpg-loot-status rpg-loot-status--done">✓ 已达成</span>
          <span v-else class="rpg-loot-status rpg-loot-status--locked">🔒 未解锁</span>
        </div>

        <div class="rpg-loot-name">
          等级 {{ reward.level }} 奖励
        </div>

        <div class="reward-tags">
          <span
            v-if="reward.currencyReward"
            class="rpg-loot-reward-chip rpg-loot-reward-chip--diamond"
          >
            💎 {{ reward.currencyReward }} {{ reward.currencyName || '钻石' }}
          </span>
          <span
            v-if="reward.avatarFrame?.name"
            class="reward-tag frame"
            :style="{ borderColor: reward.avatarFrame.color || '#ccc' }"
          >
            {{ resolveRpgItemEmoji(reward.avatarFrame) }} {{ reward.avatarFrame.name }}
          </span>
          <span v-if="reward.title?.name" class="rpg-loot-reward-chip rpg-loot-reward-chip--exp">
            {{ resolveRpgItemEmoji(reward.title) }} {{ reward.title.name }}
          </span>
          <span v-if="!hasAnyReward(reward)" class="rpg-loot-status rpg-loot-status--pending">暂无奖励</span>
        </div>

        <div class="rpg-loot-footer">
          <div class="rpg-loot-meta">
            <span v-if="isUnlocked(reward.level)" class="rpg-loot-status rpg-loot-status--done">奖励已解锁</span>
            <span v-else class="rpg-loot-status rpg-loot-status--pending">
              还需 {{ reward.level - currentLevel }} 级
            </span>
          </div>
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

  .reward-grid .rpg-loot-card {
    min-height: 140px;
  }

  .lv-badge {
    font-weight: 800;
    font-size: 13px;
    color: var(--rpg-amber-dark);
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--rpg-amber-bg-faint);
    border: 1px solid var(--rpg-amber-border);
  }

  .reward-tags {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .reward-tag.frame {
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    background: var(--rpg-surface);
    border: 1.5px solid;
    color: var(--rpg-text-label);
  }
</style>
