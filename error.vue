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

const is404 = computed(() => props.error?.statusCode === 404);
const handleError = () => clearError({ redirect: '/' });
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
    <img v-if="is404" :src="config.gif404" alt="404" class="mb-8 max-h-48 opacity-80">
    <div
      v-else
      class="mb-8 h-40 w-64 bg-contain bg-center bg-no-repeat opacity-80"
      :style="{ backgroundImage: `url(${config.gifError})` }"
    />
    <p class="cyber-gradient-text mb-2 text-xl md:text-4xl">
      <template v-if="is404">
        Page not found
      </template>
      <template v-else>
        {{ error.statusCode }} — {{ error.statusMessage }}
      </template>
    </p>
    <p class="mb-8 text-sm text-tech-subtle">
      {{ is404 ? error.url || error.message : error.message }}
    </p>
    <CyberButton class="mt-6" @click="handleError">
      返回首页
    </CyberButton>
  </div>
</template>
