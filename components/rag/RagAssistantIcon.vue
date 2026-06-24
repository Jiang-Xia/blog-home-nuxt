<script setup lang="ts">
/**
   * RAG 助手 FAB 图标：Cyber 风格循环动画 SVG
   * 尺寸由父级 .rag-assistant__fab-icon 填满 cyber-fab__icon（约 2.5rem）
   */
</script>

<template>
  <!-- 外环 / 轨道 / 核心 / 星光 四层独立动画，viewBox 固定 48×48 -->
  <svg
    class="rag-assistant-icon"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient
        id="rag-ai-core"
        x1="12"
        y1="8"
        x2="36"
        y2="40"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#22d3ee" />
        <stop offset="1" stop-color="#6366f1" />
      </linearGradient>
      <linearGradient
        id="rag-ai-orbit"
        x1="0"
        y1="0"
        x2="48"
        y2="48"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#a78bfa" stop-opacity="0" />
        <stop offset="0.5" stop-color="#22d3ee" />
        <stop offset="1" stop-color="#a78bfa" stop-opacity="0" />
      </linearGradient>
    </defs>

    <circle
      class="rag-assistant-icon__ring"
      cx="24"
      cy="24"
      r="19"
      stroke="url(#rag-ai-orbit)"
      stroke-width="1.5"
    />

    <g class="rag-assistant-icon__orbit">
      <circle cx="24" cy="6" r="2.2" fill="#22d3ee" />
      <circle cx="42" cy="24" r="1.6" fill="#a78bfa" />
    </g>

    <g class="rag-assistant-icon__core">
      <path
        d="M24 14c-4.4 0-8 2.8-8 6.2 0 2.1 1.2 4 3.1 5.1-.4 1.6-.9 3.1-1.6 4.5 1.6-.6 3.1-1.4 4.5-2.3 1.3.4 2.7.6 4 .6 4.4 0 8-2.8 8-6.2S28.4 14 24 14Z"
        fill="url(#rag-ai-core)"
      />
      <circle cx="20" cy="20.5" r="1.2" fill="#ecfeff" />
      <circle cx="28" cy="20.5" r="1.2" fill="#ecfeff" />
      <path
        d="M20 24.5c1.2 1.4 2.8 2.1 4 2.1s2.8-.7 4-2.1"
        stroke="#ecfeff"
        stroke-width="1.2"
        stroke-linecap="round"
      />
    </g>

    <path
      class="rag-assistant-icon__spark"
      d="M34 12 35.5 16 39.5 17.5 35.5 19 34 23 32.5 19 28.5 17.5 32.5 16Z"
      fill="#f0abfc"
    />
  </svg>
</template>

<style scoped>
  /* 100% 填满 FAB 图标槽，动画以 viewBox 中心 24,24 为原点 */
  .rag-assistant-icon {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .rag-assistant-icon__ring {
    /* 外环渐变描边慢速旋转 */
    transform-origin: 24px 24px;
    animation: rag-ai-ring-spin 6s linear infinite;
  }

  .rag-assistant-icon__orbit {
    /* 轨道粒子反向旋转 */
    transform-origin: 24px 24px;
    animation: rag-ai-orbit-spin 3.2s linear infinite;
  }

  .rag-assistant-icon__core {
    /* 对话气泡主体呼吸缩放 */
    transform-origin: 24px 24px;
    animation: rag-ai-core-pulse 2.4s ease-in-out infinite;
  }

  .rag-assistant-icon__spark {
    /* 右上角星光闪烁 */
    transform-origin: 34px 17.5px;
    animation: rag-ai-spark-twinkle 1.8s ease-in-out infinite;
  }

  @keyframes rag-ai-ring-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes rag-ai-orbit-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(-360deg);
    }
  }

  @keyframes rag-ai-core-pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.06);
      opacity: 0.92;
    }
  }

  @keyframes rag-ai-spark-twinkle {
    0%,
    100% {
      transform: scale(0.85) rotate(0deg);
      opacity: 0.55;
    }
    50% {
      transform: scale(1.15) rotate(18deg);
      opacity: 1;
    }
  }
</style>
