<script setup lang="ts">
/**
   * 小型生命值指示器 - 用于评论区/留言区输入框附近
   * 显示当前生命值状态（绿色正常/黄色警告/红色危险）
   */
const props = defineProps<{
  lifeValue: number;
  maxLife?: number;
}>();

const maxLife = props.maxLife ?? 100;

const lifeColor = computed(() => {
  if (props.lifeValue > 60) return '#4ade80';
  if (props.lifeValue > 30) return '#fbbf24';
  return '#ef4444';
});

const lifePercent = computed(() => {
  return Math.max(0, Math.min(100, (props.lifeValue / maxLife) * 100));
});

const statusText = computed(() => {
  if (props.lifeValue > 60) return '状态良好';
  if (props.lifeValue > 30) return '注意危险';
  if (props.lifeValue > 0) return '即将归零！';
  return '已归零';
});
</script>

<template>
  <div class="life-indicator">
    <div class="life-bar-bg">
      <div
        class="life-bar-fill"
        :style="{ width: lifePercent + '%', backgroundColor: lifeColor }"
      />
    </div>
    <span class="life-text" :style="{ color: lifeColor }">
      ❤ {{ lifeValue }}/{{ maxLife }}
      <span class="life-status">{{ statusText }}</span>
    </span>
  </div>
</template>

<style scoped>
  .life-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.04);
  }

  .life-bar-bg {
    width: 60px;
    height: 6px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .life-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition:
      width 0.5s ease,
      background-color 0.5s ease;
  }

  .life-text {
    font-weight: 600;
    white-space: nowrap;
  }

  .life-status {
    font-weight: 400;
    opacity: 0.7;
    margin-left: 4px;
  }
</style>
