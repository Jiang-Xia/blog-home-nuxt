<script setup lang="ts">
import { ref } from 'vue';
import { MdPreview } from 'md-editor-v3';
import { getArticleInfo } from '~~/api/article';
import { SiteTitle } from '@/utils/constant';

const { data: articleData } = await useAsyncData('about_GetInfo', () =>
  getArticleInfo({ id: 44 }),
);
const mdEditorTheme = useMdEditorTheme();
const content = articleData.value.info.content;
const mdKey = ref(new Date().getTime());
onMounted(() => {
  mdKey.value = new Date().getTime();
});
useHead({
  title: '关于',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});
</script>

<template>
  <NuxtLayout name="main-content" label="ABOUT" title="关于我" subtitle="个人简介与站点说明">
    <div class="about-container">
      <h1 class="hidden">
        关于我 - {{ SiteTitle }}
      </h1>
      <MdPreview
        :key="mdKey"
        v-model="content"
        class="x-md-editor bg-transparent p-4 rounded-box shadow-xl"
        preview-theme="mk-cute"
        preview-only
        :theme="mdEditorTheme"
      />
    </div>
  </NuxtLayout>
</template>

<style lang="less" scoped>
  .about-container {
  }
</style>
