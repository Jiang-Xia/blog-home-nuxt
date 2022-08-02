<script setup lang="ts">
import { computed, ref } from "vue";
import MdEditor from "md-editor-v3";
const theme = useTheme();
const content = ref<string>(
  '<h2>江夏</h2><blockquote><p><font size="2">一位来自广州的前端程序员 喜欢看电影，玩游戏，学技术。</font><br/></p></blockquote'
);

useHead({
  title: "关于",
  titleTemplate: (title) => `${title} - 江夏的个人博客-记录生活记录你~`,
});
</script>
<template>
  <NuxtLayout name="main-content">
    <div class="about-container">
      <h1 class="hidden">关于我 - 江夏的个人博客 - 记录生活记录你~</h1>
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
