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
</script>

<template>
  <div class="level-rewards-panel">
    <div class="panel-title">
      🗺️ 等级奖励路线
    </div>
    <div v-if="levelRewards.length === 0" class="empty">
      加载中...
    </div>
    <div v-else class="reward-list">
      <div
        v-for="reward in levelRewards"
        :key="reward.level"
        class="reward-item"
        :class="{ unlocked: currentLevel >= reward.level }"
      >
        <div class="reward-level">
          <span class="lv-badge">LV{{ reward.level }}</span>
          <span v-if="currentLevel >= reward.level" class="unlocked-tag">已达成</span>
        </div>
        <div class="reward-content">
          <span
            v-if="reward.avatarFrame"
            class="reward-chip frame"
            :style="{ borderColor: AVATAR_FRAME_MAP[reward.avatarFrame]?.color }"
          >
            🖼 {{ AVATAR_FRAME_MAP[reward.avatarFrame]?.name || reward.avatarFrame }}
          </span>
          <span v-if="reward.title || reward.titleName" class="reward-chip title">
            🏆 {{ reward.titleName || TITLE_NAME_MAP[reward.title!] || reward.title }}
          </span>
          <span
            v-if="!reward.avatarFrame && !reward.title && !reward.titleName"
            class="reward-chip empty"
          >
            暂无奖励
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .level-rewards-panel {
    font-size: 13px;
  }

  .panel-title {
    font-weight: 700;
    color: #475569;
    margin-bottom: 12px;
  }

  .empty {
    color: #94a3b8;
    padding: 12px 0;
  }

  .reward-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .reward-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    opacity: 0.65;
    transition: opacity 0.2s;
  }

  .reward-item.unlocked {
    opacity: 1;
    background: linear-gradient(135deg, #fefce8, #fef9c3);
    border-color: #fde68a;
  }

  .reward-level {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 52px;
  }

  .lv-badge {
    font-weight: 800;
    font-size: 14px;
    color: #d97706;
  }

  .unlocked-tag {
    font-size: 10px;
    color: #16a34a;
    font-weight: 600;
  }

  .reward-content {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex: 1;
  }

  .reward-chip {
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
  }

  .reward-chip.frame {
    background: white;
    border: 2px solid;
    color: #475569;
  }

  .reward-chip.title {
    background: #fef3c7;
    color: #92400e;
  }

  .reward-chip.empty {
    color: #94a3b8;
    font-weight: 400;
  }
</style>
