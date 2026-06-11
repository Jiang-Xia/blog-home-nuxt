<script setup lang="ts">
/**
   * 用户名片卡片 - 展示基础资料，提供进入 RPG 冒险模块入口
   */
import { messageDanger, messageSuccess } from '@/utils/toast';

const userInfo = useUserInfo();

const displayHomepage = computed(() => {
  const url = userInfo.value?.homepage || '';
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  }
  catch {
    return url.length > 32 ? `${url.slice(0, 32)}…` : url;
  }
});

const uidText = computed(() => (userInfo.value?.uid ? String(userInfo.value.uid) : ''));

const copyUid = async () => {
  if (!uidText.value) return;
  try {
    await navigator.clipboard.writeText(uidText.value);
    messageSuccess('UID 已复制');
  }
  catch {
    messageDanger('复制失败，请手动选择');
  }
};
</script>

<template>
  <div
    class="business-card overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 shadow-lg"
  >
    <div class="relative h-24 bg-gradient-to-br from-primary/90 via-secondary/75 to-accent/70">
      <div
        class="absolute inset-0 opacity-20"
        style="
          background-image:
            radial-gradient(circle at 20% 80%, #fff 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px);
          background-size: 24px 24px;
        "
      />
      <div class="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-10">
        <div
          class="w-[5.5rem] h-[5.5rem] rounded-full overflow-hidden flex items-center justify-center bg-primary text-primary-content border-[3px] border-base-100 shadow-lg"
        >
          <img
            v-if="userInfo?.avatar"
            :src="userInfo.avatar"
            :alt="userInfo.nickname"
            class="w-full h-full object-cover"
          >
          <span v-else class="text-3xl font-bold">
            {{ userInfo?.nickname?.charAt(0) || '?' }}
          </span>
        </div>
      </div>
    </div>

    <div class="px-5 pt-14 pb-5">
      <div class="text-center mb-5">
        <h3 class="text-xl font-bold">
          {{ userInfo?.nickname || '访客' }}
        </h3>
        <p
          v-if="userInfo?.role"
          class="inline-block mt-2 text-xs px-3 py-0.5 rounded-full bg-primary/15 text-primary font-semibold"
        >
          {{ userInfo.role }}
        </p>
        <p v-if="userInfo?.intro" class="mt-3 text-sm leading-relaxed text-base-content/70">
          {{ userInfo.intro }}
        </p>
      </div>

      <div v-if="userInfo?.homepage || uidText" class="flex flex-col gap-2.5 mb-4">
        <div
          v-if="userInfo?.homepage"
          class="flex items-start gap-3 p-3 rounded-xl bg-base-200/60 border border-base-300/50"
        >
          <span
            class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-base-100 text-sm font-bold text-primary"
            aria-hidden="true"
          >🔗</span>
          <div class="min-w-0 flex-1">
            <span
              class="block text-[0.6875rem] font-semibold uppercase tracking-wide text-base-content/50 mb-0.5"
            >主页</span>
            <a
              :href="userInfo.homepage"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm font-medium text-primary break-all hover:underline"
              :title="userInfo.homepage"
            >
              {{ displayHomepage || userInfo.homepage }}
            </a>
          </div>
        </div>
        <div
          v-if="uidText"
          class="flex items-start gap-3 p-3 rounded-xl bg-base-200/60 border border-base-300/50"
        >
          <span
            class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-base-100 text-sm font-bold text-primary"
            aria-hidden="true"
          >#</span>
          <div class="min-w-0 flex-1">
            <span
              class="block text-[0.6875rem] font-semibold uppercase tracking-wide text-base-content/50 mb-0.5"
            >UID</span>
            <div class="flex items-center gap-2">
              <code class="text-sm font-mono text-base-content/85">{{ uidText }}</code>
              <button
                type="button"
                class="btn btn-ghost btn-xs h-6 min-h-6 px-2 text-[0.6875rem]"
                @click="copyUid"
              >
                复制
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!userInfo?.intro && !userInfo?.homepage"
        class="flex flex-col items-center gap-1.5 p-4 mb-4 rounded-xl border border-dashed border-base-content/20 bg-base-200/40 text-center"
      >
        <span class="text-xl" aria-hidden="true">✨</span>
        <p class="text-[0.8125rem] text-base-content/50 m-0">
          完善个人资料，让名片更有辨识度
        </p>
      </div>

      <NuxtLink
        to="/rpg"
        class="flex items-center gap-3 w-full p-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-content no-underline shadow-md shadow-primary/30 transition hover:-translate-y-px hover:shadow-lg hover:shadow-primary/35"
      >
        <span class="text-xl shrink-0" aria-hidden="true">⚔️</span>
        <span class="flex-1 flex flex-col items-start gap-0.5 text-left">
          <strong class="text-[0.9375rem] font-bold leading-tight">进入 RPG 冒险</strong>
          <small class="text-[0.6875rem] opacity-85 font-medium">签到 · 升级 · 任务 · 排行榜</small>
        </span>
        <svg
          class="w-[1.125rem] h-[1.125rem] shrink-0 opacity-85"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>
