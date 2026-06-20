<script setup lang="ts">
/**
   * 禁言处罚全屏警示（banStatus WS，仅 banned === true）
   * 惩罚向反馈：暗红遮罩 + 禁言说明；音效 banPunish
   */
import type { RpgBanStatusPayload } from '~~/composables/use-realtime-socket';
import dayjs from 'dayjs';

const props = defineProps<{
  visible: boolean;
  data: RpgBanStatusPayload | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { playSfx } = useRpgAudio();

/** 弹窗打开时播放惩罚警示音 */
watch(
  () => props.visible,
  (v) => {
    if (v && props.data?.banned) void playSfx('banPunish');
  },
);

const banEndText = computed(() => {
  if (!props.data?.banEndTime) return '';
  return dayjs(props.data.banEndTime).format('YYYY-MM-DD HH:mm');
});

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="ban-punish">
      <div v-if="visible && data?.banned" class="ban-punish-overlay" @click="handleClose">
        <div class="ban-bars" aria-hidden="true">
          <span v-for="i in 7" :key="i" class="bar" :style="{ animationDelay: `${i * 0.06}s` }" />
        </div>
        <div class="ban-vignette" aria-hidden="true" />

        <div class="ban-modal" @click.stop>
          <div class="ban-stamp">
            处罚
          </div>
          <div class="ban-icon">
            🔇
          </div>
          <h2 class="ban-title">
            您已被禁言
          </h2>
          <p v-if="data.banReason" class="ban-reason">
            原因：{{ data.banReason }}
          </p>
          <p v-if="banEndText" class="ban-end">
            预计解封：{{ banEndText }}
          </p>
          <p class="ban-tip">
            禁言期间无法签到、评论、留言和回复
          </p>
          <button type="button" class="ban-confirm" @click="handleClose">
            我知道了
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .ban-punish-overlay {
    position: fixed;
    inset: 0;
    z-index: 10085;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 0.78);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    overflow: hidden;
    cursor: pointer;
  }

  .ban-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 35%, rgb(69 10 10 / 0.55) 100%);
    pointer-events: none;
    animation: vignettePulse 1.2s ease-out forwards;
  }

  .ban-bars {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: space-evenly;
    pointer-events: none;
    opacity: 0.35;
  }

  .bar {
    width: 3px;
    height: 100%;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgb(239 68 68 / 0.5) 20%,
      rgb(127 29 29 / 0.7) 50%,
      rgb(239 68 68 / 0.5) 80%,
      transparent 100%
    );
    animation: barScan 0.9s ease-out forwards;
  }

  .ban-modal {
    position: relative;
    z-index: 2;
    width: min(22rem, calc(100% - 2rem));
    padding: 28px 24px 22px;
    border-radius: 16px;
    border: 2px solid rgb(239 68 68 / 0.55);
    background: linear-gradient(160deg, #1c1917 0%, #292524 45%, #1c1917 100%);
    box-shadow:
      0 24px 64px rgb(0 0 0 / 0.55),
      0 0 40px rgb(220 38 38 / 0.25),
      inset 0 1px 0 rgb(255 255 255 / 0.06);
    text-align: center;
    animation: modalSlam 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .ban-stamp {
    position: absolute;
    top: 12px;
    right: 14px;
    padding: 4px 10px;
    border: 2px solid rgb(239 68 68 / 0.7);
    border-radius: 6px;
    color: #fca5a5;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.14em;
    transform: rotate(-12deg);
    opacity: 0.9;
  }

  .ban-icon {
    font-size: 56px;
    line-height: 1;
    margin-bottom: 10px;
    filter: grayscale(0.2) drop-shadow(0 4px 12px rgb(0 0 0 / 0.45));
    animation: iconMute 1.4s ease-in-out infinite;
  }

  .ban-title {
    margin: 0 0 12px;
    font-size: 22px;
    font-weight: 900;
    color: #fecaca;
    letter-spacing: 0.06em;
  }

  .ban-reason {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: #f87171;
    line-height: 1.45;
  }

  .ban-end {
    margin: 0 0 8px;
    font-size: 13px;
    color: #d6d3d1;
  }

  .ban-tip {
    margin: 0 0 20px;
    font-size: 12px;
    color: #a8a29e;
    line-height: 1.5;
  }

  .ban-confirm {
    padding: 10px 32px;
    border: 1px solid rgb(239 68 68 / 0.5);
    border-radius: 999px;
    background: rgb(127 29 29 / 0.85);
    color: #fecaca;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition:
      background 0.2s,
      transform 0.2s;
  }

  .ban-confirm:hover {
    background: rgb(153 27 27 / 0.95);
    transform: scale(1.02);
  }

  @keyframes vignettePulse {
    0% {
      opacity: 0;
    }
    30% {
      opacity: 1;
    }
    100% {
      opacity: 0.85;
    }
  }

  @keyframes barScan {
    from {
      transform: scaleY(0);
      opacity: 0;
    }
    to {
      transform: scaleY(1);
      opacity: 1;
    }
  }

  @keyframes modalSlam {
    from {
      opacity: 0;
      transform: scale(0.88) translateY(12px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes iconMute {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.94);
    }
  }

  .ban-punish-enter-active {
    animation: overlayIn 0.3s ease;
  }

  .ban-punish-leave-active {
    animation: overlayIn 0.22s ease reverse;
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
