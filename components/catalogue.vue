<script setup lang="ts">
import { reactive, ref, PropType } from "vue";
import { throttle, tocInter } from "@/utils";
const props = defineProps({
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
  <transition-group name="fade">
    <aside class="aisde-wrap" key="aisde-wrap">
      <div class="catalogue-wrap">
        <p class="heading">目录</p>
        <div
          v-for="(item, index) in topics"
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
    </aside>
  </transition-group>
</template>
<style lang="less" scoped>
.aisde-wrap {
  position: absolute;
  top: 0;
  right: -100%;
  transform: translateX(100%);
  height: 100%;
  transition: all 0.8s ease-in;
  max-width: 400px;
  display: none;
  @media screen and (min-width: 768px) {
    right: -5px;
    display: block;
  }
}
.catalogue-wrap {
  position: sticky;
  top: 66px;
  left: 0;
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
