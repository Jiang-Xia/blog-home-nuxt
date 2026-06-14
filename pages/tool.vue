<template>
  <CyberPageContainer
    label="TOOLS"
    title="工具箱"
    subtitle="实用开发与日常工具集合"
    max-width="max-w-6xl"
  >
    <!-- 小屏下拉 -->
    <div class="cyber-glass-card mb-6 p-4 md:hidden">
      <div class="dropdown w-full">
        <button tabindex="0" class="cyber-btn-secondary w-full justify-start !py-2.5">
          <xia-icon :icon="selectedTool?.icon || 'blog-tool'" class="mr-2" />
          <span>{{ selectedTool?.title || '选择工具' }}</span>
        </button>
        <ul
          tabindex="0"
          class="menu dropdown-content z-50 mt-2 w-full rounded-xl border border-tech bg-[var(--tech-dropdown-bg)] p-2 shadow-xl backdrop-blur-xl"
        >
          <li v-for="item in menuList" :key="item.path">
            <NuxtLink
              :to="item.path"
              class="text-tech-muted hover:text-primary"
              :class="{ 'text-primary': item.path === route.path }"
            >
              <xia-icon :icon="item.icon" class="mr-2" />
              <span>{{ item.title }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- 大屏工具导航 -->
    <div class="mb-6 hidden flex-wrap justify-center gap-2 md:flex">
      <NuxtLink
        v-for="item in menuList"
        :key="item.path"
        :to="item.path"
        :class="[
          'rounded-xl px-4 py-2 text-sm no-underline transition-all',
          item.path === route.path
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'border border-tech text-tech-muted hover:border-primary/30 hover:bg-tech-header hover:text-tech',
        ]"
      >
        <xia-icon :icon="item.icon" class="mr-1.5 inline" />
        {{ item.title }}
      </NuxtLink>
    </div>

    <div class="cyber-glass-card min-h-[50vh] p-4 md:p-6">
      <NuxtPage />
    </div>
  </CyberPageContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

definePageMeta({
  layout: 'custom',
});

const route = useRoute();
const dataList = [
  { path: '/tool/codes', title: '条形/二维码', icon: 'blog-erweima' },
  { path: '/tool/pdf', title: 'PDF', icon: 'blog-pdf1' },
  { path: '/tool/watermark', title: '水印', icon: 'blog-yinzhang' },
  { path: '/tool/audio-visualized', title: '音频可视化', icon: 'blog-yinpin1' },
  { path: '/tool/upload-slice', title: '切片上传', icon: 'blog-upload' },
  { path: '/tool/other', title: '其他工具', icon: 'blog-qita' },
  { path: '/tool/webrtc', title: 'WebRTC', icon: 'blog-shipin1' },
  { path: '/tool/test', title: '测试', icon: 'blog-ceshi1' },
  { path: '/tool/rsa', title: 'RSA加解密工具', icon: 'blog-jiami' },
  { path: '/tool/des', title: '对称加密工具', icon: 'blog-encrypted' },
  { path: '/tool/sm', title: '国密加密工具', icon: 'blog-lock' },
  { path: '/tool/ai', title: 'AI', icon: 'blog-AI' },
  { path: '/tool/ai-summary', title: 'AI文章摘要', icon: 'blog-zhaiyao2' },
  { path: '/photos', title: '摄影', icon: 'blog-xiangji' },
  { path: '/', title: '首页', icon: 'blog-fanhui2' },
];
const menuList = ref(dataList);

const selectedTool = computed(() => menuList.value.find(item => item.path === route.path));
</script>
