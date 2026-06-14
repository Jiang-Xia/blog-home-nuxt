<template>
  <div :class="['text-center', align === 'left' ? 'text-left' : '', className]">
    <p v-if="label" class="cyber-section-label mb-3">
      {{ label }}
    </p>
    <h2 class="text-3xl font-bold text-tech md:text-4xl">
      {{ title }}
    </h2>
    <p v-if="subtitle" class="mt-3 text-sm text-tech-muted md:text-base">
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
