<script setup lang="ts">
/**
   * 面板头图（美术改版 v8）：紫金渐变横幅 + 圆徽章图标 + 标题/副标题
   * 公会 / 成就 / 背包 / 宠物图鉴四个面板统一视觉入口；
   * 图标复用 public/rpg/icons 既有资产，后续可整卡替换为插画头图
   * （替换时仅需把 __medal img 的 src 换成 750×240 级别的场景图，
   *   圆徽章改为悬浮于左下角的锚点，样式无需改动）
   */
withDefaults(
  defineProps<{
    /** 图标文件名（/rpg/icons/{icon}.png）或完整路径 */
    icon: string;
    title: string;
    subtitle?: string;
    /** 徽章底色 tone：violet（默认）/ gold */
    tone?: 'violet' | 'gold';
  }>(),
  { subtitle: '', tone: 'violet' },
);
</script>

<template>
  <div class="rpg-panel-hero" :class="`rpg-panel-hero--${tone}`">
    <span class="rpg-panel-hero__medal">
      <img :src="icon.startsWith('/') ? icon : `/rpg/icons/${icon}.png`" alt="" loading="lazy">
    </span>
    <div class="rpg-panel-hero__text">
      <b>{{ title }}</b>
      <small v-if="subtitle">{{ subtitle }}</small>
    </div>
    <!-- 右侧装饰角标（可插槽放进度/计数等） -->
    <div v-if="$slots.extra" class="rpg-panel-hero__extra">
      <slot name="extra" />
    </div>
    <span class="rpg-panel-hero__glint" aria-hidden="true" />
  </div>
</template>

<style scoped>
  .rpg-panel-hero {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin-bottom: 14px;
    border-radius: 14px;
    overflow: hidden;
    color: #fff;
    background: var(--rpg-art-violet-grad, linear-gradient(135deg, #7c5cf0, #5b3fd6));
    box-shadow: var(--rpg-art-shadow-violet, 0 6px 16px rgb(92 63 214 / 0.32));
  }

  .rpg-panel-hero--gold {
    background: var(--rpg-art-gold-grad, linear-gradient(135deg, #e8b04b, #d9a13c));
    box-shadow: var(--rpg-art-shadow-gold, 0 6px 16px rgb(217 161 60 / 0.32));
  }

  /* 圆徽章：白底金环，对齐全局圆图徽章风 */
  .rpg-panel-hero__medal {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    border-radius: 50%;
    background: radial-gradient(circle at 34% 30%, #fffaf0, #fdf3da);
    border: 2.5px solid rgb(255 255 255 / 0.85);
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.22);
  }

  .rpg-panel-hero__medal img {
    width: 26px;
    height: 26px;
    object-fit: contain;
  }

  .rpg-panel-hero__text {
    min-width: 0;
  }

  .rpg-panel-hero__text b {
    display: block;
    font-size: 15px;
    font-weight: 800;
    line-height: 1.3;
    text-shadow: 0 1px 2px rgb(0 0 0 / 0.18);
  }

  .rpg-panel-hero__text small {
    display: block;
    font-size: 11px;
    opacity: 0.85;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rpg-panel-hero__extra {
    margin-left: auto;
    flex-shrink: 0;
  }

  /* 右上高光斜切 — 纯 CSS 代替插画光效 */
  .rpg-panel-hero__glint {
    position: absolute;
    top: -34px;
    right: -18px;
    width: 120px;
    height: 68px;
    border-radius: 50%;
    background: rgb(255 255 255 / 0.14);
    pointer-events: none;
  }

  @media (max-width: 639px) {
    .rpg-panel-hero {
      padding: 10px 12px;
      gap: 10px;
    }

    .rpg-panel-hero__medal {
      width: 36px;
      height: 36px;
    }

    .rpg-panel-hero__medal img {
      width: 22px;
      height: 22px;
    }

    .rpg-panel-hero__text b {
      font-size: 13.5px;
    }
  }
</style>
