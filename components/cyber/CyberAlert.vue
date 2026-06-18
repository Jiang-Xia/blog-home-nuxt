<template>
  <div :class="['cyber-alert', variant === 'warning' ? 'cyber-alert-warning' : 'cyber-alert-info']">
    <span class="shrink-0 text-lg" aria-hidden="true">{{
      variant === 'warning' ? '⚠️' : '💡'
    }}</span>
    <div class="min-w-0">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'warning' | 'info';
  }>(),
  {
    variant: 'info',
  },
);
</script>
