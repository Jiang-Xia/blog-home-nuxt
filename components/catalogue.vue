<script setup lang="ts">
import type { PropType } from 'vue';
import type { tocInter } from '@/utils';

defineProps({
  topics: {
    type: Array as PropType<tocInter[]>,
    default: () => [],
  },
});
const goTopicItem = (item: tocInter) => {
  const dom: HTMLElement | null = document.getElementById(item.id);
  if (dom) {
    const wh = window.innerHeight * 0.4 + 20; // 20为margin值
    const top = dom.offsetTop;
    document.documentElement.scrollTop = wh + top - 58;
  }
};
  // 滚动高亮目录没有做
  // const currentActive = ref(null)
  // const scrollHandle = (e: any) => {
  //   const ids: string[] = props.topics.map((v: any) => +'#' + v.id)
  // }
  // window.addEventListener('scroll', throttle(scrollHandle, 100), true)
</script>

<template>
  <div class="catalogue-wrap">
    <p class="heading">
      目录
    </p>
    <div
      v-for="item in topics"
      :key="item.id"
      class="topic-item text-sm truncate"
      :style="{
        textIndent: 8 * Number(item.level) + 'px',
      }"
      @click="goTopicItem(item)"
    >
      {{ item.text }}
    </div>
  </div>
</template>

<style lang="less" scoped>
  .catalogue-wrap {
    width: 100%;
    .heading {
      font-weight: 600;
      text-indent: 1.5em;
    }
    .topic-item {
      padding: 6px 16px;
      cursor: pointer;
    }
    .topic-item:hover {
      text-decoration: underline;
    }
  }
</style>
