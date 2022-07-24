<script setup lang="ts">
import { computed, ref } from "vue";
import MdEditor from "md-editor-v3";
const theme = useTheme();

definePageMeta({
  layout: "custom",
});
const content = ref<string>(
  '<h2>江夏</h2><blockquote><p><font size="2">一位来自广州的前端程序员 喜欢看电影，玩游戏，学技术。</font><br/></p></blockquote'
);

useHead({
  title: "关于",
  titleTemplate: (title) => `${title} - 江夏的个人博客`,
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  charset: "utf-8",
  meta: [
    { name: "Keywords", content: "江夏的个人博客" },
    {
      name: "description",
      content: "江夏的个人博客，用于工作学习生活点滴的私密空间。",
    },
  ],
});
</script>
<template>
  <NuxtLayout>
    <div class="about-container">
      <div class="my-info">
        <md-editor
          v-model="content"
          class="x-md-editor"
          preview-only
          :theme="theme"
        />
      </div>
    </div>
  </NuxtLayout>
</template>
<style lang="less" scoped>
.about-container {
  min-height: 100%;
  .my-info {
    margin: 0 auto 0;
    min-height: 100vh;
    min-width: 40%;
    width: 70%;
    border-radius: var(--layout-border-radius);
    background-color: var(--minor-bgc);
    padding: 10px 20px 20px 20px;
  }
}
</style>
