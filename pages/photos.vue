<!-- pages/photos.vue -->
<script setup lang="ts">
import { dailyImage } from '~~/api/article.js';

definePageMeta({
  layout: 'custom', // 不使用default布局
});
/* 获取全局banner数据 */
const banners = useBanners();
const { data: imagesData } = await useAsyncData('index_GetIMG', () => dailyImage(7));
if (imagesData.value) {
  banners.value = imagesData.value.images.map((v: any) => {
    const { copyright, copyrightlink, title } = v;
    return {
      copyright,
      copyrightlink,
      title,
      url: 'https://cn.bing.com' + v.url,
    };
  });
}
</script>

<template>
  <div class="photos-page">
    <NuxtPage />
  </div>
  <!-- 子路由出口 -->
</template>

<style lang="less" scoped>
  .photos-page {
    min-height: 100vh;
    // background: var(--main-bgc) !important;
    // color: var(--text-color) !important;
  }
</style>
