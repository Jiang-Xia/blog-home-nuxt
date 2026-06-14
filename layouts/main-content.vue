<script setup lang="ts">
defineProps({
  label: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  images: {
    type: Array<BannerState>,
    default: () => [],
  },
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8 md:py-12">
    <CyberSectionHeader
      v-if="title"
      class="mb-8"
      :label="label"
      :title="title"
      :subtitle="subtitle"
    />
    <div class="cyber-glass-card p-4 md:p-6">
      <slot />
    </div>
  </div>
</template>
