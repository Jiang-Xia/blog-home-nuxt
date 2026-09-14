<script setup lang="ts">
/**
   * Welcome Services：文章 / 冒险两张玻璃视频卡。
   */
import { WELCOME_SERVICE_VIDEOS } from '~/constants/welcome-asme';
import { useWelcomeInViewVideo } from '~/composables/use-welcome-inview-video';

const videoA = ref<HTMLVideoElement | null>(null);
const videoB = ref<HTMLVideoElement | null>(null);
useWelcomeInViewVideo(videoA);
useWelcomeInViewVideo(videoB);
</script>

<template>
  <section id="welcome-services" class="relative overflow-hidden bg-black px-6 py-28 md:py-40">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)]"
      aria-hidden="true"
    />
    <div class="relative mx-auto max-w-6xl">
      <WelcomeReveal :y="30">
        <div class="mb-8 flex items-end justify-between md:mb-10">
          <h2 class="text-3xl tracking-tight text-white md:text-5xl">
            What we do
          </h2>
          <p class="hidden text-sm text-white/40 md:block">
            Our services
          </p>
        </div>
      </WelcomeReveal>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <WelcomeReveal :delay="0" :y="50">
          <NuxtLink
            to="/"
            class="liquid-glass group block overflow-hidden rounded-3xl no-underline"
          >
            <div class="relative aspect-video overflow-hidden">
              <video
                ref="videoA"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                muted
                loop
                playsinline
                preload="metadata"
                :src="WELCOME_SERVICE_VIDEOS.articles"
              />
              <div
                class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
                aria-hidden="true"
              />
            </div>
            <div class="p-6 md:p-8">
              <div class="mb-3 flex items-center justify-between">
                <span class="text-xs uppercase tracking-widest text-white/40">Articles</span>
                <span class="liquid-glass rounded-full p-2 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </span>
              </div>
              <h3 class="mb-3 text-xl tracking-tight text-white md:text-2xl"> 技术文章 </h3>
              <p class="text-sm leading-relaxed text-white/50">
                从实现细节到生活记录，把值得留下的东西写清楚。
              </p>
            </div>
          </NuxtLink>
        </WelcomeReveal>

        <WelcomeReveal :delay="150" :y="50">
          <NuxtLink
            to="/rpg"
            class="liquid-glass group block overflow-hidden rounded-3xl no-underline"
          >
            <div class="relative aspect-video overflow-hidden">
              <video
                ref="videoB"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                muted
                loop
                playsinline
                preload="metadata"
                :src="WELCOME_SERVICE_VIDEOS.craft"
              />
              <div
                class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
                aria-hidden="true"
              />
            </div>
            <div class="p-6 md:p-8">
              <div class="mb-3 flex items-center justify-between">
                <span class="text-xs uppercase tracking-widest text-white/40">Adventure</span>
                <span class="liquid-glass rounded-full p-2 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </span>
              </div>
              <h3 class="mb-3 text-xl tracking-tight text-white md:text-2xl"> 冒险与工具 </h3>
              <p class="text-sm leading-relaxed text-white/50">
                签到、任务、抽奖；加解密、水印、PDF——打开即用。
              </p>
            </div>
          </NuxtLink>
        </WelcomeReveal>
      </div>
    </div>
  </section>
</template>
