<template>
  <details open class="cyber-glass-card group overflow-hidden">
    <summary
      class="flex cursor-pointer list-none items-center gap-2 px-5 py-3.5 text-sm font-medium text-tech select-none [&::-webkit-details-marker]:hidden"
    >
      <xia-icon icon="blog-jiami" class="text-primary" />
      {{ title }}
      <span
        class="ml-auto text-xs text-tech-subtle transition-transform duration-200 group-open:rotate-180"
      >▼</span>
    </summary>
    <div class="space-y-3 border-t border-tech px-5 py-4 text-sm leading-relaxed text-tech-muted">
      <slot />
    </div>
  </details>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
