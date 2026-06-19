<script setup lang="ts">
const demoPics = [
  {
    label: '光影边框 A',
    url: 'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-10/2h8itotl2bcx6dkiausbas-pm2.png',
  },
  {
    label: '封面 B',
    url: 'https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/1d6c3ffe42c3498a820965d9a46e0e2b-mini-program-code.jpg',
  },
];

const activeIndex = ref(0);
const activePic = computed(() => demoPics[activeIndex.value]?.url || demoPics[0].url);
</script>

<template>
  <div class="card-glow-lab space-y-3">
    <div class="card-glow-tabs">
      <button
        v-for="(item, index) in demoPics"
        :key="item.label"
        type="button"
        class="btn btn-xs"
        :class="activeIndex === index ? 'btn-primary' : 'btn-ghost'"
        @click="activeIndex = index"
      >
        {{ item.label }}
      </button>
    </div>
    <div class="card-glow-stage">
      <XiaCardBorderLight :pic="activePic" />
    </div>
    <p class="card-glow-tip">
      首页文章卡片同款边框光效组件，切换图片预览不同封面下的描边动画。
    </p>
  </div>
</template>

<style scoped>
  .card-glow-tabs {
    display: flex;
    gap: 6px;
  }

  .card-glow-stage {
    display: flex;
    justify-content: center;
    padding: 8px 0;
  }

  .card-glow-tip {
    font-size: 12px;
    line-height: 1.45;
    color: oklch(var(--bc) / 0.58);
  }
</style>
