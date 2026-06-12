<script setup lang="ts">
/**
   * 升级动画组件 - 等级提升时显示弹出动画和解锁奖励
   */
import type { LevelUpResult } from '~~/types/rpg';
import { getAvatarFrameName, getTitleName } from '~~/types/rpg';

const props = defineProps<{
  visible: boolean;
  levelUpData: LevelUpResult | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const rewards = computed(() => {
  if (!props.levelUpData?.unlockedRewards?.length) return [];
  return props.levelUpData.unlockedRewards.map(r => ({
    level: r.level,
    frameName: r.avatarFrame ? getAvatarFrameName(r.avatarFrame) : null,
    titleName: r.title ? r.titleName || getTitleName(r.title) : null,
  }));
});

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Transition name="level-up">
    <div v-if="visible && levelUpData" class="level-up-overlay" @click="handleClose">
      <div class="level-up-modal" @click.stop>
        <div class="level-up-badge">
          升级！
        </div>
        <div class="level-up-numbers">
          <span class="old-level">LV{{ levelUpData.oldLevel }}</span>
          <span class="arrow">→</span>
          <span class="new-level">LV{{ levelUpData.newLevel }}</span>
        </div>
        <div v-if="rewards.length" class="level-up-rewards">
          <div class="rewards-title">
            解锁奖励
          </div>
          <div v-for="r in rewards" :key="r.level" class="reward-item">
            <span v-if="r.frameName" class="reward-frame">🖼 {{ r.frameName }}</span>
            <span v-if="r.titleName" class="reward-title">🏆 {{ r.titleName }}</span>
          </div>
        </div>
        <button class="close-btn" @click="handleClose">
          确定
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  .level-up-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .level-up-modal {
    background: linear-gradient(135deg, #fef9c3, #fde68a);
    border-radius: 20px;
    padding: 32px 48px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    min-width: 280px;
  }

  .level-up-badge {
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 4px;
    color: #92400e;
    margin-bottom: 12px;
    animation: pulse 1s infinite;
  }

  .level-up-numbers {
    font-size: 36px;
    font-weight: 900;
    margin-bottom: 20px;
  }

  .old-level {
    color: #9ca3af;
    text-decoration: line-through;
  }

  .arrow {
    color: #d97706;
    margin: 0 12px;
  }

  .new-level {
    color: #d97706;
    text-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
  }

  .level-up-rewards {
    margin-bottom: 20px;
  }

  .rewards-title {
    font-size: 14px;
    font-weight: 600;
    color: #92400e;
    margin-bottom: 8px;
  }

  .reward-item {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 4px;
    font-size: 14px;
    color: #78350f;
  }

  .close-btn {
    padding: 8px 32px;
    border-radius: 8px;
    background: #d97706;
    color: white;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: #b45309;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .level-up-enter-active {
    animation: fadeIn 0.3s ease;
  }

  .level-up-leave-active {
    animation: fadeIn 0.2s ease reverse;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
