<script setup lang="ts">
/**
   * 排行榜 Top10 变动全屏庆祝（rankChange WS）
   * 奖牌 + 名次数字 + 彩带；音效 rankUp 在弹窗打开时播放
   */
import type { RpgRankChangePayload } from '~~/composables/use-realtime-socket';
import {
  getRankMedalEmoji,
  LEADERBOARD_PERIOD_LABEL,
  LEADERBOARD_TYPE_LABEL,
} from '~~/constants/rpg-ws-display';
import { rankToConfettiTier } from '~~/utils/rpg-rarity';

const props = defineProps<{
  visible: boolean;
  data: RpgRankChangePayload | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { playSfx } = useRpgAudio();

/** 弹窗打开时播放排行庆祝音 */
watch(
  () => props.visible,
  (v) => {
    if (v) void playSfx('rankUp');
  },
);

const medal = computed(() => getRankMedalEmoji(props.data?.rank ?? 10));
const confettiTier = computed(() => rankToConfettiTier(props.data?.rank ?? 10));

const periodLabel = computed(() => {
  const p = props.data?.period;
  return (p && LEADERBOARD_PERIOD_LABEL[p]) || p || '排行榜';
});

const typeLabel = computed(() => {
  const t = props.data?.type;
  return (t && LEADERBOARD_TYPE_LABEL[t]) || t || '';
});

const rankTheme = computed(() => {
  const rank = props.data?.rank ?? 10;
  if (rank === 1) {
    return {
      gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 40%, #fbbf24 100%)',
      accent: '#92400e',
      heading: '#78350f',
      glow: '0 0 48px rgba(245, 158, 11, 0.55)',
    };
  }
  if (rank === 2) {
    return {
      gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 45%, #cbd5e1 100%)',
      accent: '#475569',
      heading: '#334155',
      glow: '0 0 40px rgba(148, 163, 184, 0.5)',
    };
  }
  if (rank === 3) {
    return {
      gradient: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 45%, #fdba74 100%)',
      accent: '#9a3412',
      heading: '#7c2d12',
      glow: '0 0 40px rgba(251, 146, 60, 0.45)',
    };
  }
  return {
    gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 45%, #93c5fd 100%)',
    accent: '#1d4ed8',
    heading: '#1e3a8a',
    glow: '0 0 36px rgba(59, 130, 246, 0.4)',
  };
});

const modalStyle = computed(() => ({
  background: rankTheme.value.gradient,
  boxShadow: `0 20px 60px rgba(0, 0, 0, 0.35), ${rankTheme.value.glow}`,
}));

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="rank-change">
      <div v-if="visible && data" class="rank-overlay" @click="handleClose">
        <RpgLotteryConfetti :active="visible" :rarity="confettiTier" density="high" />

        <div class="rank-modal" :style="modalStyle" @click.stop>
          <div class="rank-badge" :style="{ color: rankTheme.accent }">
            荣登 Top10
          </div>
          <div class="medal-wrap">
            <span class="medal-emoji">{{ medal }}</span>
            <span class="rank-number" :style="{ color: rankTheme.heading }">
              {{ data.rank }}
            </span>
          </div>
          <div class="rank-title" :style="{ color: rankTheme.heading }">
            {{ periodLabel }}<span v-if="typeLabel"> · {{ typeLabel }}</span>
          </div>
          <div v-if="data.score != null" class="rank-score" :style="{ color: rankTheme.accent }">
            积分 {{ data.score }}
          </div>
          <button
            type="button"
            class="close-btn"
            :style="{ background: rankTheme.heading, color: '#fefce8' }"
            @click="handleClose"
          >
            继续保持！
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .rank-overlay {
    position: fixed;
    inset: 0;
    z-index: 10080;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--rpg-overlay, rgb(0 0 0 / 0.72));
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    overflow: hidden;
    cursor: pointer;
  }

  .rank-modal {
    position: relative;
    z-index: 3;
    border-radius: 20px;
    padding: 28px 36px 24px;
    text-align: center;
    min-width: 280px;
    max-width: 380px;
    animation: modalPop 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .rank-badge {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.12em;
    margin-bottom: 12px;
    animation: badgePulse 1.2s ease infinite;
  }

  .medal-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .medal-emoji {
    font-size: 64px;
    line-height: 1;
    animation: medalBounce 0.9s ease infinite;
    filter: drop-shadow(0 6px 12px rgb(0 0 0 / 0.2));
  }

  .rank-number {
    position: absolute;
    bottom: 4px;
    right: -8px;
    font-size: 28px;
    font-weight: 900;
    line-height: 1;
    text-shadow: 0 2px 4px rgb(255 255 255 / 0.6);
  }

  .rank-title {
    font-size: 18px;
    font-weight: 800;
    margin-bottom: 8px;
    line-height: 1.35;
  }

  .rank-score {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
    opacity: 0.9;
  }

  .close-btn {
    padding: 10px 28px;
    border: none;
    border-radius: 999px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition:
      opacity 0.2s,
      transform 0.2s;
  }

  .close-btn:hover {
    opacity: 0.92;
    transform: scale(1.03);
  }

  @keyframes modalPop {
    from {
      opacity: 0;
      transform: scale(0.78);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes badgePulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.06);
    }
  }

  @keyframes medalBounce {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-8px) scale(1.06);
    }
  }

  .rank-change-enter-active {
    animation: overlayIn 0.28s ease;
  }

  .rank-change-leave-active {
    animation: overlayIn 0.2s ease reverse;
  }

  @keyframes overlayIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
