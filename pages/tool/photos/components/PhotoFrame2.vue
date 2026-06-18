<script setup lang="ts">
import type { PhotoSettings } from '../constants';
import {
  calcDisplayRect,
  drawPreviewBlurBackground,
  formatExposureText,
  getExifDisplayName,
  loadBrandLogo,
  loadPreviewBitmap,
} from '../photo-renderer';
import { debounce } from '~~/utils/index';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  settings: {
    type: Object as () => PhotoSettings,
    required: true,
  },
  exif: {
    type: Object as () => Record<string, string>,
    default: () => ({}),
  },
});

const wrapRef = ref<HTMLDivElement | null>(null);
const blurCanvasRef = ref<HTMLCanvasElement | null>(null);
const cachedLogo = ref<HTMLImageElement | null>(null);

let cachedSrc = '';
let cachedLogoBrand = '';
let imgWidth = 0;
let imgHeight = 0;
let blurGeneration = 0;

const mainStyle = ref<Record<string, string>>({});
const exifPanelStyle = ref<Record<string, string>>({});
const showBlurLayer = computed(() => props.settings.blur > 0);

const exifDisplayName = computed(() => getExifDisplayName(props.exif));
const exifExposure = computed(() => formatExposureText(props.exif));
const showExifPanel = computed(
  () => props.settings.showExif && (exifDisplayName.value || exifExposure.value),
);

const assignStyle = (target: Ref<Record<string, string>>, next: Record<string, string>) => {
  const prev = target.value;
  if (Object.keys(next).every(key => prev[key] === next[key])) return;
  target.value = next;
};

const getSize = () => {
  const rect = wrapRef.value?.getBoundingClientRect();
  return {
    width: Math.max(Math.floor(rect?.width || 640), 320),
    height: Math.max(Math.floor(rect?.height || 400), 280),
  };
};

const applyLayout = () => {
  if (!imgWidth || !imgHeight) return;

  const layout = calcDisplayRect(
    imgWidth,
    imgHeight,
    getSize().width,
    getSize().height,
    props.settings.padding,
  );

  assignStyle(mainStyle, {
    left: `${layout.displayX}px`,
    top: `${layout.displayY}px`,
    width: `${layout.displayWidth}px`,
    height: `${layout.displayHeight}px`,
    borderRadius: `${props.settings.borderRadius}px`,
    boxShadow:
        props.settings.shadow > 0 ? `0 6px ${props.settings.shadow}px rgba(0, 0, 0, 0.55)` : 'none',
  });

  const panelY = layout.displayY + layout.displayHeight - (exifExposure.value ? 56 : 36);
  assignStyle(exifPanelStyle, {
    left: `${layout.displayX + 12}px`,
    top: `${panelY}px`,
    maxWidth: `${Math.min(layout.displayWidth - 24, 280)}px`,
  });
};

const paintBlurLayer = async () => {
  const canvas = blurCanvasRef.value;
  if (!canvas || !props.src || props.settings.blur <= 0) return;

  const gen = ++blurGeneration;
  const size = getSize();
  canvas.width = size.width;
  canvas.height = size.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, size.width, size.height);
  await drawPreviewBlurBackground(ctx, props.src, size.width, size.height, props.settings.blur);

  if (gen !== blurGeneration || props.src !== cachedSrc) return;
};

const debouncedPaintBlur = debounce(() => {
  void paintBlurLayer();
}, 120);

const ensureImageMeta = async (src: string) => {
  if (cachedSrc === src && imgWidth > 0) return;
  cachedSrc = src;
  const bitmap = await loadPreviewBitmap(src);
  imgWidth = bitmap.width;
  imgHeight = bitmap.height;
};

const ensureLogo = async (settings: PhotoSettings, exif: Record<string, string>) => {
  if (cachedLogoBrand === settings.logoBrand) return;
  cachedLogoBrand = settings.logoBrand;
  cachedLogo.value = await loadBrandLogo(exif.Make || '', settings.logoBrand);
};

const syncFrame = async (src: string, settings: PhotoSettings, exif: Record<string, string>) => {
  if (!src) return;
  await ensureImageMeta(src);
  await ensureLogo(settings, exif);
  applyLayout();
  if (settings.blur > 0) await paintBlurLayer();
};

watch(
  () => props.src,
  (src, prev) => {
    if (!src || src === prev) return;
    cachedLogoBrand = '';
    cachedLogo.value = null;
    void syncFrame(src, props.settings, props.exif);
  },
);

watch(
  () => [
    props.settings.padding,
    props.settings.borderRadius,
    props.settings.shadow,
    props.settings.showExif,
  ],
  () => {
    if (!props.src || !imgWidth) return;
    applyLayout();
  },
);

watch(
  () => props.settings.blur,
  () => {
    if (!props.src || !imgWidth) return;
    debouncedPaintBlur();
  },
);

watch(
  () => props.settings.logoBrand,
  () => {
    if (!props.src) return;
    cachedLogoBrand = '';
    void ensureLogo(props.settings, props.exif);
  },
);

watch(
  () => [props.exif.Make, props.exif.Model, props.exif.FocalLengthIn35mmFilm, props.exif.FNumber],
  () => {
    if (!props.src || !imgWidth) return;
    applyLayout();
    void ensureLogo(props.settings, props.exif);
  },
);

let removeResizeListener: (() => void) | null = null;

onMounted(() => {
  if (props.src) void syncFrame(props.src, props.settings, props.exif);

  const onResize = debounce(() => {
    if (!props.src || !imgWidth) return;
    applyLayout();
    debouncedPaintBlur();
  }, 150);
  window.addEventListener('resize', onResize);
  removeResizeListener = () => window.removeEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  blurGeneration += 1;
  removeResizeListener?.();
});
</script>

<template>
  <div ref="wrapRef" class="photo-frame-wrap">
    <div class="photo-frame-gradient" />
    <canvas v-show="showBlurLayer" ref="blurCanvasRef" class="photo-frame-blur-canvas" />
    <img
      :src="src" class="photo-frame-main" :style="mainStyle"
      decoding="async"
      alt=""
    >
    <div v-if="showExifPanel" class="exif-panel" :style="exifPanelStyle">
      <img v-if="cachedLogo" :src="cachedLogo.src" class="exif-logo" alt="">
      <div class="exif-text">
        <p v-if="exifDisplayName" class="exif-brand">
          {{ exifDisplayName }}
        </p>
        <p v-if="exifExposure" class="exif-meta">
          {{ exifExposure }}
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .photo-frame-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 360px;
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid var(--tech-border);
    background: #0a0a12;
  }

  .photo-frame-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #0a0a12 0%, #12121f 55%, #080810 100%);
    pointer-events: none;
  }

  .photo-frame-blur-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.45;
    pointer-events: none;
  }

  .photo-frame-main {
    position: absolute;
    object-fit: contain;
    pointer-events: none;
  }

  .exif-panel {
    position: absolute;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(8, 8, 16, 0.88);
    pointer-events: none;
  }

  .exif-logo {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .exif-text {
    min-width: 0;
  }

  .exif-brand {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.3;
  }

  .exif-meta {
    margin: 2px 0 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
