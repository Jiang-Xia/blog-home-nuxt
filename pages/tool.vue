<template>
  <div class="padding-top-bar xia-page">
    <div class="absolute inset-0 z-10" style="height: 104px">
      <InFlickeringGrid
        class="relative inset-0 z-0 [mask-image:radial-gradient(650px_circle_at_center,white,transparent)]"
        :square-size="4"
        :grid-gap="6"
        color="#4ba6c6"
        :max-opacity="0.5"
        :flicker-chance="0.1"
      />
      <xia-icon
        class="cursor-pointer px-3 absolute right-2 top-10 text-white"
        :icon="'blog-' + theme"
        @click="clickIcon"
      />
    </div>

    <!-- 小屏时的下拉选择器 -->
    <div class="p-4 bg-base-100 md:hidden mb-4">
      <div class="dropdown w-full">
        <button tabindex="0" class="btn btn-soft btn-success w-full justify-start">
          <xia-icon :icon="selectedTool?.icon || 'blog-tool'" class="mr-2" />
          <span>{{ selectedTool?.title || '选择工具' }}</span>
        </button>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow"
        >
          <li v-for="item in menuList" :key="item.path">
            <NuxtLink
              :to="item.path"
              class="flex items-center"
              :class="{ active: item.path === route.path }"
            >
              <xia-icon :icon="item.icon" class="mr-2" />
              <span>{{ item.title }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- 大屏时的水平工具列表 -->
    <div class="pt-4 px-4 hidden md:block">
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
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { LinkItem } from './tool/components/LinkItem';

definePageMeta({
  layout: 'custom', // 不使用default布局
});
const { theme, clickIcon } = useThemeActions();
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
    path: '/tool/ai-summary',
    title: 'AI文章摘要',
    icon: 'blog-zhaiyao2',
  },
  {
    path: '/photos',
    title: '摄影',
    icon: 'blog-xiangji',
  },
  {
    path: '/',
    title: '首页',
    icon: 'blog-fanhui2',
  },
];
const menuList = ref(dataList);

// 计算当前选中的工具
const selectedTool = computed(() => {
  return menuList.value.find(item => item.path === route.path);
});
</script>

<style lang="less" scoped>
  .xia-page {
    padding-top: 104px;
    padding-bottom: 24px;

    .tool-children-pages {
      min-height: 60vh;
    }

    .router-link-active {
      border: none;
    }

    background: var(--main-bgc) !important;
    color: var(--text-color) !important;
  }
</style>
