<script setup lang="ts">
/**
   * 带 RPG 头像框的圆形头像
   * 框渲染两级：icon 命中本地框图资产 → 图片框（头像叠上层）；
   * 否则仅有 color 时回退彩色呼吸光环。
   */
import type { AvatarFrameInfo } from '~~/types/rpg';
import { resolveAvatarFrameArt } from '~~/composables/use-avatar-frame';

const props = withDefaults(
  defineProps<{
    avatar?: string;
    alt?: string;
    size?: number | string;
    frame?: AvatarFrameInfo | null;
    /** 是否启用图片框渲染（默认关闭，回退彩色呼吸光晕；仅冒险状态页开启） */
    art?: boolean;
    /** 点击头像弹框查看大图 */
    previewable?: boolean;
  }>(),
  {
    avatar: '',
    alt: '',
    size: 32,
    art: false,
    previewable: false,
  },
);

const { open: openImagePreview } = useImagePreview();

const sizePx = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`;
  return props.size;
});

/** 光晕颜色：装扮色优先，仅有图无色时兜底中性金（与图片框光晕默认色一致） */
const frameColor = computed(() => (props.frame ? props.frame.color || '#d9a13c' : null));

/** 图片框（仅在 art 开启时生效；icon 命中 public/rpg/icons 的 frame-* png 或管理端上传图） */
const frameArt = computed(() =>
  props.art ? resolveAvatarFrameArt(props.frame?.icon, props.frame?.iconUrl) : null,
);
const frameArtStyle = computed(() => {
  if (!frameArt.value) return null;
  return { width: `calc(${sizePx.value} * ${frameArt.value.scale})` };
});

const wrapperStyle = computed(() => {
  const size = sizePx.value;
  const base: Record<string, string> = {
    width: size,
    height: size,
  };
    // 图片框时边框交给框图，避免色环与框图叠加
  if (frameArt.value) return base;
  if (frameColor.value) {
    base['--avatar-frame-color'] = frameColor.value;
    base.border = '2px solid var(--avatar-frame-color)';
  }
  return base;
});

const onAvatarClick = (event: Event) => {
  if (!props.previewable || !props.avatar) return;
  event.preventDefault();
  event.stopPropagation();
  openImagePreview(props.avatar, { mode: 'simple' });
};
</script>

<template>
  <div
    class="avatar-with-frame relative inline-flex shrink-0 items-center justify-center rounded-full bg-base-300"
    :class="{
      'has-frame': !frameArt && frameColor,
      'has-frame-art': !!frameArt,
      'ring-2 ring-primary/20': !frameColor && !frameArt,
      'cursor-zoom-in': previewable && avatar,
    }"
    :style="wrapperStyle"
    :title="previewable && avatar ? `查看头像：${alt || frame?.name || ''}` : frame?.name || alt"
    :role="previewable && avatar ? 'button' : undefined"
    :tabindex="previewable && avatar ? 0 : undefined"
    @click="onAvatarClick"
    @keydown.enter.prevent="onAvatarClick"
    @keydown.space.prevent="onAvatarClick"
  >
    <img
      v-if="frameArt && frameArtStyle"
      class="avatar-frame-art pointer-events-none absolute left-1/2 top-1/2 z-0 max-w-none -translate-x-1/2 -translate-y-1/2"
      :src="frameArt.url"
      :style="frameArtStyle"
      alt=""
      aria-hidden="true"
    >
    <img
      v-if="avatar"
      :src="avatar"
      :alt="alt"
      class="avatar-img relative z-10 h-full w-full rounded-full object-cover"
    >
    <div v-else class="avatar-img relative z-10 h-full w-full overflow-hidden rounded-full">
      <slot name="fallback" />
    </div>
  </div>
</template>

<style scoped>
  /* 图片框外圈柔和光晕（取装扮色，无色时用中性金） */
  .avatar-with-frame.has-frame-art {
    filter: drop-shadow(
      0 0 6px color-mix(in oklch, var(--avatar-frame-color, #d9a13c) 35%, transparent)
    );
  }

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
