<script setup lang="ts">
/**
   * 首页侧栏：时钟 + 天气合一卡片（对齐小米桌面风设计稿）
   * - 左：星期胶囊 + 时（实心）/ 分（描边）
   * - 右：月日 + 天气图标 + 温度与文案（API label）
   * - 天气：客户端 GET /api/weather-by-ip；失败时右侧占位（静态图卡由 article-list 单独保留）
   * - 展示文案只用接口字段，禁止本地 dict 回显天气名
   */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const;

/** 与 server/api/weather-by-ip 返回体对齐 */
interface WeatherByIpResult {
  ip: string;
  geo: {
    city: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    source: string;
  };
  weather: {
    temperature: number;
    weatherCode: number;
    label: string;
    humidity: number;
    windSpeed: number;
    time: string;
  };
  buff: { label: string; expBoost: number; weather: string } | null;
  fallback: boolean;
}

const now = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

const loading = ref(true);
const errored = ref(false);
const payload = ref<WeatherByIpResult | null>(null);

/** 补零两位 */
const pad2 = (n: number) => String(n).padStart(2, '0');

const hours = computed(() => pad2(now.value.getHours()));
const minutes = computed(() => pad2(now.value.getMinutes()));

/** 月/日，如 07/21 */
const dateMd = computed(() => {
  const d = now.value;
  return `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
});

const weekday = computed(() => WEEKDAYS[now.value.getDay()]);

const tempText = computed(() => {
  const t = payload.value?.weather.temperature;
  if (typeof t !== 'number') return '--°C';
  return `${Math.round(t)}°C`;
});

const weatherLabel = computed(() => payload.value?.weather.label ?? '');

/**
   * 图标形态（非文案）：按 WMO code 选 SVG 变体；文案仍用 API label
   * clear / cloudy / rain / snow / fog / storm
   */
const iconKind = computed(() => {
  const code = payload.value?.weather.weatherCode;
  if (code === undefined) return 'cloudy' as const;
  if (code === 0 || code === 1) return 'clear' as const;
  if (code === 2 || code === 3) return 'cloudy' as const;
  if (code === 45 || code === 48) return 'fog' as const;
  if (code >= 51 && code <= 67) return 'rain' as const;
  if (code >= 71 && code <= 77) return 'snow' as const;
  if (code >= 80 && code <= 82) return 'rain' as const;
  if (code === 85 || code === 86) return 'snow' as const;
  if (code >= 95) return 'storm' as const;
  return 'cloudy' as const;
});

/** 每秒刷新，保证整分切换及时 */
const tick = () => {
  now.value = new Date();
};

/** 拉取 IP 天气；失败则展示原静态图，不打断侧栏 */
const loadWeather = async () => {
  loading.value = true;
  errored.value = false;
  try {
    payload.value = await $fetch<WeatherByIpResult>('/api/weather-by-ip');
  }
  catch {
    errored.value = true;
    payload.value = null;
  }
  finally {
    loading.value = false;
  }
};

onMounted(() => {
  tick();
  timer = setInterval(tick, 1000);
  void loadWeather();
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div
    class="tw-card cyber-glass-card !rounded-2xl w-full"
    role="region"
    :aria-label="`${hours}:${minutes}，${dateMd} ${weekday}${weatherLabel ? `，${tempText} ${weatherLabel}` : ''}`"
  >
    <!-- 左：星期 + 时分 -->
    <div class="tw-card__left" aria-hidden="true">
      <span class="tw-card__weekday">{{ weekday }}</span>
      <div class="tw-card__time">
        <span class="tw-card__hours">{{ hours }}</span>
        <span class="tw-card__minutes">{{ minutes }}</span>
      </div>
    </div>

    <!-- 右：日期 + 天气 / 失败回退原图 -->
    <div class="tw-card__right" aria-hidden="true">
      <span class="tw-card__date">{{ dateMd }}</span>

      <template v-if="loading">
        <div class="tw-card__weather-state text-tech-subtle">
          …
        </div>
      </template>
      <template v-else-if="errored || !payload">
        <div class="tw-card__weather-state text-tech-subtle">
          暂无
        </div>
      </template>
      <template v-else>
        <div class="tw-card__icon" :data-kind="iconKind">
          <!-- clear：实心圆 + 橙色射线（对齐设计稿） -->
          <svg v-if="iconKind === 'clear'" viewBox="0 0 48 48" class="tw-card__svg">
            <circle cx="24" cy="24" r="9" fill="currentColor" />
            <g stroke="#f2994a" stroke-width="3.2" stroke-linecap="round">
              <line x1="24" y1="4" x2="24" y2="10" />
              <line x1="24" y1="38" x2="24" y2="44" />
              <line x1="4" y1="24" x2="10" y2="24" />
              <line x1="38" y1="24" x2="44" y2="24" />
              <line x1="9.8" y1="9.8" x2="14" y2="14" />
              <line x1="34" y1="34" x2="38.2" y2="38.2" />
              <line x1="9.8" y1="38.2" x2="14" y2="34" />
              <line x1="34" y1="14" x2="38.2" y2="9.8" />
            </g>
          </svg>
          <!-- cloudy：云 -->
          <svg v-else-if="iconKind === 'cloudy'" viewBox="0 0 48 48" class="tw-card__svg">
            <path
              fill="currentColor"
              d="M34.5 36H14a8 8 0 01-1.2-15.9A11 11 0 0134.8 16 7.5 7.5 0 0134.5 36z"
            />
          </svg>
          <!-- rain：云 + 雨滴 -->
          <svg v-else-if="iconKind === 'rain'" viewBox="0 0 48 48" class="tw-card__svg">
            <path
              fill="currentColor"
              d="M34.5 28H14a8 8 0 01-1.2-15.9A11 11 0 0134.8 8 7.5 7.5 0 0134.5 28z"
            />
            <g stroke="#4ea1ff" stroke-width="2.4" stroke-linecap="round">
              <line x1="16" y1="34" x2="14" y2="42" />
              <line x1="24" y1="34" x2="22" y2="42" />
              <line x1="32" y1="34" x2="30" y2="42" />
            </g>
          </svg>
          <!-- snow：云 + 雪点 -->
          <svg v-else-if="iconKind === 'snow'" viewBox="0 0 48 48" class="tw-card__svg">
            <path
              fill="currentColor"
              d="M34.5 28H14a8 8 0 01-1.2-15.9A11 11 0 0134.8 8 7.5 7.5 0 0134.5 28z"
            />
            <g fill="#8ec8ff">
              <circle cx="16" cy="36" r="2" />
              <circle cx="24" cy="40" r="2" />
              <circle cx="32" cy="36" r="2" />
            </g>
          </svg>
          <!-- fog：横线 -->
          <svg v-else-if="iconKind === 'fog'" viewBox="0 0 48 48" class="tw-card__svg">
            <g stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.85">
              <line x1="10" y1="18" x2="38" y2="18" />
              <line x1="8" y1="26" x2="40" y2="26" />
              <line x1="12" y1="34" x2="36" y2="34" />
            </g>
          </svg>
          <!-- storm：云 + 闪电 -->
          <svg v-else viewBox="0 0 48 48" class="tw-card__svg">
            <path
              fill="currentColor"
              d="M34.5 26H14a8 8 0 01-1.2-15.9A11 11 0 0134.8 6 7.5 7.5 0 0134.5 26z"
            />
            <path fill="#f2c94c" d="M26 28l-8 10h6l-2 8 10-12h-6l2-6z" />
          </svg>
        </div>
        <div class="tw-card__weather-text">
          <span>{{ tempText }}</span>
          <span>{{ weatherLabel }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="less">
  .tw-card {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    min-height: 112px;
    box-sizing: border-box;
    padding: 0.95rem 1.15rem 0.95rem 1.05rem;
    user-select: none;
  }

  .tw-card__left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.35rem;
    min-width: 0;
  }

  .tw-card__weekday {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.75rem;
    padding: 0.2rem 0.7rem;
    border-radius: 999px;
    background: var(--color-primary);
    color: var(--color-primary-content, #fff);
    font-size: 0.78rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.04em;
  }

  .tw-card__time {
    display: flex;
    align-items: center;
    line-height: 0.9;
    font-variant-numeric: tabular-nums;
    font-family:
      'Arial Narrow', 'Helvetica Neue Condensed', 'DIN Alternate', 'Segoe UI Condensed',
      'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-weight: 800;
    font-stretch: condensed;
    letter-spacing: -0.04em;
  }

  .tw-card__hours,
  .tw-card__minutes {
    font-size: clamp(2.8rem, 7.5vw, 3.4rem);
  }

  .tw-card__hours {
    color: var(--tech-fg);
  }

  /* 分钟：描边空心，描边色跟主题前景 */
  .tw-card__minutes {
    color: transparent;
    -webkit-text-stroke: 2.4px var(--tech-fg);
    paint-order: stroke fill;
  }

  .tw-card__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    flex-shrink: 0;
    min-width: 5.5rem;
    padding-top: 0.1rem;
  }

  .tw-card__date {
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    line-height: 1;
    color: var(--tech-fg);
    font-variant-numeric: tabular-nums;
    font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  }

  .tw-card__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    color: var(--tech-fg);
    margin: 0.15rem 0;
  }

  .tw-card__svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .tw-card__weather-text {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--tech-fg);
    line-height: 1.2;
    white-space: nowrap;
  }

  .tw-card__weather-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 0.85rem;
  }
</style>
