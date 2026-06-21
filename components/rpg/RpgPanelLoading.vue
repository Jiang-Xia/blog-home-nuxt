<script setup lang="ts">
/**
   * RPG 面板统一加载态 — 旋转光环 + 跳动光点，供各 Tab 面板复用
   */
withDefaults(
  defineProps<{
    /** 加载文案，默认「加载中」 */
    label?: string;
    /** 紧凑模式（较小内边距，适合嵌套卡片） */
    compact?: boolean;
  }>(),
  {
    label: '加载中',
    compact: false,
  },
);
</script>

<template>
  <div
    class="rpg-panel-loading"
    :class="{ compact }"
    role="status"
    aria-live="polite"
    :aria-label="`${label}…`"
  >
    <div class="rpg-panel-loading__visual" aria-hidden="true">
      <span class="rpg-panel-loading__ring" />
      <span class="rpg-panel-loading__ring rpg-panel-loading__ring--inner" />
      <span class="rpg-panel-loading__core">⚔️</span>
    </div>
    <p class="rpg-panel-loading__label">
      {{ label }}
      <span class="rpg-panel-loading__dots" aria-hidden="true"> <i /><i /><i /> </span>
    </p>
  </div>
</template>

<style scoped>
  .rpg-panel-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 32px 16px;
    text-align: center;
  }

  .rpg-panel-loading.compact {
    gap: 10px;
    padding: 20px 12px;
  }

  .rpg-panel-loading__visual {
    position: relative;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .compact .rpg-panel-loading__visual {
    width: 42px;
    height: 42px;
  }

  .rpg-panel-loading__ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: var(--rpg-amber-light);
    border-right-color: color-mix(in oklch, var(--rpg-violet) 65%, transparent);
    animation: rpgLoadSpin 0.9s linear infinite;
  }

  .rpg-panel-loading__ring--inner {
    inset: 7px;
    border-top-color: var(--rpg-violet);
    border-right-color: color-mix(in oklch, var(--rpg-amber-light) 55%, transparent);
    animation-direction: reverse;
    animation-duration: 1.15s;
  }

  .compact .rpg-panel-loading__ring--inner {
    inset: 6px;
  }

  .rpg-panel-loading__core {
    font-size: 18px;
    line-height: 1;
    animation: rpgLoadPulse 1.2s ease-in-out infinite;
    filter: drop-shadow(0 0 6px rgb(251 191 36 / 0.45));
  }

  .compact .rpg-panel-loading__core {
    font-size: 15px;
  }

  .rpg-panel-loading__label {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--rpg-text-muted);
    letter-spacing: 0.02em;
  }

  .compact .rpg-panel-loading__label {
    font-size: 12px;
  }

  .rpg-panel-loading__dots {
    display: inline-flex;
    gap: 3px;
    margin-left: 2px;
    vertical-align: baseline;
  }

  .rpg-panel-loading__dots i {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--rpg-amber-light);
    animation: rpgLoadDot 1.1s ease-in-out infinite;
  }

  .rpg-panel-loading__dots i:nth-child(2) {
    animation-delay: 0.15s;
  }

  .rpg-panel-loading__dots i:nth-child(3) {
    animation-delay: 0.3s;
  }

  @keyframes rpgLoadSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes rpgLoadPulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.85;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
  }

  @keyframes rpgLoadDot {
    0%,
    80%,
    100% {
      transform: translateY(0);
      opacity: 0.35;
    }
    40% {
      transform: translateY(-4px);
      opacity: 1;
    }
  }
</style>
