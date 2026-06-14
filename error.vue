<script setup lang="ts">
import config from './config';

definePageMeta({
  layout: 'custom',
});

const props = defineProps({
  error: {
    type: Object,
    default: () => ({}),
  },
});

const handleError = () => clearError({ redirect: '/' });
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
    <div
      class="mb-8 h-40 w-64 bg-contain bg-center bg-no-repeat opacity-80"
      :style="{ backgroundImage: `url(${config.gifError})` }"
    />
    <p class="cyber-gradient-text mb-2 text-xl md:text-3xl">
      {{ error.statusCode }} — {{ error.statusMessage }}
    </p>
    <p class="mb-4 text-sm text-tech-subtle">
      {{ error.message }}
    </p>
    <CyberButton class="mt-6" @click="handleError">
      返回首页
    </CyberButton>
  </div>
</template>
