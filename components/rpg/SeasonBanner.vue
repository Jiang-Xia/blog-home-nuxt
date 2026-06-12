<script setup lang="ts">
import { getCurrentActivity, getWeatherBuff, shareSeasonPoster } from '~~/api/rpg';
import { messageSuccess, messageError } from '~~/utils/toast';

const activity = ref<any>(null);
const weatherBuff = ref<any>(null);
const sharing = ref(false);

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

const handleShare = async () => {
  sharing.value = true;
  try {
    const res = await shareSeasonPoster();
    const text = `${res.activityName} · ${res.shareUrl}`;
    if (navigator.share) {
      await navigator.share({ title: res.activityName, text, url: res.shareUrl });
    }
    else {
      await navigator.clipboard.writeText(text);
      messageSuccess('分享链接已复制');
    }
  }
  catch (e: any) {
    messageError(e?.message || '分享失败');
  }
  finally {
    sharing.value = false;
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
          {{ sharing ? '...' : '分享海报' }}
        </button>
      </div>
    </div>
  </div>
</template>
