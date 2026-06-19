<!--
  音频可视化工具页：Web Audio API 分析 `<audio>` 元素，Canvas 绘制频谱柱或波形。
  默认示例音频来自站点静态资源；支持用户上传本地音频文件。
-->
<template>
  <CyberToolCard title="音频可视化" desc="播放本地或示例音频，实时展示频谱与波形">
    <section class="mb-4 space-y-3">
      <div class="crypto-toolbar flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept="audio/*"
          class="file-input file-input-bordered login-input max-w-xs"
          @change="onFilePick"
        >
        <div class="join shrink-0">
          <button
            type="button"
            class="btn btn-sm join-item"
            :class="vizMode === 'frequency' ? 'btn-primary' : 'btn-outline'"
            @click="vizMode = 'frequency'"
          >
            频谱柱
          </button>
          <button
            type="button"
            class="btn btn-sm join-item"
            :class="vizMode === 'waveform' ? 'btn-primary' : 'btn-outline'"
            @click="vizMode = 'waveform'"
          >
            波形
          </button>
        </div>
        <select
          v-model="colorTheme"
          class="select select-bordered select-sm w-auto min-w-[6.5rem] bg-[var(--tech-input-bg)] text-tech"
        >
          <option v-for="t in themeOptions" :key="t.value" :value="t.value">
            {{ t.label }}
          </option>
        </select>
        <CyberButton variant="secondary" class="!py-2 !text-sm" @click="toggleFullscreen">
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </CyberButton>
        <CyberButton
          v-if="audioSrc !== DEMO_MP3_SRC"
          variant="secondary"
          class="!py-2 !text-sm"
          @click="resetToDemo"
        >
          恢复示例
        </CyberButton>
      </div>

      <div class="flex flex-wrap items-center gap-4 text-sm text-tech-muted">
        <label class="flex min-w-[10rem] flex-1 items-center gap-2">
          <span class="shrink-0">灵敏度</span>
          <input
            v-model.number="gain"
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            class="range range-primary range-xs flex-1"
          >
          <span class="w-8 shrink-0 text-right tabular-nums">{{ gain.toFixed(1) }}×</span>
        </label>
        <label class="flex min-w-[10rem] flex-1 items-center gap-2">
          <span class="shrink-0">平滑</span>
          <input
            v-model.number="smoothing"
            type="range"
            min="0"
            max="0.95"
            step="0.05"
            class="range range-primary range-xs flex-1"
            @input="applySmoothing"
          >
          <span class="w-8 shrink-0 text-right tabular-nums">{{ smoothing.toFixed(2) }}</span>
        </label>
      </div>

      <audio
        :key="audioKey"
        ref="audioRef"
        controls
        :src="audioSrc"
        class="w-full max-w-full"
        @play="onPlay"
        @pause="onPause"
        @ended="onPause"
      />
      <p v-if="hintText" class="text-sm text-tech-muted">
        {{ hintText }}
      </p>
    </section>

    <section
      ref="canvasWrapRef"
      class="relative overflow-hidden rounded-lg border border-tech bg-[var(--tech-input-bg)]"
      :class="{ 'fixed inset-0 z-50 rounded-none border-0': isFullscreen }"
      :style="{ height: `${canvasHeight}px` }"
    >
      <canvas ref="canvasRef" class="block h-full w-full" />
      <button
        v-if="isFullscreen"
        type="button"
        class="btn btn-sm btn-ghost absolute right-3 top-3 text-tech"
        @click="toggleFullscreen"
      >
        退出全屏
      </button>
    </section>
  </CyberToolCard>
</template>

<script setup lang="ts">
/** 站点托管的示例 MP3（路径须为 /v1/static/…） */
const DEMO_MP3_SRC
  = 'https://jiang-xia.top/x-blog/api/v1/static/uploads/2024-03/eqiic4bsyyu39pd95y7eh9-江南-林俊杰.128.mp3';

type VizMode = 'frequency' | 'waveform';
type ColorTheme = 'cyber' | 'neon' | 'sunset' | 'frost';

interface ThemePalette {
  low: string;
  high: string;
  stroke: string;
  bg: string;
}

const COLOR_THEMES: Record<ColorTheme, ThemePalette> = {
  cyber: {
    low: 'rgb(80, 50, 220)',
    high: 'rgb(180, 120, 255)',
    stroke: 'rgb(140, 100, 255)',
    bg: 'rgba(0, 0, 0, 0.15)',
  },
  neon: {
    low: 'rgb(0, 180, 120)',
    high: 'rgb(80, 255, 220)',
    stroke: 'rgb(60, 230, 180)',
    bg: 'rgba(0, 0, 0, 0.2)',
  },
  sunset: {
    low: 'rgb(220, 80, 40)',
    high: 'rgb(255, 180, 80)',
    stroke: 'rgb(255, 140, 60)',
    bg: 'rgba(30, 10, 0, 0.2)',
  },
  frost: {
    low: 'rgb(60, 120, 220)',
    high: 'rgb(200, 230, 255)',
    stroke: 'rgb(160, 200, 255)',
    bg: 'rgba(0, 20, 40, 0.2)',
  },
};

const themeOptions: { value: ColorTheme; label: string }[] = [
  { value: 'cyber', label: '赛博紫' },
  { value: 'neon', label: '霓虹绿' },
  { value: 'sunset', label: '落日橙' },
  { value: 'frost', label: '冰霜蓝' },
];

const canvasWrapRef = ref<HTMLElement>();
const canvasRef = ref<HTMLCanvasElement>();
const audioRef = ref<HTMLAudioElement>();

const audioSrc = ref(DEMO_MP3_SRC);
const audioKey = ref(0);
const vizMode = ref<VizMode>('frequency');
const colorTheme = ref<ColorTheme>('cyber');
const gain = ref(1.5);
const smoothing = ref(0.85);
const isFullscreen = ref(false);
const isPlaying = ref(false);
const loadError = ref(false);

const canvasHeight = computed(() => (isFullscreen.value ? window.innerHeight : 240));

let objectUrl: string | null = null;
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let freqData: Uint8Array<ArrayBuffer> | null = null;
let timeData: Uint8Array<ArrayBuffer> | null = null;
let rafId = 0;
let resizeObserver: ResizeObserver | null = null;

const hintText = computed(() => {
  if (loadError.value) {
    return '音频加载失败，请检查网络或换用本地文件。';
  }
  if (!isPlaying.value) {
    return '点击播放按钮开始可视化（浏览器需允许音频播放）。';
  }
  return '';
});

/** 当前选中的配色方案 */
function currentPalette(): ThemePalette {
  return COLOR_THEMES[colorTheme.value];
}

/** 销毁 Web Audio 图与本地 blob URL，供换源或卸载时调用 */
function teardownAudioGraph() {
  cancelAnimationFrame(rafId);
  rafId = 0;
  analyser = null;
  freqData = null;
  timeData = null;
  if (audioCtx) {
    void audioCtx.close();
    audioCtx = null;
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  isPlaying.value = false;
}

/** 按容器宽度与 DPR 设置 Canvas 像素尺寸，避免模糊与拉伸 */
function resizeCanvas() {
  const wrap = canvasWrapRef.value;
  const canvas = canvasRef.value;
  if (!wrap || !canvas) {
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  const width = wrap.clientWidth;
  const height = canvasHeight.value;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/** 同步 AnalyserNode 平滑系数（滑块实时生效） */
function applySmoothing() {
  if (analyser) {
    analyser.smoothingTimeConstant = smoothing.value;
  }
}

/** 首次播放时创建 AnalyserNode；同一 audio 元素只能 createMediaElementSource 一次 */
async function ensureAnalyser(audioEl: HTMLAudioElement) {
  if (analyser && audioCtx) {
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    return;
  }
  audioCtx = new AudioContext();
  const source = audioCtx.createMediaElementSource(audioEl);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = smoothing.value;
  freqData = new Uint8Array(analyser.frequencyBinCount);
  timeData = new Uint8Array(analyser.fftSize);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
}

/** 绘制频谱柱状图（对称镜像，高度按 Canvas 比例缩放） */
function drawFrequency(ctx: CanvasRenderingContext2D, width: number, height: number) {
  if (!analyser || !freqData) {
    return;
  }
  const palette = currentPalette();
  analyser.getByteFrequencyData(freqData);
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  const barCount = 96;
  const step = Math.floor(freqData.length / barCount);
  const gap = 2;
  const barWidth = (width - gap * (barCount - 1)) / barCount;

  for (let i = 0; i < barCount; i++) {
    const raw = (freqData[i * step] ?? 0) / 255;
    const value = Math.min(1, raw * gain.value);
    const barHeight = value * height * 0.9;
    const x = i * (barWidth + gap);
    const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
    gradient.addColorStop(0, palette.low);
    gradient.addColorStop(1, palette.high);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    ctx.fillRect(x, 0, barWidth, barHeight * 0.35);
  }
}

/** 绘制时域波形 */
function drawWaveform(ctx: CanvasRenderingContext2D, width: number, height: number) {
  if (!analyser || !timeData) {
    return;
  }
  const palette = currentPalette();
  analyser.getByteTimeDomainData(timeData);
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  const midY = height / 2;
  const amplitude = (height / 2) * Math.min(1, gain.value / 1.5);

  ctx.lineWidth = 2;
  ctx.strokeStyle = palette.stroke;
  ctx.beginPath();
  const sliceWidth = width / timeData.length;
  let x = 0;
  for (let i = 0; i < timeData.length; i++) {
    const v = ((timeData[i] ?? 128) - 128) / 128;
    const y = midY + v * amplitude;
    if (i === 0) {
      ctx.moveTo(x, y);
    }
    else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width, midY);
  ctx.stroke();
}

/** requestAnimationFrame 渲染循环，仅在播放中运行 */
function drawFrame() {
  const canvas = canvasRef.value;
  if (!canvas || !isPlaying.value) {
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;

  if (vizMode.value === 'frequency') {
    drawFrequency(ctx, width, height);
  }
  else {
    drawWaveform(ctx, width, height);
  }
  rafId = requestAnimationFrame(drawFrame);
}

/** 用户点击播放：初始化 Analyser 并启动绘制 */
async function onPlay() {
  const audioEl = audioRef.value;
  if (!audioEl) {
    return;
  }
  loadError.value = false;
  try {
    await ensureAnalyser(audioEl);
    isPlaying.value = true;
    cancelAnimationFrame(rafId);
    drawFrame();
  }
  catch {
    loadError.value = true;
    isPlaying.value = false;
  }
}

/** 暂停或结束时停止动画帧，保留最后一帧画面 */
function onPause() {
  isPlaying.value = false;
  cancelAnimationFrame(rafId);
  rafId = 0;
}

/** 选择本地音频：换源需 remount audio 元素并重建 AudioContext */
function onFilePick(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) {
    return;
  }
  teardownAudioGraph();
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }
  objectUrl = URL.createObjectURL(file);
  audioSrc.value = objectUrl;
  audioKey.value += 1;
  loadError.value = false;
}

/** 切回站点示例音频 */
function resetToDemo() {
  teardownAudioGraph();
  audioSrc.value = DEMO_MP3_SRC;
  audioKey.value += 1;
  loadError.value = false;
}

/** 切换 Canvas 区域全屏，全屏时撑满视口高度 */
async function toggleFullscreen() {
  const wrap = canvasWrapRef.value;
  if (!wrap) {
    return;
  }
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    else {
      await wrap.requestFullscreen();
    }
  }
  catch {
    // 部分浏览器/嵌入环境不支持 Fullscreen API
  }
}

/** 监听全屏状态变化并重算 Canvas 尺寸 */
function onFullscreenChange() {
  isFullscreen.value = document.fullscreenElement === canvasWrapRef.value;
  nextTick(() => resizeCanvas());
}

watch(canvasHeight, () => {
  nextTick(() => resizeCanvas());
});

onMounted(() => {
  resizeCanvas();
  resizeObserver = new ResizeObserver(() => resizeCanvas());
  if (canvasWrapRef.value) {
    resizeObserver.observe(canvasWrapRef.value);
  }
  document.addEventListener('fullscreenchange', onFullscreenChange);
  const audioEl = audioRef.value;
  if (audioEl) {
    audioEl.addEventListener('error', () => {
      loadError.value = true;
    });
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  if (document.fullscreenElement === canvasWrapRef.value) {
    void document.exitFullscreen();
  }
  teardownAudioGraph();
});
</script>
