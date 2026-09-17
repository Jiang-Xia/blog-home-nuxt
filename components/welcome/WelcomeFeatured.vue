<script setup lang="ts">
/**
   * Welcome Featured：横向视频卡 + 玻璃橱窗轮播。
   * 幻灯片：最新文章 / RPG 榜首 / 项目 Demo（useWelcomeFeaturedSlides）；
   * 视频仍为氛围底；自动淡入淡出，悬停暂停，圆点可点。
   */
import { WELCOME_FEATURED_VIDEO } from '~/constants/welcome-asme';
import { useWelcomeInViewVideo } from '~/composables/use-welcome-inview-video';
import { useWelcomeFeaturedSlides } from '~/composables/use-welcome-featured-slides';

const videoRef = ref<HTMLVideoElement | null>(null);
useWelcomeInViewVideo(videoRef);

const { current, index, count, paused, go } = useWelcomeFeaturedSlides();
</script>

<template>
  <section class="overflow-hidden bg-black px-6 pb-20 pt-6 md:pb-32 md:pt-10">
    <WelcomeReveal :y="60" class="mx-auto max-w-6xl">
      <div
        class="relative aspect-video overflow-hidden rounded-3xl"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
      >
        <video
          ref="videoRef"
          class="h-full w-full object-cover"
          muted
          loop
          playsinline
          preload="metadata"
          :src="WELCOME_FEATURED_VIDEO"
        />
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
          aria-hidden="true"
        />
        <div
          class="absolute bottom-0 left-0 right-0 flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-10"
        >
          <div class="liquid-glass max-w-md rounded-2xl p-6 md:p-8">
            <Transition name="welcome-featured-fade" mode="out-in">
              <div :key="current.id" class="min-h-[5.5rem]">
                <p class="mb-3 text-xs uppercase tracking-widest text-white/50">
                  {{ current.eyebrow }}
                </p>
                <p
                  v-if="current.title"
                  class="text-base font-medium leading-snug text-white md:text-lg"
                  :class="current.body ? 'mb-2' : ''"
                >
                  {{ current.title }}
                </p>
                <p
                  v-if="current.body"
                  class="text-sm leading-relaxed md:text-base"
                  :class="current.title ? 'text-white/60' : 'text-white'"
                >
                  {{ current.body }}
                </p>
              </div>
            </Transition>
            <!-- 多张时轻量圆点；不抢视频主视觉 -->
            <div
              v-if="count > 1"
              class="mt-5 flex items-center gap-2"
              role="tablist"
              aria-label="橱窗轮播"
            >
              <button
                v-for="n in count"
                :key="n"
                type="button"
                role="tab"
                class="h-1.5 rounded-full transition-all duration-300"
                :class="n - 1 === index ? 'w-5 bg-white/80' : 'w-1.5 bg-white/30 hover:bg-white/50'"
                :aria-selected="n - 1 === index"
                :aria-label="`第 ${n} 张`"
                @click="go(n - 1)"
              />
            </div>
          </div>
          <Transition name="welcome-featured-fade" mode="out-in">
            <NuxtLink
              :key="`${current.id}-cta`"
              :to="current.to"
              class="liquid-glass w-fit rounded-full px-8 py-3 text-sm font-medium text-white no-underline transition-transform hover:scale-105 active:scale-95"
            >
              {{ current.cta }}
            </NuxtLink>
          </Transition>
        </div>
      </div>
    </WelcomeReveal>
  </section>
</template>

<style scoped>
  .welcome-featured-fade-enter-active,
  .welcome-featured-fade-leave-active {
    transition: opacity 0.35s ease;
  }
  .welcome-featured-fade-enter-from,
  .welcome-featured-fade-leave-to {
    opacity: 0;
  }
</style>
