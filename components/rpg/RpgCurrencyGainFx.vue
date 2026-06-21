<script setup lang="ts">
/**
   * 大额钻石增加飞入特效（currencyChange WS，delta ≥ 阈值）
   * 非模态浮层，钻石粒子上升 + 中央数额；音效 currencyGain
   */
import type { RpgCurrencyChangePayload } from '~~/composables/use-realtime-socket';
import { formatRpgCurrencyReasonLabel } from '~~/utils/rpg-currency';

const props = defineProps<{
  tick: number;
  data: RpgCurrencyChangePayload | null;
}>();

const emit = defineEmits<{
  done: [];
}>();

const { playSfx } = useRpgAudio();

const active = ref(false);

interface CoinParticle {
  id: number;
  left: string;
  delay: string;
  drift: string;
}

const particles = ref<CoinParticle[]>([]);
let doneTimer: ReturnType<typeof setTimeout> | null = null;

const clearDoneTimer = () => {
  if (doneTimer) {
    clearTimeout(doneTimer);
    doneTimer = null;
  }
};

const buildParticles = (count: number) => {
  const n = Math.min(10, Math.max(4, Math.round(count / 15)));
  particles.value = Array.from({ length: n }, (_, i) => ({
    id: i,
    left: `${18 + Math.random() * 64}%`,
    delay: `${Math.random() * 0.2}s`,
    drift: `${-24 + Math.random() * 48}px`,
  }));
};

watch(
  () => props.tick,
  () => {
    clearDoneTimer();
    if (!props.data || props.tick <= 0 || props.data.delta <= 0) {
      active.value = false;
      return;
    }
    active.value = false;
    void nextTick(() => {
      buildParticles(props.data!.delta);
      active.value = true;
      void playSfx('currencyGain');
      doneTimer = setTimeout(() => {
        active.value = false;
        particles.value = [];
        emit('done');
      }, 1400);
    });
  },
);

onUnmounted(clearDoneTimer);

const reasonLabel = computed(() =>
  formatRpgCurrencyReasonLabel(props.data?.reason, props.data?.reasonLabel),
);
</script>

<template>
  <Teleport to="body">
    <div v-if="active && data" class="currency-gain-fx" aria-hidden="true">
      <div class="gain-core">
        <span class="gain-glow" />
        <span class="gain-emoji">💎</span>
        <span class="gain-amount">+{{ data.delta }}</span>
        <span class="gain-reason">{{ reasonLabel }}</span>
      </div>
      <span
        v-for="p in particles"
        :key="p.id"
        class="coin-particle"
        :style="{
          'left': p.left,
          'animationDelay': p.delay,
          '--drift': p.drift,
        }"
      >💎</span>
    </div>
  </Teleport>
</template>

<style scoped>
  .currency-gain-fx {
    position: fixed;
    inset: 0;
    /* 高于充值弹窗(10080)，庆祝层须全屏可见 */
    z-index: 10082;
    pointer-events: none;
    overflow: hidden;
  }

  .gain-core {
    position: absolute;
    top: 42%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: corePop 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .gain-glow {
    position: absolute;
    inset: -28px -40px;
    border-radius: 50%;
    background: radial-gradient(circle, rgb(96 165 250 / 0.45) 0%, transparent 72%);
    animation: glowFade 1.2s ease-out forwards;
  }

  .gain-emoji {
    position: relative;
    font-size: 52px;
    line-height: 1;
    filter: drop-shadow(0 6px 14px rgb(37 99 235 / 0.45));
    animation: gemFloat 1.1s ease-in-out infinite;
  }

  .gain-amount {
    position: relative;
    margin-top: 6px;
    font-size: 32px;
    font-weight: 900;
    color: #fef3c7;
    text-shadow:
      0 2px 8px rgb(0 0 0 / 0.45),
      0 0 20px rgb(59 130 246 / 0.6);
    letter-spacing: 0.02em;
  }

  .gain-reason {
    position: relative;
    margin-top: 4px;
    font-size: 13px;
    font-weight: 600;
    color: rgb(219 234 254 / 0.9);
    letter-spacing: 0.04em;
  }

  .coin-particle {
    position: absolute;
    bottom: 28%;
    font-size: 22px;
    line-height: 1;
    opacity: 0;
    animation: coinRise 1.1s ease-out forwards;
  }

  @keyframes corePop {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.65);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes glowFade {
    0% {
      opacity: 0.2;
      transform: scale(0.8);
    }
    30% {
      opacity: 1;
      transform: scale(1.1);
    }
    100% {
      opacity: 0;
      transform: scale(1.4);
    }
  }

  @keyframes gemFloat {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes coinRise {
    0% {
      opacity: 0;
      transform: translateY(0) translateX(0) scale(0.5);
    }
    15% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-180px) translateX(var(--drift)) scale(1);
    }
  }
</style>
