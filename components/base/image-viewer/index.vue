<template>
  <div v-if="isOpen" class="fixed inset-0 z-[10050] flex w-full items-center justify-center">
    <div class="absolute inset-0 z-40 bg-black/75" @click="closeViewer" />

    <div
      v-if="images.length > 1"
      class="absolute top-4 left-1/2 z-[10050] -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs text-white/90"
    >
      {{ currentIndex + 1 }} / {{ images.length }}
    </div>

    <div ref="viewer" class="relative z-[10050]" :class="{ fullscreen: isFullscreen }">
      <img
        :src="currentImage"
        alt="Image Viewer"
        :style="imgStyle"
        class="transition-all duration-300"
        :class="{ 'cursor-default': simple }"
        @click="onImageClick"
      >
    </div>

    <div
      v-if="!simple"
      class="image-viewer-toolbar fixed bottom-10 left-1/2 z-[10050] flex max-w-[96vw] -translate-x-1/2 flex-wrap justify-center gap-2 px-2"
    >
      <button class="btn btn-primary btn-xs" @click="rotateLeft">
        左转
      </button>
      <button class="btn btn-primary btn-xs" @click="rotateRight">
        右转
      </button>
      <button v-if="images.length > 1" class="btn btn-secondary btn-xs" @click="prevImage">
        上一张
      </button>
      <button v-if="images.length > 1" class="btn btn-secondary btn-xs" @click="nextImage">
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
      <button v-if="canDownload" class="btn btn-success btn-xs" @click="downloadCurrent">
        下载
      </button>
    </div>

    <button class="btn btn-warning btn-xs absolute top-4 right-4 z-[10050]" @click="closeViewer">
      关闭
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({
  images: {
    type: Array as () => string[],
    required: true,
  },
  initialIndex: {
    type: Number,
    default: 0,
  },
  /** 仅查看大图，隐藏旋转/翻转等工具 */
  simple: {
    type: Boolean,
    default: false,
  },
  fileNames: {
    type: Array as () => string[],
    default: () => [],
  },
  onDownload: {
    type: Function as () => ((index: number) => void | Promise<void>) | null,
    default: null,
  },
});

const emit = defineEmits(['close']);

const isOpen = ref(true);
const currentIndex = ref(props.initialIndex);
const currentImage = ref(props.images[currentIndex.value] ?? '');
const scale = ref(1);
const isFullscreen = ref(false);
const flipVertical = ref(false);
const flipHorizontal = ref(false);
const rotation = ref(0);

const canDownload = computed(() => Boolean(currentImage.value));

function syncCurrentImage() {
  const next = props.images[currentIndex.value];
  if (next) {
    currentImage.value = next;
  }
}

watch(currentIndex, () => {
  syncCurrentImage();
  resetTransform();
});

watch(
  () => props.initialIndex,
  (index) => {
    if (index >= 0 && index < props.images.length) {
      currentIndex.value = index;
      syncCurrentImage();
      resetTransform();
    }
  },
);

watch(
  () => props.images,
  (images) => {
    if (!images.length) {
      closeViewer();
      return;
    }
    if (currentIndex.value >= images.length) {
      currentIndex.value = images.length - 1;
    }
    syncCurrentImage();
  },
  { deep: true },
);

const closeViewer = () => {
  emit('close');
  isOpen.value = false;
  lockScroll(false);
};

const lockScroll = (lock: boolean) => {
  document.body.style.overflow = lock ? 'hidden' : '';
};

const onKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) {
    return;
  }

  if (event.key === 'Escape') {
    closeViewer();
    return;
  }

  if (props.simple) {
    return;
  }

  if (event.key === 'ArrowLeft' && props.images.length > 1) {
    event.preventDefault();
    prevImage();
    return;
  }

  if (event.key === 'ArrowRight' && props.images.length > 1) {
    event.preventDefault();
    nextImage();
    return;
  }

  if (event.key === '+' || event.key === '=') {
    event.preventDefault();
    zoomIn();
    return;
  }

  if (event.key === '-') {
    event.preventDefault();
    zoomOut();
  }
};

onMounted(() => {
  syncCurrentImage();
  lockScroll(true);
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  lockScroll(false);
  window.removeEventListener('keydown', onKeydown);
});

const zoomIn = () => {
  scale.value = Math.min(3, scale.value + 0.1);
};

const zoomOut = () => {
  scale.value = Math.max(0.2, scale.value - 0.1);
};

const flipVerticalImage = () => {
  flipVertical.value = !flipVertical.value;
};

const flipHorizontalImage = () => {
  flipHorizontal.value = !flipHorizontal.value;
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  nextTick(() => {
    const viewer = document.querySelector('.fullscreen');
    if (!viewer) {
      return;
    }
    if (isFullscreen.value) {
      viewer.requestFullscreen();
    }
    else {
      document.exitFullscreen();
    }
  });
};

const rotateLeft = () => {
  rotation.value -= 90;
};

const rotateRight = () => {
  rotation.value += 90;
};

const prevImage = () => {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length;
};

const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
};

const resetTransform = () => {
  scale.value = 1;
  rotation.value = 0;
  flipVertical.value = false;
  flipHorizontal.value = false;
};

const onImageClick = () => {
  if (!props.simple) {
    toggleFullscreen();
  }
};

const resolveDownloadName = () => {
  const customName = props.fileNames[currentIndex.value]?.trim();
  if (customName) {
    return customName.includes('.') ? customName : `${customName}.png`;
  }
  return `image-${currentIndex.value + 1}.png`;
};

const downloadCurrent = async () => {
  if (!currentImage.value) {
    return;
  }

  if (props.onDownload) {
    await props.onDownload(currentIndex.value);
    return;
  }

  const link = document.createElement('a');
  link.href = currentImage.value;
  link.download = resolveDownloadName();
  link.click();
};

const imgStyle = computed(() => ({
  transform: `scale(${scale.value}) rotate(${rotation.value}deg)
              ${flipVertical.value ? 'rotateX(180deg)' : ''}
              ${flipHorizontal.value ? 'rotateY(180deg)' : ''}`,
  maxWidth: '90vw',
  maxHeight: '90vh',
}));
</script>

<style scoped>
  img {
    max-width: 100%;
    max-height: 100%;
    cursor: pointer;
  }

  button {
    font-size: 0.875rem;
  }

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

  button:focus {
    outline: none;
  }

  button.btn-xs {
    font-size: 0.75rem;
  }
</style>
