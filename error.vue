<script setup lang="ts">
import config from './config';

const props = defineProps({
  error: {
    type: Object,
    default: () => ({}),
  },
});

const is404 = computed(() => props.error?.statusCode === 404);
const errorTitle = computed(() =>
  is404.value ? '404' : String(props.error?.statusCode ?? 'Error'),
);
const errorSubtitle = computed(() => {
  if (is404.value) {
    return (props.error?.statusMessage as string) || '页面不存在';
  }
  return (props.error?.statusMessage as string) || '发生错误';
});
const handleError = () => clearError({ redirect: '/' });
</script>

<template>
  <CyberPageContainer label="ERROR" :title="errorTitle" :subtitle="errorSubtitle">
    <CyberCard class="flex flex-col items-center py-12 text-center">
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
    </CyberCard>
  </CyberPageContainer>
</template>
