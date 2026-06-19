<template>
  <section>
    <div class="mb-3 flex items-center gap-3">
      <span class="cyber-section-label shrink-0">{{ label }}</span>
      <div class="h-px flex-1 bg-[var(--tech-border)]" />
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>
