<script setup lang="ts">
/**
   * 升级动画
   * unlockedRewards 已由后端 enrich（avatarFrame.name、title.name 等）
   */
import type { LevelUpResult } from '~~/types/rpg';

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
    currencyReward: r.currencyReward || 0,
    currencyName: r.currencyName || '钻石',
    frameName: r.avatarFrame?.name || null,
    titleName: r.title?.name || null,
  }));
});

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="level-up">
      <div v-if="visible && levelUpData" class="level-up-overlay" @click="handleClose">
        <div class="level-up-modal" @click.stop>
          <div class="level-up-icon" aria-hidden="true">
            <svg class="level-up-star" viewBox="0 0 64 64" fill="none">
              <path
                d="M32 6 L38.5 24.5 L58 24.5 L42.5 36.5 L48.5 55 L32 43.5 L15.5 55 L21.5 36.5 L6 24.5 L25.5 24.5 Z"
                fill="#fbbf24"
                stroke="#d97706"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="level-up-badge">
            升级！
          </div>
          <div class="level-up-numbers">
            <span class="old-level">LV{{ levelUpData.oldLevel }}</span>
            <span class="arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26">
                <path
                  d="M5 12h12M13 7l5 5-5 5"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="new-level">LV{{ levelUpData.newLevel }}</span>
          </div>
          <div v-if="rewards.length" class="level-up-rewards">
            <div class="rewards-title">
              解锁奖励
            </div>
            <div v-for="r in rewards" :key="r.level" class="reward-item">
              <span v-if="r.currencyReward" class="reward-diamond">💎 {{ r.currencyReward }} {{ r.currencyName }}</span>
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
  </Teleport>
</template>

<style scoped>
  .level-up-overlay {
    position: fixed;
    inset: 0;
    background: var(--rpg-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10080;
  }

  .level-up-modal {
    background: var(--rpg-amber-bg-gradient);
    border-radius: 20px;
    padding: 28px 48px 32px;
    text-align: center;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.3),
      0 0 40px rgba(245, 158, 11, 0.28);
    min-width: 280px;
    animation: modalGlow 2.4s ease-in-out infinite;
  }

  .level-up-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 6px;
    animation: iconBounce 0.85s ease infinite;
    filter: drop-shadow(0 4px 10px rgba(217, 119, 6, 0.3));
  }

  .level-up-star {
    width: 52px;
    height: 52px;
  }

  .level-up-badge {
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 4px;
    color: var(--rpg-amber-text);
    margin-bottom: 12px;
    animation: badgePulse 1s ease infinite;
  }

  .level-up-numbers {
    font-size: 36px;
    font-weight: 900;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .old-level {
    color: var(--rpg-text-muted);
    text-decoration: line-through;
    animation: gentleFloat 3s ease-in-out infinite;
  }

  .arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #d97706;
    margin: 0 6px;
    animation: arrowNudge 1.2s ease-in-out infinite;
  }

  .new-level {
    color: var(--rpg-amber-dark);
    animation: levelShine 1.8s ease-in-out infinite;
  }

  .level-up-rewards {
    margin-bottom: 20px;
    animation: gentleFloat 2.8s ease-in-out infinite;
  }

  .rewards-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--rpg-amber-text);
    margin-bottom: 8px;
  }

  .reward-item {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 4px;
    font-size: 14px;
    color: var(--rpg-amber-text-soft);
  }

  .close-btn {
    padding: 8px 32px;
    border-radius: 8px;
    background: var(--rpg-amber-dark);
    color: white;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition:
      background 0.2s,
      transform 0.2s;
  }

  .close-btn:hover {
    background: var(--rpg-amber-text-soft);
    transform: scale(1.03);
  }

  @keyframes badgePulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  @keyframes iconBounce {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-10px) scale(1.12);
    }
  }

  @keyframes gentleFloat {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  @keyframes arrowNudge {
    0%,
    100% {
      transform: translateX(0);
      opacity: 0.8;
    }
    50% {
      transform: translateX(5px);
      opacity: 1;
    }
  }

  @keyframes levelShine {
    0%,
    100% {
      text-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
      transform: scale(1);
    }
    50% {
      text-shadow: 0 4px 18px rgba(217, 119, 6, 0.55);
      transform: scale(1.06);
    }
  }

  @keyframes modalGlow {
    0%,
    100% {
      box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.3),
        0 0 32px rgba(245, 158, 11, 0.22);
    }
    50% {
      box-shadow:
        0 24px 64px rgba(0, 0, 0, 0.35),
        0 0 52px rgba(245, 158, 11, 0.42);
    }
  }

  .level-up-enter-active {
    animation: fadeIn 0.32s ease;
  }

  .level-up-leave-active {
    animation: fadeIn 0.22s ease reverse;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.78);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
