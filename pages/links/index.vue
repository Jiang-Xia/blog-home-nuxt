<script setup lang="ts">
import { computed, ref } from "vue";
useHead({
  title: "友链",
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
  <NuxtLayout name="custom">
    <div class="links-container">
      <el-empty description="友链页面 暂时没有东西哦！" />
    </div>
  </NuxtLayout>
</template>
<style lang="less" scoped>
.links-container {
  min-height: 100%;
}
</style>
