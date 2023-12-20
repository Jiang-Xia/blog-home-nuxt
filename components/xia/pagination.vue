<script setup lang="ts">
  import { ref } from 'vue'
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
  })
  const totalPages = computed(() => Math.ceil(props.total / props.pageSize))
  const emits = defineEmits(['change'])
  const current = ref(props.currentPage)
  const currentChange = (v: number) => {
    if (v < 1 || v > totalPages.value) {
      return
    }
    current.value = v
    // console.log(current.value);
    emits('change', v)
  }
  const startEnd = computed(() => {
    let start = 1
    let end = 0
    // 总页数不够，不够最大按钮数
    if (totalPages.value < props.max) {
      start = 1
      end = totalPages.value
    } else {
      const max = props.max
      start = current.value - Math.floor(max / 2)
      end = current.value + Math.floor(max / 2)
      // 处理边界问题
      if (start < 1) {
        start = 1
        end = max
      }
      // 处理边界问题
      if (end > totalPages.value) {
        end = totalPages.value
        start = totalPages.value - max + 1
      }
    }
    return { start, end, }
  })
</script>
<script lang="ts">
  export default {
    name: 'XiaPagination',
  }
</script>
<template>
  <div class="join mt-4">
    <button v-if="prev" class="btn btn-neutral join-item" @click="currentChange(current - 1)">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
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
      :class="{
        'btn-active': current === item,
        'btn-primary': current === item,
        'btn-neutral': current !== item,
      }"
      @click="currentChange(item)"
    >
      {{ item }}
    </button>
    <button v-if="next" class="btn btn-neutral join-item" @click="currentChange(current + 1)">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
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
