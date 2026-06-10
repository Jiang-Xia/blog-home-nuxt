<script setup lang="ts">
/**
   * 兼容旧链接，重定向到 RPG 模块的排行榜标签页
   */
definePageMeta({
  layout: 'default',
});

await navigateTo({ path: '/rpg', query: { tab: 'leaderboard' } }, { replace: true });
</script>

<template>
  <div />
</template>
