<script setup lang="ts">
const theme = useTheme();
</script>

<template>
  <div class="theme-lab space-y-3">
    <div class="theme-current">
      <span class="theme-current-label">当前主题</span>
      <code class="theme-current-value">{{ theme }}</code>
    </div>
    <XiaTheme />
    <p class="theme-tip">
      与导航栏主题切换共用状态；切换后刷新页面可验证持久化是否正常。
    </p>
  </div>
</template>

<style scoped>
  .theme-current {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
  }

  .theme-current-label {
    color: oklch(var(--bc) / 0.55);
  }

  .theme-current-value {
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 12px;
    background: oklch(var(--p) / 0.12);
    color: oklch(var(--p));
  }

  .theme-tip {
    font-size: 12px;
    line-height: 1.45;
    color: oklch(var(--bc) / 0.58);
  }
</style>
