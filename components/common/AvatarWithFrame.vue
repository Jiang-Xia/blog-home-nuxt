<script setup lang="ts">
/**
   * 带 RPG 头像框的圆形头像
   */
import type { AvatarFrameInfo } from '~~/types/rpg';

const props = withDefaults(
  defineProps<{
    avatar?: string;
    alt?: string;
    size?: number | string;
    frame?: AvatarFrameInfo | null;
  }>(),
  {
    avatar: '',
    alt: '',
    size: 32,
  },
);

const sizePx = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`;
  return props.size;
});

const frameColor = computed(() => props.frame?.color || null);

const wrapperStyle = computed(() => {
  const size = sizePx.value;
  const base: Record<string, string> = {
    width: size,
    height: size,
  };
  if (frameColor.value) {
    base['--avatar-frame-color'] = frameColor.value;
    base.border = '2px solid var(--avatar-frame-color)';
  }
  return base;
});
</script>

<template>
  <div
    class="avatar-with-frame inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden bg-base-300"
    :class="{ 'has-frame': frameColor, 'ring-2 ring-primary/20': !frameColor }"
    :style="wrapperStyle"
    :title="frame?.name || alt"
  >
    <img v-if="avatar" :src="avatar" :alt="alt" class="h-full w-full object-cover">
    <slot v-else name="fallback" />
  </div>
</template>

<style scoped>
  .avatar-with-frame.has-frame {
    animation: avatar-frame-breathe 2.5s ease-in-out infinite;
  }

  @keyframes avatar-frame-breathe {
    0%,
    100% {
      border-color: color-mix(in oklch, var(--avatar-frame-color) 55%, transparent);
      box-shadow:
        0 0 0 1px color-mix(in oklch, var(--avatar-frame-color) 40%, transparent),
        0 0 8px color-mix(in oklch, var(--avatar-frame-color) 30%, transparent);
    }

    50% {
      border-color: var(--avatar-frame-color);
      box-shadow:
        0 0 0 2px color-mix(in oklch, var(--avatar-frame-color) 70%, transparent),
        0 0 14px color-mix(in oklch, var(--avatar-frame-color) 55%, transparent),
        0 0 24px color-mix(in oklch, var(--avatar-frame-color) 28%, transparent);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .avatar-with-frame.has-frame {
      animation: none;
      border-color: var(--avatar-frame-color);
      box-shadow:
        0 0 0 2px var(--avatar-frame-color),
        0 0 12px color-mix(in oklch, var(--avatar-frame-color) 35%, transparent);
    }
  }
</style>
