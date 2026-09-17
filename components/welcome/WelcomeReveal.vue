<script setup lang="ts">
/**
   * Welcome 入场：进视口后上移淡入。纯展示。
   */
const props = withDefaults(
  defineProps<{
    delay?: number;
    y?: number;
  }>(),
  { delay: 0, y: 32 },
);

const root = ref<HTMLElement | null>(null);
const shown = ref(false);

onMounted(() => {
  const el = root.value;
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shown.value = true;
    return;
  }
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        shown.value = true;
        io.disconnect();
      }
    },
    { threshold: 0.12, rootMargin: '-80px' },
  );
  io.observe(el);
  onBeforeUnmount(() => io.disconnect());
});
</script>

<template>
  <div
    ref="root"
    class="welcome-reveal"
    :class="{ 'is-in': shown }"
    :style="{
      'transitionDelay': `${props.delay}ms`,
      '--welcome-reveal-y': `${props.y}px`,
    }"
  >
    <slot />
  </div>
</template>
