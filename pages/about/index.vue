<script setup lang="ts">
/**
   * 关于页：文章正文（id=44）+ 支付宝赞赏面板
   * 赞赏数据来源：/site/tip/*（与正文静态赞赏码并存）
   */
import { ref } from 'vue';
import { MdPreview } from 'md-editor-v3';
import { getArticleInfo } from '~~/api/article';
import { SiteTitle } from '@/utils/constant';

const tipPanelRef = ref<HTMLElement | null>(null);

const { data: articleData } = await useAsyncData('about_GetInfo', () =>
  getArticleInfo({ id: 44 }),
);
const mdEditorTheme = useMdEditorTheme();
const content = articleData.value.info.content;
const mdKey = ref(new Date().getTime());
onMounted(() => {
  mdKey.value = new Date().getTime();
});
useHead({
  title: '关于',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});

/** 顶部打赏标识：平滑滚到赞赏面板并短暂高亮 */
const scrollToTipPanel = () => {
  const el = tipPanelRef.value;
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.classList.add('about-tip-anchor--flash');
  window.setTimeout(() => el.classList.remove('about-tip-anchor--flash'), 1400);
};
</script>

<template>
  <CyberPageContainer label="ABOUT" title="关于我" subtitle="个人简介与站点说明">
    <h1 class="hidden">
      关于我 - {{ SiteTitle }}
    </h1>

    <button
      type="button"
      class="about-tip-cta"
      aria-label="跳转到请作者喝咖啡"
      @click="scrollToTipPanel"
    >
      <span class="about-tip-cta__glow" aria-hidden="true" />
      <span class="about-tip-cta__badge">SUPPORT</span>
      <span class="about-tip-cta__main">
        <span class="about-tip-cta__icon" aria-hidden="true">◇</span>
        <span class="about-tip-cta__title cyber-gradient-text">请作者喝咖啡</span>
        <span class="about-tip-cta__arrow" aria-hidden="true">↓</span>
      </span>
      <span class="about-tip-cta__sub">支付宝赞赏 · 公开流水 · 点击直达</span>
    </button>

    <CyberCard class="about-md !p-2 md:!p-4">
      <MdPreview
        :key="mdKey"
        v-model="content"
        class="x-md-editor bg-transparent rounded-box"
        preview-theme="mk-cute"
        preview-only
        :theme="mdEditorTheme"
      />
    </CyberCard>
    <div id="about-tip" ref="tipPanelRef" class="about-tip-anchor mt-4 md:mt-6 scroll-mt-24">
      <AboutTipPanel />
    </div>
  </CyberPageContainer>
</template>

<style scoped lang="less">
  /* 关于页二维码/配图不宜占满版心 */
  .about-md :deep(.x-md-editor img) {
    display: block;
    max-width: min(240px, 100%);
    max-height: 280px;
    width: auto;
    height: auto;
    object-fit: contain;
    margin: 0.75rem 0;
    border-radius: 0.5rem;
  }

  .about-tip-cta {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    width: 100%;
    margin: 0 0 1.25rem;
    padding: 1rem 1.1rem 1.05rem;
    border-radius: 1.25rem;
    border: 1px solid
      color-mix(in srgb, var(--tech-border) 70%, var(--tech-gradient-from, #38bdf8) 30%);
    background: linear-gradient(
      135deg,
      color-mix(
        in srgb,
        var(--tech-glass, transparent) 88%,
        var(--tech-glow-cyan, rgba(56, 189, 248, 0.18)) 12%
      ),
      var(--tech-glass, transparent)
    );
    color: var(--tech-fg, inherit);
    cursor: pointer;
    overflow: hidden;
    transition:
      border-color 0.2s,
      transform 0.2s,
      box-shadow 0.2s;

    &:hover {
      border-color: color-mix(
        in srgb,
        var(--tech-border) 40%,
        var(--tech-gradient-from, #38bdf8) 60%
      );
      transform: translateY(-1px);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--tech-gradient-from, #38bdf8) 35%, transparent);
    }

    &:focus-visible {
      outline: 2px solid var(--tech-gradient-from, #38bdf8);
      outline-offset: 2px;
    }
  }

  .about-tip-cta__glow {
    position: absolute;
    inset: -40% auto auto 20%;
    width: 55%;
    height: 120%;
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--tech-glow-cyan, rgba(56, 189, 248, 0.35)) 80%, transparent),
      transparent 70%
    );
    pointer-events: none;
    opacity: 0.55;
  }

  .about-tip-cta__badge {
    position: relative;
    font-size: 0.65rem;
    letter-spacing: 0.22em;
    font-weight: 650;
    color: var(--tech-muted, #888);
  }

  .about-tip-cta__main {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
  }

  .about-tip-cta__icon,
  .about-tip-cta__arrow {
    font-size: 0.85rem;
    color: var(--tech-gradient-from, #38bdf8);
    opacity: 0.9;
  }

  .about-tip-cta__title {
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .about-tip-cta__sub {
    position: relative;
    font-size: 0.75rem;
    color: var(--tech-muted, #888);
  }

  .about-tip-anchor--flash :deep(.about-tip) {
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--tech-gradient-from, #38bdf8) 55%, transparent),
      0 0 28px color-mix(in srgb, var(--tech-glow-cyan, rgba(56, 189, 248, 0.35)) 70%, transparent);
  }
</style>
