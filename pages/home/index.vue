<script setup lang="ts">
definePageMeta({
  layout: "custom",
});
useHead({
  title: "文章列表",
  titleTemplate: (title) => `${title} - 江夏的个人博客`,
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  charset: "utf-8",
  meta: [
    { name: "Keywords", content: "江夏的个人博客" },
    {
      name: "description",
      content: "江夏的个人博客，用于记录工作生活学习中的点滴~",
    },
  ],
});
</script>
<template>
  <NuxtLayout>
    <section class="home-content">
      <ArticleList />
    </section>
  </NuxtLayout>
</template>
<style lang="less" scoped>
.home-content {
  position: relative;
  margin: 20px auto 0;
  width: 70vw;
  min-height: 150vh;
  min-width: 40%;
  overflow: hidden;
  @media screen and (max-width: 768px) {
    width: 90%;
  }
  z-index: 0;
  // background-color: #f4f4f4;
  // background-color: #252d38;
  padding: 0 0 20px 0;
}
</style>
