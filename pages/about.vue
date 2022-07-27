<script setup lang="ts">
import { computed, ref } from "vue";
import MdEditor from "md-editor-v3";
const theme = useTheme();
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
  <NuxtLayout name="main-content">
    <div class="about-container">
      <md-editor
        v-model="content"
        class="x-md-editor bg-transparent p-4 rounded-box"
        preview-only
        :theme="theme"
      />
    </div>
  </NuxtLayout>
</template>
<style lang="less" scoped>
.about-container {
  // background-color: var(--minor-bgc);
}
</style>
