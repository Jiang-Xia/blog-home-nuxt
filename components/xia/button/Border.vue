<script setup lang="ts">
  import { reactive, ref } from 'vue'
  const props = defineProps({
    // 渐变开始和结束颜色
    gradient: {
      type: Object,
      default: () => ({
        start: '#FFD75A',
        stop: '#ED424B',
      }),
    },
    // 矩形圆角半径
    rx: {
      type: [String, Number],
      default: 16,
    },
    // 边框大小
    strokeWidth: {
      type: [String, Number],
      default: 2,
    },
    // 开启动画
    animation: {
      type: Boolean,
      default: true,
    },
    animationDuration: {
      type: Number,
      default: 0.3,
    },
    // 文本颜色
    color: {
      type: String,
      default: '',
    },
  })
</script>
<template>
  <button class="border-button" :style="{ color: color }">
    <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        class="rect"
        x="2"
        y="2"
        width="100%"
        height="100%"
        :class="{ 'rect-animation': animation }"
        :style="{ animationDuration: animationDuration + 's' }"
        :stroke-width="strokeWidth"
        :rx="rx"
        stroke-linecap="round"
        stroke="url(#paint0_linear_3269_5233)"
        stroke-dasharray="8 6"
      />
      <defs>
        <linearGradient
          id="paint0_linear_3269_5233"
          x1="0"
          y1="0"
          x2="100%"
          y2="100%"
          gradientUnits="userSpaceOnUse"
        >
          <stop :stop-color="gradient.start" />
          <stop :stop-color="gradient.stop" offset="1" />
        </linearGradient>
      </defs>
    </svg>
    <slot>Text</slot>
  </button>
</template>
<style lang="less" scoped>
  .border-button {
    border: 0;
    outline: 0;
    // padding: .5em 1.5em;
    // border-radius: 15px;
    font-size: 30px;
    position: relative;
    color: var(--main-color);
    .rect {
      width: calc(100% - 4px);
      height: calc(100% - 4px);
    }
    .rect-animation {
      // animation: move .3s infinite linear;
      animation: move 0.6s infinite linear;
    }
    @keyframes move {
      // 负数顺时针  正数逆时针
      0% {
        stroke-dashoffset: 0;
      }
      100% {
        stroke-dashoffset: 14;
      }
    }
    svg {
      position: absolute;
      inset: 0;
    }
  }
</style>
