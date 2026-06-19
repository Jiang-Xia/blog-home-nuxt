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
  <CyberPageContainer label="ABOUT" title="关于我" subtitle="个人简介与站点说明">
    <h1 class="hidden">
      关于我 - {{ SiteTitle }}
    </h1>
    <CyberCard class="about-md !p-2 md:!p-4">
      <MdPreview
        :key="mdKey"
        v-model="content"
        class="x-md-editor bg-transparent rounded-box"
        preview-theme="mk-cute"
        preview-only
        :theme="mdEditorTheme"
      />
    </CyberCard>
  </CyberPageContainer>
</template>

<style scoped lang="less">
  /* 关于页二维码/配图不宜占满版心 */
  .about-md :deep(.x-md-editor img) {
    display: block;
    max-width: min(240px, 100%);
    max-height: 280px;
    width: auto;
    height: auto;
    object-fit: contain;
    margin: 0.75rem 0;
    border-radius: 0.5rem;
  }
</style>
