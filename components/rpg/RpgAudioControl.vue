<script setup lang="ts">
/**
   * RPG 导航栏静音钮（与 NavNotificationBell 圆形图标样式一致）
   * 冒险页音量/新手引导见 `pages/rpg/index.vue` 内联工具条
   */
const { muted, toggleMute, initAudio } = useRpgAudio();

onMounted(() => {
  void initAudio();
});
</script>

<template>
  <button
    type="button"
    class="rpg-audio-nav-trigger"
    :title="muted ? '开启音效' : '静音'"
    :aria-label="muted ? '开启音效' : '静音'"
    @click="toggleMute"
  >
    <svg
      v-if="muted"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  </button>
</template>

<style scoped>
  .rpg-audio-nav-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 999px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--tech-muted, var(--tech-fg-muted));
    cursor: pointer;
    transition:
      color 0.2s,
      border-color 0.2s,
      background-color 0.2s;
  }

  .rpg-audio-nav-trigger:hover {
    border-color: var(--tech-border);
    background: var(--tech-header);
    color: var(--tech-fg);
  }
</style>
