<template>
  <div v-if="isOpen" class="fixed inset-0 w-full flex justify-center items-center z-50">
    <!-- 完全覆盖整个屏幕的背景蒙版，点击蒙版关闭查看器 -->
    <div class="absolute inset-0 bg-black opacity-75 z-40" @click="closeViewer" />

    <div ref="viewer" class="relative z-50" :class="{ fullscreen: isFullscreen }">
      <img
        :src="currentImage"
        alt="Image Viewer"
        :style="imgStyle"
        class="transition-all duration-300"
        @click="toggleFullscreen"
      >
    </div>

    <!-- 按钮固定在屏幕中间下方 -->
    <div
      class="fixed bottom-10 left-1/2 z-50 flex max-w-[96vw] flex-wrap justify-center gap-2 -translate-x-1/2 px-2"
    >
      <button class="btn btn-primary btn-xs" @click="rotateLeft">
        左转
      </button>
      <button class="btn btn-primary btn-xs" @click="rotateRight">
        右转
      </button>
      <button class="btn btn-secondary btn-xs" @click="prevImage">
        上一张
      </button>
      <button class="btn btn-secondary btn-xs" @click="nextImage">
        下一张
      </button>
      <button class="btn btn-accent btn-xs" @click="resetTransform">
        重置
      </button>
      <button class="btn btn-warning btn-xs" @click="flipVerticalImage">
        上下翻转
      </button>
      <button class="btn btn-warning btn-xs" @click="flipHorizontalImage">
        左右翻转
      </button>
      <button class="btn btn-secondary btn-xs" @click="zoomIn">
        放大
      </button>
      <button class="btn btn-secondary btn-xs" @click="zoomOut">
        缩小
      </button>
      <button class="btn btn-info btn-xs" @click="toggleFullscreen">
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </button>
    </div>

    <!-- 关闭按钮 - 使用 daisyUI btn-warning 样式并统一按钮大小 -->
    <button class="btn btn-warning btn-xs absolute top-4 right-4 z-50" @click="closeViewer">
      关闭
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
  images: {
    type: Array as () => string[],
    required: true,
  },
  initialIndex: {
    type: Number,
    default: 0,
  },
});
  // 触发关闭事件
const emit = defineEmits(['close']);

const isOpen = ref(true);
const currentIndex = ref(props.initialIndex);
const currentImage = ref(props.images[currentIndex.value]);
const scale = ref(1);
const isFullscreen = ref(false);
const flipVertical = ref(false);
const flipHorizontal = ref(false); // 新增：左右反转
const rotation = ref(0); // 记录旋转角度

// 更新当前图片
watch(currentIndex, () => {
  currentImage.value = props.images[currentIndex.value];
});

watch(
  () => props.initialIndex,
  (index) => {
    if (index >= 0 && index < props.images.length) {
      currentIndex.value = index;
      currentImage.value = props.images[index];
      resetTransform();
    }
  },
);

// 确保在打开查看器时正确设置当前图片
onMounted(() => {
  currentImage.value = props.images[currentIndex.value];
  lockScroll(true); // 打开查看器时锁定页面滚动
});

// 关闭查看器
const closeViewer = () => {
  emit('close'); // 触发关闭事件
  isOpen.value = false;
  lockScroll(false); // 关闭查看器时解锁页面滚动
};

// 锁定和解锁页面滚动
const lockScroll = (lock: boolean) => {
  if (lock) {
    document.body.style.overflow = 'hidden'; // 禁用页面滚动
  }
  else {
    document.body.style.overflow = ''; // 恢复页面滚动
  }
};

// 缩放图片
const zoomIn = () => {
  scale.value += 0.1;
};

const zoomOut = () => {
  scale.value -= 0.1;
};

// 翻转图片（上下翻转）
const flipVerticalImage = () => {
  flipVertical.value = !flipVertical.value;
};

// 左右翻转图片
const flipHorizontalImage = () => {
  flipHorizontal.value = !flipHorizontal.value;
};

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  nextTick(() => {
    const viewer = document.querySelector('.fullscreen');
    if (viewer) {
      if (isFullscreen.value) {
        viewer.requestFullscreen();
      }
      else {
        document.exitFullscreen();
      }
    }
  });
};

// 旋转左
const rotateLeft = () => {
  rotation.value -= 90;
};

// 旋转右
const rotateRight = () => {
  rotation.value += 90;
};

// 切换到上一张图片
const prevImage = () => {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length;
};

// 切换到下一张图片
const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
};

// 复原图片所有变换
const resetTransform = () => {
  scale.value = 1;
  rotation.value = 0;
  flipVertical.value = false;
  flipHorizontal.value = false; // 清除左右反转
};

// 图片样式（缩放、翻转、旋转）
const imgStyle = computed(() => {
  return {
    transform: `scale(${scale.value}) rotate(${rotation.value}deg) 
                ${flipVertical.value ? 'rotateX(180deg)' : ''}
                ${flipHorizontal.value ? 'rotateY(180deg)' : ''}`,
    maxWidth: '90vw',
    maxHeight: '90vh',
  };
});
</script>

<style scoped>
  img {
    max-width: 100%;
    max-height: 100%;
    cursor: pointer;
  }

  /* 确保按钮固定在屏幕中间下方 */
  button {
    font-size: 0.875rem; /* 小一些的按钮 */
  }

  /* 按钮容器在屏幕中间下方 */
  div.fixed {
    left: 50%;
    transform: translateX(-50%);
  }

  /* 全屏样式 */
  .fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: black;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 美化关闭按钮为标准按钮样式 */
  button:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  /* 关闭按钮样式 - 使用 daisyUI btn-warning 样式，并统一大小 */
  button:focus {
    outline: none;
  }

  button.btn-xs {
    font-size: 0.75rem; /* 统一按钮的字体大小 */
  }
</style>
