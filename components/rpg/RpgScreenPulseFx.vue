<script setup lang="ts">
/**
   * 短暂全屏脉冲特效
   * lifeChange / shieldUsed / buffGranted / buffExpired
   */
export type RpgScreenPulseKind
  = | 'lifeDeduct'
    | 'lifeRecover'
    | 'shield'
    | 'buffGrant'
    | 'buffExpire';

const props = defineProps<{
  /** 递增以重复触发同类特效 */
  tick: number;
  kind: RpgScreenPulseKind | null;
  label?: string;
}>();

const emit = defineEmits<{
  done: [];
}>();

const { playSfx } = useRpgAudio();

const active = ref(false);
let doneTimer: ReturnType<typeof setTimeout> | null = null;

const sfxMap: Record<
  RpgScreenPulseKind,
    'lifeDamage' | 'lifeRecover' | 'shieldBlock' | 'buffActivate' | 'buffDeactivate'
> = {
  lifeDeduct: 'lifeDamage',
  lifeRecover: 'lifeRecover',
  shield: 'shieldBlock',
  buffGrant: 'buffActivate',
  buffExpire: 'buffDeactivate',
};

const durationMap: Record<RpgScreenPulseKind, number> = {
  lifeDeduct: 720,
  lifeRecover: 620,
  shield: 880,
  buffGrant: 820,
  buffExpire: 760,
};

const clearDoneTimer = () => {
  if (doneTimer) {
    clearTimeout(doneTimer);
    doneTimer = null;
  }
};

watch(
  () => props.tick,
  () => {
    clearDoneTimer();
    if (!props.kind || props.tick <= 0) {
      active.value = false;
      return;
    }
    active.value = false;
    void nextTick(() => {
      active.value = true;
      void playSfx(sfxMap[props.kind!]);
      doneTimer = setTimeout(() => {
        active.value = false;
        emit('done');
      }, durationMap[props.kind!]);
    });
  },
);

onUnmounted(clearDoneTimer);

const pulseClass = computed(() => {
  if (!props.kind) return '';
  return `pulse--${props.kind}`;
});

const showCenter = computed(
  () => props.kind === 'shield' || props.kind === 'buffGrant' || props.kind === 'buffExpire',
);

const centerLabel = computed(() => {
  if (props.kind === 'shield') {
    return props.label ? `🛡️ ${props.label}` : '🛡️ 护盾生效';
  }
  if (props.kind === 'buffGrant') {
    return props.label ? `✨ ${props.label}` : '✨ 获得增益';
  }
  if (props.kind === 'buffExpire') {
    return props.label ? `⏰ ${props.label}` : '⏰ 增益过期';
  }
  return '';
});

const centerClass = computed(() => {
  if (props.kind === 'buffGrant') return 'center-core center-core--buff-grant';
  if (props.kind === 'buffExpire') return 'center-core center-core--buff-expire';
  return 'center-core center-core--shield';
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="active && kind"
      class="screen-pulse"
      :class="[pulseClass, { shaking: kind === 'lifeDeduct' }]"
      aria-hidden="true"
    >
      <div v-if="showCenter" :class="centerClass">
        <span class="pulse-ring pulse-ring--1" />
        <span class="pulse-ring pulse-ring--2" />
        <span class="center-label">{{ centerLabel }}</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
  .screen-pulse {
    position: fixed;
    inset: 0;
    z-index: 10075;
    pointer-events: none;
    overflow: hidden;
  }

  .pulse--lifeDeduct {
    background: radial-gradient(
      ellipse at center,
      rgb(220 38 38 / 0.42) 0%,
      rgb(127 29 29 / 0.28) 38%,
      transparent 72%
    );
    animation: flashRed 0.72s ease-out forwards;
  }

  .pulse--lifeRecover {
    background: radial-gradient(
      ellipse at center,
      rgb(34 197 94 / 0.34) 0%,
      rgb(22 163 74 / 0.2) 42%,
      transparent 74%
    );
    animation: flashGreen 0.62s ease-out forwards;
  }

  .pulse--shield {
    background: radial-gradient(ellipse at center, rgb(59 130 246 / 0.22) 0%, transparent 65%);
  }

  .pulse--buffGrant {
    background: radial-gradient(
      ellipse at center,
      rgb(139 92 246 / 0.32) 0%,
      rgb(99 102 241 / 0.18) 42%,
      transparent 72%
    );
    animation: flashViolet 0.82s ease-out forwards;
  }

  .pulse--buffExpire {
    background: radial-gradient(
      ellipse at center,
      rgb(120 113 108 / 0.28) 0%,
      rgb(68 64 60 / 0.16) 45%,
      transparent 74%
    );
    animation: flashFade 0.76s ease-out forwards;
  }

  .shaking {
    animation:
      flashRed 0.72s ease-out forwards,
      screenShake 0.45s ease-in-out;
  }

  .center-core {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-ring {
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    animation: ringExpand 0.88s ease-out forwards;
  }

  .center-core--shield .pulse-ring {
    border: 2px solid rgb(96 165 250 / 0.75);
  }

  .center-core--shield .pulse-ring--2 {
    animation-delay: 0.12s;
    border-color: rgb(191 219 254 / 0.55);
  }

  .center-core--buff-grant .pulse-ring {
    border: 2px solid rgb(167 139 250 / 0.8);
  }

  .center-core--buff-grant .pulse-ring--2 {
    animation-delay: 0.1s;
    border-color: rgb(216 180 254 / 0.55);
  }

  .center-core--buff-expire .pulse-ring {
    border: 2px solid rgb(168 162 158 / 0.65);
  }

  .center-core--buff-expire .pulse-ring--2 {
    animation-delay: 0.1s;
    border-color: rgb(214 211 209 / 0.45);
  }

  .center-label {
    position: relative;
    z-index: 2;
    padding: 10px 18px;
    border-radius: 999px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.04em;
    animation: labelPop 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.35);
  }

  .center-core--shield .center-label {
    background: rgb(15 23 42 / 0.72);
    color: #dbeafe;
  }

  .center-core--buff-grant .center-label {
    background: rgb(46 16 101 / 0.78);
    color: #e9d5ff;
  }

  .center-core--buff-expire .center-label {
    background: rgb(28 25 23 / 0.78);
    color: #d6d3d1;
  }

  @keyframes flashRed {
    0% {
      opacity: 0;
    }
    18% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes flashGreen {
    0% {
      opacity: 0;
    }
    22% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes flashViolet {
    0% {
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes flashFade {
    0% {
      opacity: 0;
    }
    24% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes screenShake {
    0%,
    100% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-6px);
    }
    40% {
      transform: translateX(6px);
    }
    60% {
      transform: translateX(-4px);
    }
    80% {
      transform: translateX(4px);
    }
  }

  @keyframes ringExpand {
    0% {
      opacity: 0.9;
      transform: scale(0.25);
    }
    100% {
      opacity: 0;
      transform: scale(3.2);
    }
  }

  @keyframes labelPop {
    from {
      opacity: 0;
      transform: scale(0.7);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
