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
    <img
      v-if="muted"
      class="rpg-audio-nav-trigger__art"
      src="/rpg/icons/volume-off.png"
      alt=""
      aria-hidden="true"
    >
    <img
      v-else
      class="rpg-audio-nav-trigger__art"
      src="/rpg/icons/volume-on.png"
      alt=""
      aria-hidden="true"
    >
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

  .rpg-audio-nav-trigger__art {
    width: 1.25rem;
    height: 1.25rem;
    object-fit: contain;
    filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.2));
  }

  .rpg-audio-nav-trigger:hover {
    border-color: var(--tech-border);
    background: var(--tech-header);
    color: var(--tech-fg);
  }
</style>
