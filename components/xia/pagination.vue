<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  total: {
    type: Number,
    default: 0,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  max: {
    type: Number,
    default: 7,
  },
  next: {
    type: Boolean,
    default: false,
  },
  prev: {
    type: Boolean,
    default: false,
  },
  /** daisyUI 按钮尺寸：xs / sm；默认中等 */
  size: {
    type: String as () => '' | 'xs' | 'sm',
    default: '',
  },
});
const totalPages = computed(() => Math.ceil(props.total / props.pageSize));
/** join 按钮尺寸 class */
const sizeClass = computed(() => {
  if (props.size === 'xs') return 'btn-xs';
  if (props.size === 'sm') return 'btn-sm';
  return '';
});
  /** 翻页箭头随尺寸缩小 */
const iconClass = computed(() =>
  props.size === 'xs' ? 'h-3.5 w-3.5' : props.size === 'sm' ? 'h-4 w-4' : 'h-6 w-6',
);
const emits = defineEmits(['change']);
const current = ref(props.currentPage);
const currentChange = (v: number) => {
  if (v < 1 || v > totalPages.value) {
    return;
  }
  current.value = v;
  // console.log(current.value);
  emits('change', v);
};
const startEnd = computed(() => {
  let start = 1;
  let end = 0;
  // 总页数不够，不够最大按钮数
  if (totalPages.value < props.max) {
    start = 1;
    end = totalPages.value;
  }
  else {
    const max = props.max;
    start = current.value - Math.floor(max / 2);
    end = current.value + Math.floor(max / 2);
    // 处理边界问题
    if (start < 1) {
      start = 1;
      end = max;
    }
    // 处理边界问题
    if (end > totalPages.value) {
      end = totalPages.value;
      start = totalPages.value - max + 1;
    }
  }
  return { start, end };
});
</script>

<script lang="ts">
export default {
  name: 'XiaPagination',
};
</script>

<template>
  <div class="join mt-4">
    <button
      v-if="prev"
      class="btn cyber-btn-secondary join-item"
      :class="sizeClass"
      @click="currentChange(current - 1)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        :class="iconClass"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button
      v-for="item of startEnd.end"
      v-show="item >= startEnd.start"
      class="btn join-item"
      :class="[
        sizeClass,
        {
          'btn-active': current === item,
          'btn-primary': current === item,
          'cyber-btn-secondary': current !== item,
        },
      ]"
      @click="currentChange(item)"
    >
      {{ item }}
    </button>
    <button
      v-if="next"
      class="btn cyber-btn-secondary join-item"
      :class="sizeClass"
      @click="currentChange(current + 1)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        :class="iconClass"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<style lang="less" scoped></style>
