<script setup lang="ts">
/* global QRCode, html2canvas */
import { getCurrentActivity, getWeatherBuff, shareSeasonPoster } from '~~/api/rpg';
import { messageSuccess, messageError } from '~~/utils/toast';
import { loadScreenshotScripts, loadBarcodeScripts } from '~~/utils/script-loader';
import { originUrl } from '~~/config';

const userInfo = useUserInfo();
const activity = ref<any>(null);
const weatherBuff = ref<any>(null);
const sharing = ref(false);
const posterRef = ref<HTMLElement>();
const qrContainerRef = ref<HTMLElement>();
const posterRenderData = ref<{
  posterUrl: string;
  activityName: string;
  activityCode: string;
  shareUrl: string;
  description: string;
  expBuffRate?: number;
} | null>(null);

onMounted(async () => {
  try {
    const [act, weather] = await Promise.all([
      getCurrentActivity(),
      getWeatherBuff().catch(() => null),
    ]);
    activity.value = act;
    weatherBuff.value = weather;
  }
  catch {
    /* ignore */
  }
});

const resolvePosterUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${originUrl}${url.startsWith('/') ? url : `/${url}`}`;
};

const ensureLogin = async () => {
  if (!userInfo.value?.uid) {
    messageError('请先登录');
    await navigateTo('/login');
    return false;
  }
  return true;
};

const generateQrCode = (url: string) => {
  if (!qrContainerRef.value || typeof QRCode === 'undefined') return;
  qrContainerRef.value.innerHTML = '';
  new QRCode(qrContainerRef.value, {
    text: url,
    width: 120,
    height: 120,
    correctLevel: QRCode.CorrectLevel.H,
  });
};

const downloadPosterImage = async (res: {
  posterUrl: string;
  activityName: string;
  activityCode: string;
  shareUrl: string;
}) => {
  posterRenderData.value = {
    posterUrl: resolvePosterUrl(res.posterUrl || activity.value?.posterUrl || ''),
    activityName: res.activityName,
    activityCode: res.activityCode,
    shareUrl: res.shareUrl,
    description: activity.value?.description || '',
    expBuffRate: activity.value?.expBuffRate,
  };
  await nextTick();
  await Promise.all([loadBarcodeScripts(), loadScreenshotScripts()]);
  generateQrCode(res.shareUrl);
  await nextTick();
  if (!posterRef.value) {
    throw new Error('海报渲染失败');
  }
  const canvas = await html2canvas(posterRef.value, {
    useCORS: true,
    scale: 2,
    backgroundColor: '#1e1b4b',
  });
  const link = document.createElement('a');
  link.download = `${res.activityCode}-poster.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

const handleShare = async () => {
  if (!(await ensureLogin())) return;
  sharing.value = true;
  try {
    const res = await shareSeasonPoster();
    await downloadPosterImage(res);
    messageSuccess('海报已下载');
  }
  catch (e: any) {
    messageError(e?.message || '分享失败');
  }
  finally {
    sharing.value = false;
    posterRenderData.value = null;
  }
};
</script>

<template>
  <div
    v-if="activity"
    class="season-banner p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-200 mb-4"
  >
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-start gap-3">
        <img
          v-if="activity.posterUrl"
          :src="activity.posterUrl"
          alt="赛季海报"
          class="w-16 h-16 rounded-lg object-cover border border-violet-200"
        >
        <div>
          <span class="text-xs uppercase tracking-wide text-violet-600">当前活动</span>
          <h3 class="font-bold text-lg">
            {{ activity.name }}
          </h3>
          <p class="text-sm text-base-content/70 mt-1">
            {{ activity.description }}
          </p>
          <p v-if="weatherBuff" class="text-xs text-sky-600 mt-1">
            🌤 {{ weatherBuff.label }}
          </p>
        </div>
      </div>
      <div class="flex flex-col items-end gap-2">
        <span class="badge badge-primary">经验×{{ activity.expBuffRate }}</span>
        <button class="btn btn-sm btn-outline" :disabled="sharing" @click="handleShare">
          {{ sharing ? '生成中...' : '分享海报' }}
        </button>
      </div>
    </div>
  </div>

  <!-- 屏幕外海报模板，供 html2canvas 捕获 -->
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
          赛季活动
        </p>
        <h2 class="poster-title">
          {{ posterRenderData.activityName }}
        </h2>
        <p v-if="posterRenderData.description" class="poster-desc">
          {{ posterRenderData.description }}
        </p>
        <p v-if="posterRenderData.expBuffRate" class="poster-buff">
          经验 ×{{ posterRenderData.expBuffRate }}
        </p>
        <div class="poster-footer">
          <div ref="qrContainerRef" class="poster-qr" />
          <div class="poster-link">
            <p class="poster-link-label">
              扫码参与赛季
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
    background: #fff;
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
