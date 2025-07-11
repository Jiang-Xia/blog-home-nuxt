<template>
  <div class="padding-top-bar xia-page">
    <div class="pt-4 px-4">
      <ul class="flex flex-wrap justify-center md:justify-start">
        <li v-for="item in menuList" :key="item.path" class="li-item mr-2 mb-2">
          <XiaButtonBorder v-if="item.path === route.path" :animation-duration="1" rx="8">
            <LinkItem :item="item" />
          </XiaButtonBorder>
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
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { LinkItem } from './tool/components/LinkItem';

const route = useRoute();
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
    path: '/tool/watermark',
    title: '水印',
    icon: 'blog-yinzhang',
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
    path: '/tool/webrtc',
    title: 'WebRTC',
    icon: 'blog-shipin1',
  },
  {
    path: '/tool/test',
    title: '测试',
    icon: 'blog-ceshi1',
  },
  {
    path: '/tool/rsa',
    title: 'RSA加解密工具',
    icon: 'blog-jiami',
  },
  {
    path: '/tool/des',
    title: '对称加密工具',
    icon: 'blog-encrypted',
  },
  {
    path: '/tool/sm',
    title: '国密加密工具',
    icon: 'blog-lock',
  },
  {
    path: '/tool/ai',
    title: 'AI',
    icon: 'blog-AI',
  },
  {
    path: '/photos',
    title: '摄影',
    icon: 'blog-xiangji',
  },
];
const menuList = ref(dataList);
</script>

<style lang="less" scoped>
  .xia-page {
    padding-top: 104px;
    .li-item {
    }
    .tool-children-pages {
      // min-height: 60vh
    }
    .router-link-active {
      border: none;
    }
  }
</style>
