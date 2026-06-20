<template>
  <div :class="['mx-auto px-4 py-4 md:py-6', maxWidth]">
    <NuxtLink
      v-if="backTo"
      :to="backTo"
      class="mb-4 inline-flex text-sm text-tech-muted no-underline transition-colors hover:text-primary"
    >
      ← {{ backLabel }}
    </NuxtLink>
    <CyberSectionHeader
      v-if="title"
      class="mb-5"
      :label="label"
      :title="title"
      :subtitle="subtitle"
      align="center"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
    title?: string;
    subtitle?: string;
    backTo?: string;
    backLabel?: string;
    maxWidth?: string;
  }>(),
  {
    label: '',
    title: '',
    subtitle: '',
    backTo: '',
    backLabel: '返回',
    maxWidth: 'max-w-6xl',
  },
);
</script>
