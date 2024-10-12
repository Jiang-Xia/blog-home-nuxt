<script setup lang="ts">
  import { ref } from 'vue'
  import { MdPreview } from 'md-editor-v3'
  import { getArticleInfo } from '~~/api/article'
  import { SiteTitle } from '@/utils/constant'
  const { data: articleData, } = await useAsyncData('about_GetInfo', () =>
    getArticleInfo({ id: 44, })
  )
  const theme = useTheme()
  const content = articleData.value.info.content
  const images = [
    {
      url: articleData.value.info.cover,
      title: '关于',
    }
  ]
  const mdKey = ref(new Date().getTime())
  onMounted(() => {
    mdKey.value = new Date().getTime()
  })
  useHead({
    title: '关于',
    titleTemplate: title => `${title} - ${SiteTitle}`,
  })
</script>
<template>
  <NuxtLayout name="main-content" :images="images">
    <div class="about-container">
      <h1 class="hidden"> 关于我 - {{ SiteTitle }} </h1>
      <MdPreview
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
  }
</style>
