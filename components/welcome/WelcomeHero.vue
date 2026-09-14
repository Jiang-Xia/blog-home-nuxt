<script setup lang="ts">
/**
   * Welcome Asme Hero：液态玻璃导航 + 淡入淡出背景片 + 中文博客文案。
   */
import { WELCOME_HERO_VIDEO } from '~/constants/welcome-asme';
import { useWelcomeHeroFade } from '~/composables/use-welcome-hero-fade';

const videoRef = ref<HTMLVideoElement | null>(null);
const { failed, onCanPlay, onTimeUpdate, onEnded, onError } = useWelcomeHeroFade(videoRef);

const searchQ = ref('');
const router = useRouter();

/** 搜索或进入博客首页 */
const goSearchOrHome = () => {
  const q = searchQ.value.trim();
  if (q) {
    router.push({ path: '/search', query: { q } });
    return;
  }
  router.push('/');
};

/** 滚到本页锚点 */
const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<template>
  <section class="relative flex min-h-screen flex-col overflow-hidden">
    <div class="absolute inset-0 bg-black" aria-hidden="true" />
    <video
      v-show="!failed"
      ref="videoRef"
      class="absolute inset-0 h-full w-full object-cover object-bottom"
      style="opacity: 0"
      muted
      playsinline
      preload="auto"
      :src="WELCOME_HERO_VIDEO"
      @canplay="onCanPlay"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @error="onError"
    />

    <nav class="relative z-20 px-6 py-6">
      <div
        class="liquid-glass mx-auto flex max-w-5xl items-center justify-between rounded-full px-6 py-3"
      >
        <div class="flex min-w-0 items-center">
          <NuxtLink to="/" class="flex items-center gap-2 no-underline">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="shrink-0 text-white"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            <span class="text-lg font-semibold text-white">江夏</span>
          </NuxtLink>
          <div class="ml-8 hidden items-center gap-8 md:flex">
            <button
              type="button"
              class="text-sm font-medium text-white/80 hover:text-white"
              @click="scrollTo('welcome-about')"
            >
              关于
            </button>
            <button
              type="button"
              class="text-sm font-medium text-white/80 hover:text-white"
              @click="scrollTo('welcome-services')"
            >
              能力
            </button>
            <NuxtLink
              to="/rpg"
              class="text-sm font-medium text-white/80 no-underline hover:text-white"
            >
              冒险
            </NuxtLink>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-3 sm:gap-4">
          <NuxtLink to="/" class="hidden text-sm font-medium text-white no-underline sm:inline">
            进入博客
          </NuxtLink>
          <NuxtLink
            to="/login"
            class="liquid-glass rounded-full px-5 py-2 text-sm font-medium text-white no-underline sm:px-6"
          >
            登录
          </NuxtLink>
        </div>
      </div>
    </nav>

    <div
      class="relative z-10 flex flex-1 -translate-y-[12%] flex-col items-center justify-center px-6 py-12 text-center md:-translate-y-[20%]"
    >
      <h1
        class="welcome-serif whitespace-nowrap text-6xl tracking-tight text-white sm:text-7xl md:text-8xl lg:text-9xl"
      >
        知而后
        <em class="italic">行</em>
        .
      </h1>

      <form
        class="liquid-glass mt-10 flex w-full max-w-xl items-center gap-3 rounded-full py-2 pl-6 pr-2"
        @submit.prevent="goSearchOrHome"
      >
        <input
          v-model="searchQ"
          type="search"
          class="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
          placeholder="搜索文章，或直接进入博客"
          aria-label="搜索文章"
        >
        <button type="submit" class="rounded-full bg-white p-3 text-black" aria-label="提交">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </form>

      <p class="mt-6 max-w-xl px-4 text-sm leading-relaxed text-white">
        技术博客，也是冒险世界。读文章、用工具、做任务，从这里出发。
      </p>

      <NuxtLink
        to="/rpg"
        class="liquid-glass mt-8 rounded-full px-8 py-3 text-sm font-medium text-white no-underline transition-colors hover:bg-white/5"
      >
        开始冒险
      </NuxtLink>
    </div>

    <div class="relative z-10 flex justify-center gap-4 pb-12">
      <NuxtLink
        to="/msgboard"
        class="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
        aria-label="留言板"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </NuxtLink>
      <NuxtLink
        to="/links"
        class="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
        aria-label="友链"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </NuxtLink>
      <NuxtLink
        to="/about"
        class="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
        aria-label="关于"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      </NuxtLink>
    </div>
  </section>
</template>
