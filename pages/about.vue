<script setup lang="ts">
    import { ref } from 'vue'
    import MdEditor from 'md-editor-v3'
    const theme = useTheme()
    const content = ref<string>(`## 江夏
> 一位来自广州的前端程序员 喜欢看电影，玩游戏，学技术。

### 项目地址
- [Blog Admin](https://jiang-xia.top/)
- [Blog Home Nuxt](https://gitee.com/jiang-xia/blog-home-nuxt)`)
    const mdKey = ref(new Date().getTime())
    onMounted(() => {
      mdKey.value = new Date().getTime()
    })
    useHead({
      title: '关于',
      titleTemplate: title => `${title} - 江夏的个人博客-记录生活记录你~`,
    })
  </script>
<template>
  <NuxtLayout name="main-content">
    <div class="about-container">
      <h1 class="hidden"> 关于我 - 江夏的个人博客 - 记录生活记录你~ </h1>
      <md-editor
        :key="mdKey"
        v-model="content"
        class="x-md-editor bg-transparent p-4 rounded-box shadow-xl"
        preview-theme="mk-cute"
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
