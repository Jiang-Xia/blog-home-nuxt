<script setup lang="ts">
/**
   * 抽奖庆祝彩带
   * 按稀有度控制粒子数量与色调，纯 CSS 实现无 canvas 依赖
   */
import { getRarityCelebrationTier } from '@/utils/lottery-reel';

const props = withDefaults(
  defineProps<{
    active: boolean;
    rarity?: string;
    density?: 'low' | 'medium' | 'high';
  }>(),
  {
    rarity: 'common',
    density: 'medium',
  },
);

const tier = computed(() => getRarityCelebrationTier(props.rarity));

const particleCount = computed(() => {
  const base = { common: 12, rare: 20, epic: 32, legendary: 48 }[tier.value];
  const mult = { low: 0.6, medium: 1, high: 1.4 }[props.density];
  return Math.round(base * mult);
});

const palette = computed(() => {
  const map = {
    common: ['#94a3b8', '#cbd5e1', '#e2e8f0', '#f8fafc'],
    rare: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
    epic: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'],
    legendary: ['#f59e0b', '#fbbf24', '#fde68a', '#fef3c7', '#fff'],
  };
  return map[tier.value];
});

interface Particle {
  id: number;
  left: string;
  delay: string;
  duration: string;
  color: string;
  size: string;
  rotate: string;
  drift: string;
}

const particles = ref<Particle[]>([]);

const buildParticles = () => {
  const colors = palette.value;
  const count = particleCount.value;
  particles.value = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${8 + Math.random() * 84}%`,
    delay: `${Math.random() * 0.45}s`,
    duration: `${1.6 + Math.random() * 1.4}s`,
    color: colors[i % colors.length]!,
    size: `${5 + Math.random() * 7}px`,
    rotate: `${Math.random() * 360}deg`,
    drift: `${-30 + Math.random() * 60}px`,
  }));
};

watch(
  () => [props.active, props.rarity, props.density] as const,
  ([active]) => {
    if (active) buildParticles();
    else particles.value = [];
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="active" class="lottery-confetti" aria-hidden="true">
    <span
      v-for="p in particles"
      :key="p.id"
      class="confetti-piece"
      :style="{
        'left': p.left,
        'animationDelay': p.delay,
        'animationDuration': p.duration,
        'backgroundColor': p.color,
        'width': p.size,
        'height': p.size,
        '--drift': p.drift,
        '--spin': p.rotate,
      }"
    />
    <div v-if="tier === 'legendary'" class="burst-ring" />
    <div v-if="tier === 'legendary'" class="burst-ring burst-ring--delay" />
  </div>
</template>

<style scoped>
  .lottery-confetti {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 2;
  }

  .confetti-piece {
    position: absolute;
    top: -12px;
    border-radius: 2px;
    opacity: 0;
    animation-name: confettiFall;
    animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
    animation-fill-mode: forwards;
  }

  .burst-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120px;
    height: 120px;
    margin: -60px 0 0 -60px;
    border: 2px solid rgba(251, 191, 36, 0.7);
    border-radius: 50%;
    animation: burstExpand 1.2s ease-out forwards;
  }

  .burst-ring--delay {
    animation-delay: 0.25s;
    border-color: rgba(255, 255, 255, 0.5);
  }

  @keyframes confettiFall {
    0% {
      opacity: 0;
      transform: translateY(0) translateX(0) rotate(0deg) scale(0.4);
    }
    8% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(110vh) translateX(var(--drift)) rotate(calc(var(--spin) + 540deg))
        scale(1);
    }
  }

  @keyframes burstExpand {
    0% {
      opacity: 0.9;
      transform: scale(0.2);
    }
    100% {
      opacity: 0;
      transform: scale(2.8);
    }
  }
</style>
