<script setup lang="ts">
/**
   * RPG 音量控制
   * - panel：冒险页完整条（静音 + BGM/SFX 滑条）
   * - nav：导航栏圆形图标钮（与 NavNotificationBell 一致）
   */
const props = withDefaults(
  defineProps<{
    variant?: 'panel' | 'nav';
  }>(),
  { variant: 'panel' },
);

const { muted, bgmVolume, sfxVolume, toggleMute, initAudio } = useRpgAudio();

onMounted(() => {
  void initAudio();
});
</script>

<template>
  <button
    v-if="variant === 'nav'"
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

  <div v-else class="rpg-audio-control">
    <button
      type="button"
      class="rpg-audio-control__toggle"
      :title="muted ? '开启音效' : '静音'"
      :aria-label="muted ? '开启音效' : '静音'"
      @click="toggleMute"
    >
      {{ muted ? '🔇' : '🔊' }}
    </button>
    <template v-if="!muted">
      <label class="vol-row">
        <span>BGM</span>
        <input
          v-model.number="bgmVolume" type="range" min="0"
          max="1"
          step="0.05"
        >
      </label>
      <label class="vol-row">
        <span>SFX</span>
        <input
          v-model.number="sfxVolume" type="range" min="0"
          max="1"
          step="0.05"
        >
      </label>
    </template>
  </div>
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

  .rpg-audio-control {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    border-radius: 10px;
    border: 1px solid var(--rpg-border, oklch(var(--b3)));
    background: var(--rpg-surface, oklch(var(--b1)));
  }

  .rpg-audio-control__toggle {
    border: none;
    background: transparent;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 6px;
    transition: background 0.15s;
  }

  .rpg-audio-control__toggle:hover {
    background: var(--rpg-bg-alt, oklch(var(--b2)));
  }

  .vol-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.65));
    font-weight: 600;
  }

  .vol-row span {
    width: 28px;
    flex-shrink: 0;
  }

  .vol-row input[type='range'] {
    width: 72px;
    accent-color: var(--rpg-violet, oklch(var(--p)));
  }
</style>
