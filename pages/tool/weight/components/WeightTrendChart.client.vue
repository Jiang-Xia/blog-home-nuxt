<!--
  体重趋势图：客户端按需动态 import echarts 核心 + 折线模块，避免整包打进首屏。
  配色对齐站点 tech / daisy 主题变量（--tech-fg*、--color-primary 等）。
-->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { EChartsType } from 'echarts/core';

const props = withDefaults(
  defineProps<{
    /** 横轴日期 YYYY-MM-DD */
    dates: string[];
    /** 与 dates 对齐的体重 kg */
    weights: number[];
    /** 目标体重参考线 */
    targetKg?: number;
    /** 图高 */
    height?: number;
  }>(),
  {
    dates: () => [],
    weights: () => [],
    targetKg: undefined,
    height: 280,
  },
);

const hostRef = ref<HTMLDivElement | null>(null);
let chart: EChartsType | null = null;
let resizeObs: ResizeObserver | null = null;
/** 上一次成功写入 series 的点数；长度剧变时关掉过渡动画，避免 interpolate1DArray 崩 */
let lastSeriesLen = 0;
/** 合并同帧多次 props 变更，只 setOption 一次 */
let paintQueued = false;
/** 复用探测节点：解析 var()/oklch/color-mix（canvas 自身不解 CSS 变量） */
let colorProbe: HTMLSpanElement | null = null;
/** 复用 2d context：把任意 CSS 色归一成 ECharts 能解析的 legacy hex/rgba */
let colorCtx: CanvasRenderingContext2D | null = null;

/**
   * 清洗并截齐 dates/weights：去掉非有限体重，避免折线 data 出现 undefined/NaN。
   */
const seriesPoints = computed(() => {
  const datesIn = Array.isArray(props.dates) ? props.dates : [];
  const weightsIn = Array.isArray(props.weights) ? props.weights : [];
  const n = Math.min(datesIn.length, weightsIn.length);
  const dates: string[] = [];
  const weights: number[] = [];
  for (let i = 0; i < n; i++) {
    const w = Number(weightsIn[i]);
    if (!Number.isFinite(w)) continue;
    dates.push(String(datesIn[i] ?? ''));
    weights.push(w);
  }
  return { dates, weights };
});

const hasData = computed(() => seriesPoints.value.dates.length > 0);

/**
   * ECharts/ZRender 只认 legacy `#rgb` / `rgb(r,g,b)` / `rgba(r,g,b,a)` / `hsl()`。
   * 现代 Chrome 的 getComputedStyle 常返回 oklch / 空格分隔 rgb，直接喂进去会
   * color.parse → undefined → addColorStop('undefined')，hover 时再炸 .length。
   * 流程：DOM 解析 CSS 色 → canvas fillStyle 回读成 hex/rgba → addColorStop 校验。
   */
function resolveCssColor(raw: string, fallback: string): string {
  const fb = fallback || '#22d3ee';
  if (!import.meta.client) return fb;
  const v = (raw || '').trim();
  if (!v) return fb;
  // 已是 ECharts 稳妥的逗号分隔格式则直接用
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return v;
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/i.test(v)) return v;
  if (/^hsla?\(\s*\d+(\.\d+)?\s*,\s*[\d.]+%\s*,\s*[\d.]+%/i.test(v)) return v;
  try {
    if (!colorProbe) {
      colorProbe = document.createElement('span');
      colorProbe.setAttribute('aria-hidden', 'true');
      colorProbe.style.cssText
        = 'position:fixed;left:-9999px;top:0;width:0;height:0;pointer-events:none;opacity:0;';
      document.body.appendChild(colorProbe);
    }
    // 先经 DOM 解析 var()/oklch/color-mix（继承 html 上的主题变量）
    colorProbe.style.color = v;
    const computed = getComputedStyle(colorProbe).color;
    const candidate
      = computed && computed !== 'rgba(0, 0, 0, 0)' && computed !== 'transparent' ? computed : v;

    if (!colorCtx) {
      colorCtx = document.createElement('canvas').getContext('2d');
    }
    const ctx = colorCtx;
    if (!ctx) return fb;
    // 哨兵色：设置失败时 fillStyle 保持原值；成功时浏览器常序列化为 #hex / rgba()
    ctx.fillStyle = '#123456';
    ctx.fillStyle = candidate;
    let normalized = ctx.fillStyle;
    if (!normalized || normalized === '#123456') return fb;
    // 少数环境仍回写 oklch/color()：拒收
    if (/oklch|oklab|color-mix|^color\(/i.test(normalized)) return fb;
    // 现代空格分隔 rgb(r g b / a) → 逗号 rgba，ECharts color.parse 只认后者
    const modern = normalized.match(
      /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i,
    );
    if (modern) {
      const alpha
        = modern[4] == null
          ? 1
          : modern[4].endsWith('%')
            ? Number(modern[4].slice(0, -1)) / 100
            : Number(modern[4]);
      normalized = `rgba(${modern[1]},${modern[2]},${modern[3]},${Number.isFinite(alpha) ? alpha : 1})`;
    }
    else if (!/^#/.test(normalized) && !/^rgba?\(\s*\d+\s*,/.test(normalized)) {
      return fb;
    }
    try {
      const g = ctx.createLinearGradient(0, 0, 1, 0);
      g.addColorStop(0, normalized);
    }
    catch {
      return fb;
    }
    return normalized;
  }
  catch {
    return fb;
  }
}

/** 是否亮色壳（cyber-light 等）；决定 ECharts 色值 fallback，避免亮底配深色字解析失败后落到深色 fallback */
function isLightShell(): boolean {
  const root = document.documentElement;
  const scheme = getComputedStyle(root).getPropertyValue('--tech-color-scheme').trim();
  if (scheme === 'light') return true;
  if (scheme === 'dark') return false;
  const theme = root.getAttribute('data-theme') || '';
  return theme === 'cyber-light' || theme.endsWith('-light') || theme === 'light';
}

/**
   * 读取主题色并转为 rgb，供 ECharts canvas / HTML tooltip 使用。
   * fallback 随亮暗主题切换，避免 cyber-light 下 tip 深底+深字看不清。
   */
function themeColors() {
  const light = isLightShell();
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    resolveCssColor(styles.getPropertyValue(name), fallback);
  return {
    fg: read('--tech-fg', light ? '#0f172a' : '#e2e8f0'),
    muted: read('--tech-fg-muted', light ? 'rgba(15,23,42,0.62)' : '#94a3b8'),
    faint: read('--tech-fg-faint', light ? 'rgba(15,23,42,0.4)' : '#64748b'),
    border: read('--tech-border', light ? 'rgba(15,23,42,0.18)' : 'rgba(148,163,184,0.35)'),
    primary: read('--color-primary', light ? '#0891b2' : '#22d3ee'),
    success: read('--color-success', light ? '#059669' : '#34d399'),
    base100: read('--color-base-100', light ? '#f8fafc' : '#0f172a'),
    base200: read('--color-base-200', light ? '#ffffff' : '#1e293b'),
    // tooltip 用实心底，不用半透明 glass，保证与画布分离
    tooltipBg: read('--tech-input-bg', light ? '#ffffff' : '#1e293b'),
    light,
  };
}

/**
   * 组装 option（体重折线 + 可选目标 markLine）。
   * @param animate 点数剧变（导入/切区间）时应为 false，避免 Animator 插值崩溃
   */
function buildOption(animate: boolean) {
  const { fg, muted, faint, border, primary, success, base100, tooltipBg, light } = themeColors();
  const { dates, weights } = seriesPoints.value;
  const categories = dates.map(d => d.slice(5));
  // 亮色 tip 加强描边与阴影，避免白底贴在浅色画布上看不清
  const tipBorder = light
    ? resolveCssColor(
        getComputedStyle(document.documentElement).getPropertyValue('--tech-input-border'),
        'rgba(15,23,42,0.22)',
      )
    : border;
  const tipShadow = light
    ? 'box-shadow:0 10px 28px rgba(15,23,42,0.14);'
    : 'box-shadow:0 10px 28px rgba(0,0,0,0.35);';
    // 标签放在绘图区内侧顶部，避免被 grid 右边界裁切
  const markLine
    = props.targetKg != null && Number.isFinite(props.targetKg)
      ? {
          silent: true,
          symbol: 'none',
          animation: false,
          lineStyle: { type: 'dashed' as const, color: success, width: 1.5, opacity: 0.9 },
          label: {
            show: true,
            position: 'insideEndTop' as const,
            formatter: `目标 ${Number(props.targetKg).toFixed(1)} kg`,
            color: success,
            fontSize: 11,
            distance: [0, 8],
            padding: [2, 6],
            backgroundColor: base100,
            borderRadius: 4,
          },
          data: [{ yAxis: props.targetKg }],
        }
      : undefined;

  return {
    backgroundColor: 'transparent',
    animation: animate,
    animationDuration: animate ? 420 : 0,
    animationDurationUpdate: 0,
    animationEasing: 'cubicOut',
    // 右侧略留白，insideEndTop 标签也不贴边
    grid: { left: 52, right: 20, top: 44, bottom: 32, containLabel: false },
    tooltip: {
      trigger: 'axis' as const,
      // 实心底 + 主题字色；勿用半透明 base-200，亮色下易融进画布或 fallback 成深底深字
      backgroundColor: tooltipBg,
      borderColor: tipBorder,
      borderWidth: light ? 1.5 : 1,
      padding: [8, 12],
      textStyle: { color: fg, fontSize: 12 },
      extraCssText: `${tipShadow}opacity:1;backdrop-filter:none;`,
      // 关 axisPointer 阴影层，减少 hover 时额外 graphic 动画
      axisPointer: {
        type: 'line' as const,
        animation: false,
        lineStyle: { color: border, type: 'dashed' as const, width: 1 },
      },
      valueFormatter: (v: unknown) => `${Number(v).toFixed(1)} kg`,
    },
    legend: {
      top: 4,
      right: 4,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 4,
      textStyle: { color: muted, fontSize: 12 },
      data: ['体重'],
    },
    xAxis: {
      type: 'category' as const,
      data: categories,
      boundaryGap: false,
      axisLine: { lineStyle: { color: border, width: 1 } },
      axisLabel: {
        color: muted,
        fontSize: 11,
        hideOverlap: true,
        margin: 10,
      },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      scale: true,
      splitNumber: 4,
      axisLabel: {
        color: muted,
        fontSize: 11,
        formatter: (v: number) => v.toFixed(1),
        margin: 8,
      },
      splitLine: {
        lineStyle: { color: border, type: 'dashed' as const, opacity: 0.55 },
      },
      axisLine: { show: false },
      axisTick: { show: false },
      name: 'kg',
      nameTextStyle: { color: faint, fontSize: 11, padding: [0, 0, 0, 4] },
    },
    series: [
      {
        name: '体重',
        type: 'line' as const,
        smooth: weights.length > 60 ? false : 0.2,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: weights.length <= 28,
        // hover 只亮当前点；显式写色，避免 ZRender 对非法色做动画插值崩图
        emphasis: {
          disabled: false,
          scale: false,
          focus: 'none' as const,
          itemStyle: { color: primary, borderColor: base100, borderWidth: 2 },
          lineStyle: { color: primary, width: 2.4 },
          areaStyle: { opacity: 0.28 },
        },
        blur: {
          lineStyle: { opacity: 1 },
          areaStyle: { opacity: 0.22 },
          itemStyle: { opacity: 1 },
        },
        data: weights,
        lineStyle: { width: 2.4, color: primary },
        itemStyle: {
          color: primary,
          borderColor: base100,
          borderWidth: 1.5,
        },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            // 两端都必须是 ECharts 可解析色；transparent 会变成 undefined
            colorStops: [
              { offset: 0, color: primary },
              { offset: 1, color: 'rgba(0,0,0,0)' },
            ],
          },
          opacity: 0.22,
        },
        markLine,
      },
    ],
  };
}

/**
   * 按需加载 echarts 并写入 option。
   * 必须在 Vue flush 之外调用（见 schedulePaint），否则会触发
   * 「setOption should not be called during main process」。
   */
async function ensureChart() {
  if (!import.meta.client || !hostRef.value) return;
  if (!chart) {
    const echarts = await import('echarts/core');
    const { LineChart } = await import('echarts/charts');
    const { GridComponent, TooltipComponent, LegendComponent, MarkLineComponent }
      = await import('echarts/components');
    const { CanvasRenderer } = await import('echarts/renderers');
    echarts.use([
      LineChart,
      GridComponent,
      TooltipComponent,
      LegendComponent,
      MarkLineComponent,
      CanvasRenderer,
    ]);
    chart = echarts.init(hostRef.value, undefined, { renderer: 'canvas' });
  }
  if (!hasData.value) {
    chart.clear();
    lastSeriesLen = 0;
    return;
  }
  const nextLen = seriesPoints.value.weights.length;
  // 点数变化或数据较多时关过渡；lazyUpdate 会在 hover flush 时再次踩 Animator
  const animate = lastSeriesLen > 0 && nextLen === lastSeriesLen && nextLen <= 40;
  if (!animate) {
    chart.clear();
  }
  chart.setOption(buildOption(animate), { notMerge: true });
  lastSeriesLen = nextLen;
}

/**
   * 推迟到 nextTick + rAF，避开 Vue 组件更新主流程里同步 setOption。
   */
function schedulePaint() {
  if (paintQueued) return;
  paintQueued = true;
  void nextTick(() => {
    requestAnimationFrame(() => {
      paintQueued = false;
      void ensureChart();
    });
  });
}

/** 窗口/容器尺寸变化时重绘 */
function onResize() {
  chart?.resize();
}

/** 主题 class 变化时重配色（html.dark / data-theme） */
function onThemeMutation() {
  schedulePaint();
}

let themeObs: MutationObserver | null = null;

onMounted(() => {
  schedulePaint();
  if (hostRef.value) {
    resizeObs = new ResizeObserver(() => onResize());
    resizeObs.observe(hostRef.value);
  }
  window.addEventListener('resize', onResize);
  themeObs = new MutationObserver(onThemeMutation);
  themeObs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme', 'style'],
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  resizeObs?.disconnect();
  resizeObs = null;
  themeObs?.disconnect();
  themeObs = null;
  chart?.dispose();
  chart = null;
  lastSeriesLen = 0;
  colorProbe?.remove();
  colorProbe = null;
  colorCtx = null;
});

watch(
  () => [props.dates, props.weights, props.targetKg] as const,
  () => {
    schedulePaint();
  },
  { deep: true },
);
</script>

<template>
  <div class="weight-chart">
    <div
      ref="hostRef"
      class="weight-chart__canvas"
      :style="{ height: `${height}px` }"
      role="img"
      aria-label="体重趋势折线图"
    />
    <p v-if="!hasData" class="weight-chart__empty">
      暂无数据，点击「记录体重」开始打卡
    </p>
  </div>
</template>

<style scoped>
  .weight-chart {
    position: relative;
    width: 100%;
  }

  .weight-chart__canvas {
    width: 100%;
    min-height: 200px;
  }

  .weight-chart__empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    font-size: 0.875rem;
    color: var(--tech-fg-faint);
    pointer-events: none;
  }
</style>
