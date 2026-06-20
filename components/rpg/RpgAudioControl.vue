<script setup lang="ts">
/**
   * RPG 音量控制条（静音 / BGM / 音效）
   * 用于冒险页等需要背景音乐的界面
   */
const props = withDefaults(
  defineProps<{
    compact?: boolean;
  }>(),
  { compact: false },
);

const { muted, bgmVolume, sfxVolume, toggleMute, initAudio } = useRpgAudio();

onMounted(() => {
  // 懒加载音频引擎（BGM 由父页 playBgm 控制）
  void initAudio();
});
</script>

<template>
  <div class="rpg-audio-control" :class="{ compact: props.compact }">
    <button
      type="button"
      class="audio-toggle"
      :title="muted ? '开启音效' : '静音'"
      :aria-label="muted ? '开启音效' : '静音'"
      @click="toggleMute"
    >
      {{ muted ? '🔇' : '🔊' }}
    </button>
    <template v-if="!compact && !muted">
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
  .rpg-audio-control {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    border-radius: 10px;
    border: 1px solid var(--rpg-border, oklch(var(--b3)));
    background: var(--rpg-surface, oklch(var(--b1)));
  }

  .rpg-audio-control.compact {
    padding: 4px 8px;
    gap: 0;
  }

  .audio-toggle {
    border: none;
    background: transparent;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 6px;
    transition: background 0.15s;
  }

  .audio-toggle:hover {
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
