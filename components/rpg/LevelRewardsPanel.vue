<script setup lang="ts">
/**
   * 等级奖励路线图 - 展示各等级解锁的头像框与称号
   */
import { AVATAR_FRAME_MAP, TITLE_NAME_MAP } from '~~/types/rpg';
import { useRpg } from '~~/composables/use-rpg';

const { rpgStatus, levelRewards, fetchLevelRewards } = useRpg();

onMounted(() => {
  fetchLevelRewards();
});

const currentLevel = computed(() => rpgStatus.value?.level ?? 0);

const unlockedCount = computed(
  () => levelRewards.value.filter(r => currentLevel.value >= r.level).length,
);

const unlockPercent = computed(() =>
  levelRewards.value.length > 0
    ? Math.round((unlockedCount.value / levelRewards.value.length) * 100)
    : 0,
);

const isUnlocked = (level: number) => currentLevel.value >= level;

const getRewardSummary = (reward: (typeof levelRewards.value)[number]) => {
  const parts: string[] = [];
  if (reward.avatarFrame) {
    parts.push(AVATAR_FRAME_MAP[reward.avatarFrame]?.name || reward.avatarFrame);
  }
  if (reward.title || reward.titleName) {
    parts.push(reward.titleName || TITLE_NAME_MAP[reward.title!] || reward.title || '');
  }
  return parts.filter(Boolean).join(' · ') || '暂无奖励';
};
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
            stroke="#e2e8f0"
            stroke-width="3"
          />
          <path
            class="ring-fill"
            :stroke-dasharray="`${unlockPercent}, 100`"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#f59e0b"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
        <span class="ring-text">{{ unlockPercent }}%</span>
      </div>
    </div>

    <div v-if="levelRewards.length === 0" class="empty">
      加载中...
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
          <span
            v-if="reward.avatarFrame"
            class="reward-tag frame"
            :style="{ borderColor: AVATAR_FRAME_MAP[reward.avatarFrame]?.color }"
          >
            🖼 {{ AVATAR_FRAME_MAP[reward.avatarFrame]?.name || reward.avatarFrame }}
          </span>
          <span v-if="reward.title || reward.titleName" class="reward-tag title">
            🏆 {{ reward.titleName || TITLE_NAME_MAP[reward.title!] || reward.title }}
          </span>
          <span
            v-if="!reward.avatarFrame && !reward.title && !reward.titleName"
            class="reward-tag empty"
          >
            暂无奖励
          </span>
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
    color: #f59e0b;
  }

  .summary-total {
    font-size: 14px;
    color: #94a3b8;
  }

  .summary-label {
    font-size: 12px;
    color: #64748b;
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
    color: #f59e0b;
  }

  .empty {
    color: #94a3b8;
    padding: 12px;
    text-align: center;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px dashed #e2e8f0;
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
    background: white;
    border: 1px solid #f1f5f9;
    opacity: 0.72;
    transition: all 0.2s;
    min-height: 132px;
  }

  .reward-card.unlocked {
    opacity: 1;
    border-color: #fde68a;
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
  }

  .reward-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .lv-badge {
    font-weight: 800;
    font-size: 13px;
    color: #d97706;
    padding: 2px 8px;
    border-radius: 6px;
    background: rgba(251, 191, 36, 0.15);
  }

  .unlocked-tag {
    color: #16a34a;
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
    color: #475569;
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
    background: white;
    border: 1.5px solid;
    color: #475569;
  }

  .reward-tag.title {
    background: #fef3c7;
    color: #92400e;
  }

  .reward-tag.empty {
    color: #94a3b8;
    font-weight: 400;
    background: #f8fafc;
  }

  .reward-footer {
    margin-top: auto;
    font-size: 10px;
  }

  .footer-status.done {
    color: #16a34a;
    font-weight: 600;
  }

  .footer-status.pending {
    color: #94a3b8;
  }
</style>
