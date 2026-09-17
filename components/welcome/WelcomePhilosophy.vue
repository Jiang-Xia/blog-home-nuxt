<script setup lang="ts">
/**
   * Welcome Philosophy：创新 × 视野双栏。视频进视口播放。
   */
import { WELCOME_PHILOSOPHY_VIDEO } from '~/constants/welcome-asme';
import { useWelcomeInViewVideo } from '~/composables/use-welcome-inview-video';

const videoRef = ref<HTMLVideoElement | null>(null);
useWelcomeInViewVideo(videoRef);
</script>

<template>
  <section class="overflow-hidden bg-black px-6 py-28 md:py-40">
    <div class="mx-auto max-w-6xl">
      <WelcomeReveal :y="40">
        <h2 class="mb-16 text-5xl tracking-tight text-white md:mb-24 md:text-7xl lg:text-8xl">
          创新
          <span class="welcome-serif italic text-white/40"> × </span>
          视野
        </h2>
      </WelcomeReveal>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        <WelcomeReveal :y="0" class="overflow-hidden rounded-3xl">
          <div class="aspect-[4/3] overflow-hidden rounded-3xl">
            <video
              ref="videoRef"
              class="h-full w-full object-cover"
              muted
              loop
              playsinline
              preload="metadata"
              :src="WELCOME_PHILOSOPHY_VIDEO"
            />
          </div>
        </WelcomeReveal>

        <WelcomeReveal :delay="80" :y="40" class="flex flex-col justify-center">
          <div>
            <p class="mb-4 text-xs uppercase tracking-widest text-white/40">
              Choose your space
            </p>
            <p class="text-base leading-relaxed text-white/70 md:text-lg">
              有意义的突破，往往发生在克制策略与大胆想象的交汇处。这里把阅读、工具与玩法接到同一条路上。
            </p>
          </div>
          <div class="my-8 h-px w-full bg-white/10" aria-hidden="true" />
          <div>
            <p class="mb-4 text-xs uppercase tracking-widest text-white/40">
              Shape the future
            </p>
            <p class="text-base leading-relaxed text-white/70 md:text-lg">
              最好的作品来自好奇遇上坚持。打开最新文章，或进冒险中心领今日经验——工具箱随时待命。
            </p>
          </div>
        </WelcomeReveal>
      </div>
    </div>
  </section>
</template>
