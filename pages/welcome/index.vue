<script setup lang="ts">
/**
   * Welcome Asme 液态玻璃落地页试验：无站点顶栏/助手。
   * 数据：示范视频见 constants/welcome-asme.ts；
   * Featured 橱窗轮播：最新文章、RPG 榜首、项目 Demo（见 useWelcomeFeaturedSlides）。
   */
import { SiteTitle } from '@/utils/constant';

useHead({
  title: 'Welcome',
  titleTemplate: title => `${title} - ${SiteTitle}`,
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap',
    },
  ],
});
</script>

<template>
  <div class="welcome-asme bg-black text-white">
    <h1 class="hidden">
      Welcome - {{ SiteTitle }}
    </h1>
    <WelcomeHero />
    <WelcomeAbout />
    <WelcomeFeatured />
    <WelcomePhilosophy />
    <WelcomeServices />
  </div>
</template>
