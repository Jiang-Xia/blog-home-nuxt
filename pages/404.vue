<script setup lang="ts">
import config from '~~/config';
import { SiteTitle } from '@/utils/constant';

useHead({
  title: '404',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});

const route = useRoute();
</script>

<template>
  <CyberPageContainer label="ERROR" title="404" subtitle="页面不存在">
    <CyberCard class="flex flex-col items-center py-12 text-center">
      <img :src="config.gif404" alt="404" class="mb-8 max-h-48 opacity-80">
      <p class="cyber-gradient-text mb-2 text-2xl font-light md:text-4xl">
        Page not found
      </p>
      <p class="mb-8 text-sm text-tech-subtle">
        {{ route.fullPath }}
      </p>
      <CyberButton to="/">
        返回首页
      </CyberButton>
    </CyberCard>
  </CyberPageContainer>
</template>
