<script setup lang="ts">
import { PropType } from 'vue'
const props = defineProps({
  images: {
    type: Array as PropType<BannerState[]>,
    default: () => [],
  },
  duration: {
    type: Number,
    default: 60000, // 默认一分钟
  },
  interval: {
    type: Boolean,
    default: false,
  },
  arrow: {
    type: Boolean,
    default: false,
  },
})
let timer = null // 清楚定时器
let isHover = false // hover时不轮播
onMounted(() => {
  // console.log(carouselRef);
  startTimer()
})
onUnmounted(() => {
  clearTimer()
})
const clearTimer = () => {
  isHover = true
  clearInterval(timer)
  timer = null
}
const startTimer = () => {
  isHover = false
  timer = setInterval(() => {
    if (isHover) { return }
    next()
  }, props.duration)
}

const carouselRef = ref(null)
// 多个ref就绑定为数组
const itemRefs = ref([])
const currentIndex = ref(0)
// 设置滚动条
const setScrollLeft = () => {
  const left = itemRefs.value[currentIndex.value].offsetWidth
  // console.log(currentIndex.value, left);
  carouselRef.value.scrollLeft = currentIndex.value * left
}

const len = computed(() => props.images.length)
const next = () => {
  currentIndex.value++
  if (currentIndex.value >= len.value) {
    currentIndex.value = 0
  }
  setScrollLeft()
}
const prev = () => {
  currentIndex.value--
  if (currentIndex.value <= 0) {
    currentIndex.value = len.value - 1
  }
  setScrollLeft()
}
</script>
<script lang="ts"></script>
<template>
  <div ref="carouselRef" class="xia-carousel">
    <div
      v-for="(image, index) in images"
      :key="image.title+index"
      ref="itemRefs"
      class="xia-carousel-item"
      :style="{ backgroundImage: `url(${image.url})` }"
      :title="image.title"
      @mouseout="clearTimer"
      @mouseleave="startTimer"
    >
      <div
        v-if="arrow"
        class="absolute flex justify-between transform -translate-y-1/2 left-0 right-0 top-1/2"
      >
        <span
          class="arrow-btn rounded-tr-md rounded-br-md"
          @click="prev"
        >❮</span>
        <span
          href="#"
          class="arrow-btn rounded-tl-md rounded-bl-md"
          @click="next"
        >❯</span>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.xia-carousel {
  height: 100px;
  border-radius: 0 0 8px 8px;
  @apply carousel w-full h-full from-black bg-gradient-to-r to-gray-700 relative;
}
.xia-carousel-item {
  object-fit:cover;
  background-position: center;
  @apply carousel-item w-full relative bg-cover;
}
.arrow-btn {
  @apply bg-black bg-opacity-20 h-16 px-4 py-2 cursor-pointer text-white flex justify-center items-center transition-transform scale-0 duration-500 hover:bg-black hover:bg-opacity-25;
}
.xia-carousel:hover .arrow-btn {
  @apply scale-100;
}
</style>
