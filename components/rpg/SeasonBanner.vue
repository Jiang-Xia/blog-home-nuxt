<script setup lang="ts">
import QRCode from 'qrcode';
import { shareActivityPoster } from '~~/api/rpg';
import { messageSuccess, messageError } from '~~/utils/toast';
import { captureHtmlElement } from '~~/utils/dom-capture';
import { originUrl } from '~~/config';
import type {
  CurrentActivitiesOverview,
  RpgActivitySummary,
  SharePosterResult,
} from '~~/types/rpg';

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  season: '赛季',
  festival: '节日',
  event: '限时',
};

const POSTER_TYPE_LABELS: Record<string, string> = {
  season: '赛季活动',
  festival: '节日活动',
  event: '限时活动',
};

const props = defineProps<{
  activityOverview: CurrentActivitiesOverview | null;
  weatherBuff: any;
}>();

const userInfo = useUserInfo();
const { playSfx } = useRpgAudio();
const { open: openImagePreview } = useImagePreview();
const AUTO_PLAY_MS = 5000;

const sharingCode = ref<string | null>(null);
const activeIndex = ref(0);
const isAutoPlayPaused = ref(false);
const posterRef = ref<HTMLElement>();
let autoPlayTimer: ReturnType<typeof setInterval> | null = null;
const qrContainerRef = ref<HTMLElement>();
const posterRenderData = ref<{
  posterUrl: string;
  activityName: string;
  activityCode: string;
  shareUrl: string;
  description: string;
  expBuffRate: number;
  activityType: string;
} | null>(null);

const effectiveExpBuffRate = computed(() => props.activityOverview?.effectiveExpBuffRate ?? 1);

/** 合并赛季 + 限时，赛季在前 */
const activityCards = computed<RpgActivitySummary[]>(() => {
  const overview = props.activityOverview;
  if (!overview) return [];
  const list: RpgActivitySummary[] = [];
  if (overview.season) list.push(overview.season);
  list.push(...overview.limitedTime);
  return list;
});

const hasMultiple = computed(() => activityCards.value.length > 1);

const activeActivity = computed(() => activityCards.value[activeIndex.value] ?? null);

watch(activityCards, (list) => {
  if (activeIndex.value >= list.length) activeIndex.value = 0;
  scheduleAutoPlay();
});

const clearAutoPlay = () => {
  if (autoPlayTimer !== null) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
};

const scheduleAutoPlay = () => {
  clearAutoPlay();
  if (activityCards.value.length <= 1) return;
  autoPlayTimer = setInterval(() => {
    if (isAutoPlayPaused.value) return;
    const len = activityCards.value.length;
    if (len <= 1) return;
    goToActivity((activeIndex.value + 1) % len, { auto: true });
  }, AUTO_PLAY_MS);
};

const pauseAutoPlay = () => {
  isAutoPlayPaused.value = true;
};

const resumeAutoPlay = () => {
  isAutoPlayPaused.value = false;
};

onMounted(() => {
  scheduleAutoPlay();
});

onUnmounted(() => {
  clearAutoPlay();
});

const activityTypeLabel = (type: string) => ACTIVITY_TYPE_LABELS[type] || '活动';

const posterTypeLabel = (type: string) => POSTER_TYPE_LABELS[type] || '限时活动';

const resolvePosterUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${originUrl}${url.startsWith('/') ? url : `/${url}`}`;
};

const goToActivity = (index: number, options?: { auto?: boolean }) => {
  if (index === activeIndex.value) return;
  activeIndex.value = index;
  if (!options?.auto) {
    void playSfx('uiClick');
    scheduleAutoPlay();
  }
};

const selectActivity = (index: number) => {
  goToActivity(index);
};

const prevActivity = () => {
  const len = activityCards.value.length;
  if (len <= 1) return;
  goToActivity((activeIndex.value - 1 + len) % len);
};

const nextActivity = () => {
  const len = activityCards.value.length;
  if (len <= 1) return;
  goToActivity((activeIndex.value + 1) % len);
};

const ensureLogin = async () => {
  if (!userInfo.value?.uid) {
    messageError('请先登录');
    await navigateTo('/login');
    return false;
  }
  return true;
};

const generateQrCode = async (url: string) => {
  if (!qrContainerRef.value) return;
  qrContainerRef.value.innerHTML = '';
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, url, { width: 120, margin: 1 });
  qrContainerRef.value.appendChild(canvas);
};

const waitForPosterImages = async (root: HTMLElement) => {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(
      img =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
};

const downloadPosterImage = async (res: SharePosterResult) => {
  posterRenderData.value = {
    posterUrl: resolvePosterUrl(res.posterUrl),
    activityName: res.activityName,
    activityCode: res.activityCode,
    shareUrl: res.shareUrl,
    description: res.description,
    expBuffRate: res.expBuffRate,
    activityType: res.activityType,
  };
  await nextTick();
  await generateQrCode(res.shareUrl);
  await nextTick();
  if (!posterRef.value) {
    throw new Error('海报渲染失败');
  }
  await waitForPosterImages(posterRef.value);
  const dataUrl = await captureHtmlElement(posterRef.value, {
    scale: 2,
    backgroundColor: '#1e1b4b',
  });
  const link = document.createElement('a');
  link.download = `${res.activityCode}-poster.png`;
  link.href = dataUrl;
  link.click();
};

const handleShare = async (activity: RpgActivitySummary) => {
  if (!(await ensureLogin())) return;
  sharingCode.value = activity.code;
  try {
    const res = await shareActivityPoster(activity.code);
    await downloadPosterImage(res);
    void playSfx('uiClick');
    messageSuccess(`${activity.name} 海报已下载`);
  }
  catch (e: any) {
    messageError(e?.message || '海报生成失败，请检查封面图是否可访问');
  }
  finally {
    sharingCode.value = null;
    posterRenderData.value = null;
  }
};

const previewPoster = (activity: RpgActivitySummary) => {
  const url = resolvePosterUrl(activity.posterUrl);
  if (!url) return;
  openImagePreview(url, { mode: 'simple' });
};
</script>

<template>
  <div
    v-if="activeActivity"
    class="activity-hub rpg-banner rounded-xl mb-4 overflow-hidden"
    @mouseenter="pauseAutoPlay"
    @mouseleave="resumeAutoPlay"
  >
    <!-- HUD：加成来源一览（类似手游顶部 Buff 条） -->
    <div class="activity-hud">
      <span class="activity-hud-label">活动加成</span>
      <div class="activity-hud-pills">
        <span v-if="weatherBuff" class="activity-hud-pill is-weather">
          🌤 {{ weatherBuff.label }}
        </span>
        <span class="activity-hud-pill is-effective">
          经验 ×{{ effectiveExpBuffRate }} 生效中
        </span>
      </div>
    </div>

    <!-- Hero 主视觉（单活动大图 / 多活动轮播） -->
    <div class="activity-hero">
      <div
        class="activity-hero-track"
        :style="{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }"
      >
        <div
          v-for="(activity, index) in activityCards"
          :key="activity.code"
          class="activity-hero-slide"
          :class="[
            activity.activityType === 'season' ? 'is-season' : 'is-limited',
            {
              'has-poster': !!resolvePosterUrl(activity.posterUrl),
              'is-current': index === activeIndex,
            },
          ]"
        >
          <button
            v-if="resolvePosterUrl(activity.posterUrl)"
            type="button"
            class="activity-hero-bg-btn"
            aria-label="查看活动海报大图"
            @click="previewPoster(activity)"
          >
            <img
              :src="resolvePosterUrl(activity.posterUrl)"
              alt=""
              crossorigin="anonymous"
              class="activity-hero-bg"
            >
          </button>
          <div
            class="activity-hero-overlay"
            :class="[
              activity.activityType === 'season' ? 'is-season' : 'is-limited',
              { 'has-poster': !!resolvePosterUrl(activity.posterUrl) },
            ]"
          />

          <div class="activity-hero-content-wrap">
            <span
              class="activity-hero-chip activity-hero-type hero-animate-item"
              :class="activity.activityType === 'season' ? 'is-season' : 'is-limited'"
            >
              {{ activityTypeLabel(activity.activityType) }}
            </span>
            <div
              :key="index === activeIndex ? `content-${activeIndex}` : activity.code"
              class="activity-hero-content"
            >
              <h3 class="activity-hero-title hero-animate-item">
                {{ activity.name }}
              </h3>
              <p class="activity-hero-desc hero-animate-item">
                {{ activity.description || '\u00A0' }}
              </p>
              <div class="activity-hero-actions hero-animate-item">
                <span
                  class="activity-hero-chip activity-hero-rate"
                  :class="activity.activityType === 'season' ? 'is-season' : 'is-limited'"
                >
                  ×{{ activity.expBuffRate }}
                </span>
                <button
                  type="button"
                  class="activity-hero-chip activity-hero-share is-action"
                  :class="activity.activityType === 'season' ? 'is-season' : 'is-limited'"
                  :disabled="sharingCode === activity.code"
                  @click="handleShare(activity)"
                >
                  {{ sharingCode === activity.code ? '生成中...' : '分享海报' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        v-if="hasMultiple"
        type="button"
        class="activity-hero-nav is-prev"
        aria-label="上一个活动"
        @click="prevActivity"
      >
        <svg class="activity-hero-nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M15 6l-6 6 6 6"
            fill="none"
            stroke="currentColor"
            stroke-width="2.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        v-if="hasMultiple"
        type="button"
        class="activity-hero-nav is-next"
        aria-label="下一个活动"
        @click="nextActivity"
      >
        <svg class="activity-hero-nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M9 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            stroke-width="2.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <div v-if="hasMultiple" class="activity-hero-dots">
        <button
          v-for="(item, index) in activityCards"
          :key="item.code"
          type="button"
          class="activity-hero-dot"
          :class="{ active: index === activeIndex }"
          :aria-label="`切换到${item.name}`"
          @click="selectActivity(index)"
        />
      </div>
    </div>

    <!-- 底部 Tab：多活动时快速切换（手游活动入口样式） -->
    <div v-if="hasMultiple" class="activity-tabs" role="tablist">
      <button
        v-for="(activity, index) in activityCards"
        :key="activity.code"
        type="button"
        role="tab"
        class="activity-tab"
        :class="{
          'active': index === activeIndex,
          'is-season': activity.activityType === 'season',
          'is-limited': activity.activityType !== 'season',
        }"
        :aria-selected="index === activeIndex"
        @click="selectActivity(index)"
      >
        <span class="activity-tab-thumb">
          <img
            v-if="resolvePosterUrl(activity.posterUrl)"
            :src="resolvePosterUrl(activity.posterUrl)"
            alt=""
            crossorigin="anonymous"
          >
          <span v-else class="activity-tab-emoji">
            {{ activity.activityType === 'season' ? '🏆' : '🎉' }}
          </span>
        </span>
        <span class="activity-tab-meta">
          <span class="activity-tab-name">{{ activity.name }}</span>
          <span class="activity-tab-rate">×{{ activity.expBuffRate }}</span>
        </span>
      </button>
    </div>
  </div>

  <!-- 屏幕外海报模板 -->
  <div v-if="posterRenderData" ref="posterRef" class="poster-canvas-template">
    <div class="poster-inner">
      <img
        v-if="posterRenderData.posterUrl"
        :src="posterRenderData.posterUrl"
        crossorigin="anonymous"
        alt=""
        class="poster-cover"
      >
      <div class="poster-body">
        <p class="poster-tag">
          {{ posterTypeLabel(posterRenderData.activityType) }}
        </p>
        <h2 class="poster-title">
          {{ posterRenderData.activityName }}
        </h2>
        <p v-if="posterRenderData.description" class="poster-desc">
          {{ posterRenderData.description }}
        </p>
        <p class="poster-buff">
          经验 ×{{ posterRenderData.expBuffRate }}
        </p>
        <div class="poster-footer">
          <div ref="qrContainerRef" class="poster-qr" />
          <div class="poster-link">
            <p class="poster-link-label">
              扫码参与活动
            </p>
            <p class="poster-link-url">
              {{ posterRenderData.shareUrl }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* ── HUD 加成条 ── */
  .activity-hud {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding: 0.625rem 1rem;
    border-bottom: 1px solid var(--rpg-banner-border);
    background: color-mix(in oklch, var(--rpg-banner-bg) 90%, var(--color-base-100));
  }

  .activity-hud-label {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--rpg-banner-label);
    white-space: nowrap;
  }

  .activity-hud-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    flex: 1;
    min-width: 0;
  }

  .activity-hud-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    font-size: 0.6875rem;
    line-height: 1.25rem;
    white-space: nowrap;
  }

  .activity-hud-pill.is-weather {
    color: var(--rpg-banner-info);
    background: color-mix(in oklch, var(--rpg-banner-info) 12%, transparent);
    border: 1px solid color-mix(in oklch, var(--rpg-banner-info) 25%, transparent);
  }

  .activity-hud-pill.is-effective {
    color: var(--rpg-amber-text, #92400e);
    background: var(--rpg-amber-bg-faint, rgb(251 191 36 / 0.15));
    border: 1px solid var(--rpg-amber-border, #fde68a);
    font-weight: 600;
  }

  /* ── Hero 主视觉 ── */
  .activity-hero {
    position: relative;
    height: 10rem;
    overflow: hidden;
  }

  .activity-hero-track {
    display: flex;
    height: 100%;
    transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  .activity-hero-slide {
    position: relative;
    flex: 0 0 100%;
    height: 100%;
    overflow: hidden;
  }

  .activity-hero-slide.is-season:not(.has-poster) {
    background: linear-gradient(
      125deg,
      color-mix(in oklch, var(--rpg-banner-label) 35%, #1e1b4b) 0%,
      #312e81 45%,
      #1e1b4b 100%
    );
  }

  .activity-hero-slide.is-limited:not(.has-poster) {
    background: linear-gradient(
      125deg,
      color-mix(in oklch, var(--rpg-amber-light, #fbbf24) 40%, #78350f) 0%,
      #92400e 50%,
      #451a03 100%
    );
  }

  .activity-hero-bg-btn {
    position: absolute;
    inset: 0;
    padding: 0;
    border: none;
    background: none;
    cursor: zoom-in;
    z-index: 0;
  }

  .activity-hero-bg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 20%;
    display: block;
    transform: scale(1.08);
    transition: transform 8s linear;
  }

  .activity-hero-slide.is-current .activity-hero-bg {
    transform: scale(1);
  }

  .activity-hero:hover .activity-hero-slide.is-current .activity-hero-bg {
    transform: scale(1.03);
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .activity-hero-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(
      90deg,
      rgb(15 23 42 / 0.88) 0%,
      rgb(15 23 42 / 0.72) 42%,
      rgb(15 23 42 / 0.35) 100%
    );
  }

  .activity-hero-overlay.is-season.has-poster {
    background: linear-gradient(
      90deg,
      rgb(30 27 75 / 0.92) 0%,
      rgb(49 46 129 / 0.65) 45%,
      rgb(30 27 75 / 0.25) 100%
    );
  }

  .activity-hero-overlay.is-limited.has-poster {
    background: linear-gradient(
      90deg,
      rgb(69 26 3 / 0.9) 0%,
      rgb(120 53 15 / 0.6) 45%,
      rgb(69 26 3 / 0.2) 100%
    );
  }

  .activity-hero-content-wrap {
    position: relative;
    z-index: 2;
    height: 100%;
    padding: 1rem 2.75rem 1.75rem 1.25rem;
    max-width: 72%;
    pointer-events: none;
  }

  .activity-hero-type {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    pointer-events: auto;
  }

  .activity-hero-content {
    margin-top: 0.625rem;
    pointer-events: auto;
  }

  .hero-animate-item {
    animation: heroItemIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .activity-hero-type.hero-animate-item {
    animation-delay: 0.04s;
  }

  .activity-hero-title.hero-animate-item {
    animation-delay: 0.12s;
  }

  .activity-hero-desc.hero-animate-item {
    animation-delay: 0.2s;
  }

  .activity-hero-actions.hero-animate-item {
    animation-delay: 0.28s;
  }

  @keyframes heroItemIn {
    from {
      opacity: 0;
      transform: translate3d(0, 0.75rem, 0);
    }

    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .activity-hero-track {
      transition-duration: 0.01ms;
    }

    .activity-hero-bg {
      transform: none !important;
      transition: none !important;
    }

    .hero-animate-item {
      animation: none !important;
    }
  }

  .activity-hero-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: 4.25rem;
    height: 1.375rem;
    padding: 0 1.125rem;
    border-radius: 999px;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    white-space: nowrap;
    border: 1px solid transparent;
    backdrop-filter: blur(6px);
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      opacity 0.15s ease;
  }

  .activity-hero-chip.is-season {
    color: #c4b5fd;
    background: rgb(139 92 246 / 0.35);
    border-color: rgb(196 181 253 / 0.45);
  }

  .activity-hero-chip.is-limited {
    color: #fde68a;
    background: rgb(251 191 36 / 0.25);
    border-color: rgb(253 224 71 / 0.4);
  }

  .activity-hero-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .activity-hero-share.is-action {
    margin: 0;
    cursor: pointer;
    font-family: inherit;
    line-height: 1;
  }

  .activity-hero-share.is-action:hover:not(:disabled).is-season {
    background: rgb(139 92 246 / 0.48);
    border-color: rgb(196 181 253 / 0.65);
    box-shadow: 0 0 12px rgb(139 92 246 / 0.35);
  }

  .activity-hero-share.is-action:hover:not(:disabled).is-limited {
    background: rgb(251 191 36 / 0.38);
    border-color: rgb(253 224 71 / 0.62);
    box-shadow: 0 0 12px rgb(251 191 36 / 0.28);
  }

  .activity-hero-share.is-action:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .activity-hero-title {
    margin: 0.375rem 0 0;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.3;
    color: #fff;
    text-shadow: 0 1px 8px rgb(0 0 0 / 0.35);
  }

  .activity-hero-desc {
    margin: 0.25rem 0 0;
    min-height: calc(0.75rem * 1.45 * 2);
    font-size: 0.75rem;
    line-height: 1.45;
    color: rgb(255 255 255 / 0.78);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .activity-hero-nav {
    position: absolute;
    top: 50%;
    z-index: 4;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border-radius: 999px;
    border: 1px solid rgb(255 255 255 / 0.35);
    background: rgb(0 0 0 / 0.35);
    color: #fff;
    cursor: pointer;
    backdrop-filter: blur(4px);
    opacity: 0;
    pointer-events: none;
    transition:
      opacity 0.2s ease,
      background 0.15s ease;
  }

  .activity-hero-nav-icon {
    width: 0.875rem;
    height: 0.875rem;
    display: block;
    flex-shrink: 0;
  }

  .activity-hero-nav.is-prev {
    left: 0.5rem;
  }

  .activity-hero-nav.is-next {
    right: 0.5rem;
  }

  .activity-hero:hover .activity-hero-nav {
    opacity: 1;
    pointer-events: auto;
  }

  .activity-hero-nav:hover {
    background: rgb(0 0 0 / 0.55);
  }

  .activity-hero-dots {
    position: absolute;
    bottom: 0.625rem;
    left: 50%;
    z-index: 4;
    transform: translateX(-50%);
    display: flex;
    gap: 0.375rem;
  }

  .activity-hero-dot {
    width: 0.375rem;
    height: 0.375rem;
    padding: 0;
    border: none;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.35);
    cursor: pointer;
    transition:
      width 0.2s ease,
      background 0.2s ease;
  }

  .activity-hero-dot.active {
    width: 1.125rem;
    background: rgb(255 255 255 / 0.9);
  }

  /* ── 底部活动 Tab ── */
  .activity-tabs {
    display: flex;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    overflow-x: auto;
    scrollbar-width: thin;
    border-top: 1px solid var(--rpg-banner-border);
    background: color-mix(in oklch, var(--rpg-banner-bg) 75%, var(--color-base-100));
  }

  .activity-tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
    padding: 0.375rem 0.5rem;
    border-radius: 0.625rem;
    border: 1px solid var(--rpg-banner-border);
    background: var(--color-base-100);
    box-shadow: 0 0 0 1px transparent;
    cursor: pointer;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      background 0.15s ease;
    text-align: left;
  }

  .activity-tab:hover {
    background: color-mix(in oklch, var(--rpg-banner-bg) 40%, var(--color-base-100));
  }

  .activity-tab.active.is-season {
    border-color: color-mix(in oklch, var(--rpg-banner-label) 55%, transparent);
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--rpg-banner-label) 25%, transparent);
    background: color-mix(in oklch, var(--rpg-banner-label) 8%, var(--color-base-100));
  }

  .activity-tab.active.is-limited {
    border-color: color-mix(in oklch, var(--rpg-amber-light, #fbbf24) 55%, transparent);
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--rpg-amber-light, #fbbf24) 25%, transparent);
    background: color-mix(in oklch, var(--rpg-amber-light, #fbbf24) 8%, var(--color-base-100));
  }

  .activity-tab-thumb {
    flex-shrink: 0;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.375rem;
    overflow: hidden;
    border: 1px solid var(--rpg-banner-border);
    background: var(--rpg-bg-alt);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .activity-tab-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .activity-tab-emoji {
    font-size: 1rem;
    line-height: 1;
  }

  .activity-tab-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 0.125rem;
  }

  .activity-tab-name {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--rpg-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .activity-tab-rate {
    font-size: 0.625rem;
    color: var(--rpg-text-muted);
  }

  @media (max-width: 640px) {
    .activity-hero-content-wrap {
      max-width: 85%;
      padding-bottom: 2rem;
    }

    .activity-hero-title {
      font-size: 1rem;
    }

    .activity-tab {
      flex: 0 0 auto;
      min-width: 8.5rem;
    }
  }

  /* ── 海报离屏模板 ── */
  .poster-canvas-template {
    position: fixed;
    left: -9999px;
    top: 0;
    width: 540px;
    pointer-events: none;
  }

  .poster-inner {
    background: linear-gradient(160deg, #312e81 0%, #1e1b4b 45%, #0f172a 100%);
    border-radius: 24px;
    overflow: hidden;
    color: #fff;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  .poster-cover {
    width: 100%;
    height: 280px;
    object-fit: cover;
    display: block;
  }

  .poster-body {
    padding: 28px 32px 32px;
  }

  .poster-tag {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #c4b5fd;
    margin: 0 0 8px;
  }

  .poster-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 12px;
    line-height: 1.2;
  }

  .poster-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.78);
    margin: 0 0 12px;
    line-height: 1.5;
  }

  .poster-buff {
    display: inline-block;
    background: rgba(139, 92, 246, 0.35);
    border: 1px solid rgba(196, 181, 253, 0.5);
    border-radius: 999px;
    padding: 4px 12px;
    font-size: 13px;
    margin: 0 0 20px;
  }

  .poster-footer {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
  }

  .poster-qr {
    flex-shrink: 0;
    background: #ffffff;
    padding: 8px;
    border-radius: 12px;
  }

  .poster-link-label {
    font-size: 13px;
    color: #c4b5fd;
    margin: 0 0 6px;
  }

  .poster-link-url {
    font-size: 11px;
    word-break: break-all;
    color: rgba(255, 255, 255, 0.65);
    margin: 0;
    line-height: 1.4;
  }
</style>
