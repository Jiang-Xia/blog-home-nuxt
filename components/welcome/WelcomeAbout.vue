<script setup lang="ts">
/**
   * Welcome About：衬线大标题入场。纯展示。
   */
</script>

<template>
  <section
    id="welcome-about"
    class="relative overflow-hidden bg-black px-6 pb-10 pt-32 md:pb-14 md:pt-44"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)]"
      aria-hidden="true"
    />
    <div class="relative mx-auto max-w-6xl">
      <WelcomeReveal :y="20">
        <p class="text-sm uppercase tracking-widest text-white/40">
          About Us
        </p>
      </WelcomeReveal>
      <WelcomeReveal :delay="100" :y="40">
        <h2 class="mt-4 text-4xl leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
          以
          <span class="welcome-serif italic text-white/60">好奇</span>
          开路，给那些
          <br class="hidden md:block">
          <span class="welcome-serif italic text-white/60">创造、构建与启发</span>
          的人。
        </h2>
      </WelcomeReveal>
    </div>
  </section>
</template>
