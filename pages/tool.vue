<template>
  <div class="padding-top-bar xia-page">
    <div class="pt-4 px-4">
      <ul class="flex flex-wrap justify-center md:justify-start">
        <li v-for="item in menuList" :key="item.path" class="li-item">
          <xia-button-border v-if="item.path === route.path" :animation-duration="1" rx="8">
            <LinkItem :item="item" />
          </xia-button-border>
          <LinkItem v-else :item="item" />
        </li>
      </ul>
    </div>

    <section class="tool-children-pages">
      <NuxtPage />
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { LinkItem } from './tool/components/LinkItem'
  const route = useRoute()
  const dataList = [
    {
      path: '/tool/codes',
      title: '条形/二维码',
      icon: 'blog-erweima',
    },
    {
      path: '/tool/pdf',
      title: 'PDF',
      icon: 'blog-pdf1',
    },
    {
      path: '/tool/audio-visualized',
      title: '音频可视化',
      icon: 'blog-yinpin1',
    },
    {
      path: '/tool/upload-slice',
      title: '切片上传',
      icon: 'blog-upload',
    },
    {
      path: '/tool/other',
      title: '其他工具',
      icon: 'blog-qita',
    },
    {
      path: '/au-vi',
      title: '音视频',
      icon: 'blog-shipin1',
    },
    {
      path: '/tool/test',
      title: '测试',
      icon: 'blog-ceshi1',
    }
  ]
  const menuList = ref(dataList)
</script>
<style lang="less" scoped>
  .xia-page {
    padding-top: 104px;
    .li-item {
      @apply mr-2 mb-2;
    }
    .tool-children-pages {
      // min-height: 60vh
    }
    .router-link-active {
      @apply border-none;
    }
  }
</style>
