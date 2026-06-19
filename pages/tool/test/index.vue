<script setup lang="ts">
import Delay from './components/Delay.vue';
import Stream from './components/stream.vue';
import Screenshot from './components/Screenshot.vue';
import Uniapp from './components/uniapp.vue';
import RpgModalLab from './components/RpgModalLab.vue';
import ToastLab from './components/ToastLab.vue';
import ThemeLab from './components/ThemeLab.vue';
import CardGlowLab from './components/CardGlowLab.vue';

definePageMeta({
  layout: 'default',
});

useHead({
  title: '开发测试',
});
</script>

<template>
  <CyberPageContainer label="LAB" title="开发测试" subtitle="RPG 弹窗、UI 组件与工具链本地验证">
    <div class="test-page space-y-6">
      <CyberToolCard title="RPG 弹窗实验室" width-class="w-full">
        <p class="test-card-desc">
          本地 mock 触发全屏弹框，无需登录或 WebSocket；组件与全站
          <code class="test-code">RpgGlobalInit</code> 一致。
        </p>
        <RpgModalLab />
      </CyberToolCard>

      <div class="test-grid">
        <CyberToolCard title="Toast 提示" width-class="w-full">
          <ToastLab />
        </CyberToolCard>

        <CyberToolCard title="主题切换" width-class="w-full">
          <ThemeLab />
        </CyberToolCard>
      </div>

      <CyberToolCard title="边框光效卡片" width-class="w-full max-w-md mx-auto">
        <CardGlowLab />
      </CyberToolCard>

      <CyberToolCard title="节流 / 防抖" width-class="w-full">
        <p class="test-card-desc">
          页内可视化计数与日志，无需打开控制台即可验证触发频率。
        </p>
        <Delay />
      </CyberToolCard>

      <div class="test-grid">
        <CyberToolCard title="SSE 流式输出" width-class="w-full">
          <Stream />
        </CyberToolCard>

        <CyberToolCard title="UniApp WebView 桥接" width-class="w-full">
          <ClientOnly>
            <Uniapp />
          </ClientOnly>
        </CyberToolCard>
      </div>

      <CyberToolCard title="DOM 截图 / PDF" width-class="w-full">
        <p class="test-card-desc">
          基于 <code class="test-code">modern-screenshot</code> 与
          <code class="test-code">html2pdf</code>，导出下方样例卡片。
        </p>
        <ClientOnly>
          <Screenshot />
        </ClientOnly>
      </CyberToolCard>
    </div>
  </CyberPageContainer>
</template>

<style scoped>
  .test-page {
    padding-bottom: 2rem;
  }

  .test-grid {
    display: grid;
    gap: 1rem;
  }

  @media (min-width: 768px) {
    .test-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .test-card-desc {
    margin-bottom: 12px;
    font-size: 13px;
    line-height: 1.5;
    color: oklch(var(--bc) / 0.68);
  }

  .test-code {
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 12px;
    background: oklch(var(--bc) / 0.08);
  }
</style>
