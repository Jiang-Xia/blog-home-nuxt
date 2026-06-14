<template>
  <div :class="['cyber-glass-card', padding, hover && 'cyber-glass-card--hover', props.class]">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    padding?: string;
    hover?: boolean;
    class?: string;
  }>(),
  {
    padding: 'p-6',
    hover: false,
    class: '',
  },
);
</script>
