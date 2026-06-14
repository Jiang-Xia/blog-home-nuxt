<template>
  <div :class="['text-center', align === 'left' ? 'text-left' : '', className]">
    <p v-if="label" class="cyber-section-label mb-1.5">
      {{ label }}
    </p>
    <h2 class="text-2xl font-bold text-tech md:text-3xl">
      {{ title }}
    </h2>
    <p v-if="subtitle" class="mt-1.5 text-xs text-tech-muted md:text-sm">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
    title: string;
    subtitle?: string;
    align?: 'center' | 'left';
    className?: string;
  }>(),
  {
    align: 'center',
    className: '',
  },
);
</script>
