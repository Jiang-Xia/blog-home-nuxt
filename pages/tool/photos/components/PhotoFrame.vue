<!-- components/PhotoFrame.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  // 布局配置
  margin: {
    type: Number,
    default: 20,
  },
  padding: {
    type: Number,
    default: 15,
  },
  // 边框样式
  border: {
    type: Object,
    default: () => ({
      width: 2,
      color: 'rgba(255,255,255,0.8)',
      radius: 8,
    }),
  },
  // 背景滤镜
  background: {
    type: Object,
    default: () => ({
      blur: 12,
      opacity: 0.7,
    }),
  },
});

const containerRef = ref<HTMLDivElement | null>(null);
let stage: Konva.Stage | null = null;
let mainLayer: Konva.Layer | null = null;
let konvaImage: Konva.Image | null = null;

// 核心布局参数
const layout = ref({
  containerWidth: 0,
  containerHeight: 0,
  contentWidth: 0,
  contentHeight: 0,
});

// 初始化舞台
const initStage = () => {
  if (!containerRef.value) return;

  // 获取容器尺寸（不依赖CSS）
  const rect = containerRef.value.getBoundingClientRect();
  layout.value = {
    containerWidth: rect.width,
    containerHeight: rect.height,
    contentWidth: rect.width - props.margin * 2,
    contentHeight: rect.height - props.margin * 2,
  };

  stage = new Konva.Stage({
    container: containerRef.value,
    width: layout.value.containerWidth,
    height: layout.value.containerHeight,
  });

  mainLayer = new Konva.Layer();
  stage.add(mainLayer);
};

// 创建背景元素
const createBackground = () => {
  return new Konva.Rect({
    x: props.margin,
    y: props.margin,
    width: layout.value.contentWidth,
    height: layout.value.contentHeight,
    fill: '#f8f9fa',
    cornerRadius: props.border.radius,
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowBlur: 10,
    shadowOffset: { x: 0, y: 4 },
  });
};

// 创建模糊滤镜层
const createBlurLayer = (img: HTMLImageElement) => {
  return new Konva.Image({
    image: img,
    x: props.margin + props.padding,
    y: props.margin + props.padding,
    width: layout.value.contentWidth - props.padding * 2,
    height: layout.value.contentHeight - props.padding * 2,
    filters: [Konva.Filters.Blur],
    blurRadius: props.background.blur,
    opacity: props.background.opacity,
    cornerRadius: props.border.radius - 2,
  });
};

// 创建主图片层
const createMainImage = (img: HTMLImageElement) => {
  return new Konva.Image({
    image: img,
    x: props.margin + props.padding + props.border.width,
    y: props.margin + props.padding + props.border.width,
    width: layout.value.contentWidth - props.padding * 2 - props.border.width * 2,
    height: layout.value.contentHeight - props.padding * 2 - props.border.width * 2,
    cornerRadius: props.border.radius - 4,
  });
};

// 创建边框系统
const createBorderSystem = () => {
  return new Konva.Group({
    x: props.margin + props.padding,
    y: props.margin + props.padding,
  }).add(
    new Konva.Rect({
      // 外边框
      width: layout.value.contentWidth - props.padding * 2,
      height: layout.value.contentHeight - props.padding * 2,
      stroke: props.border.color,
      strokeWidth: props.border.width,
      cornerRadius: props.border.radius,
    }),
    new Konva.Rect({
      // 内边框
      x: props.border.width,
      y: props.border.width,
      width: layout.value.contentWidth - props.padding * 2 - props.border.width * 2,
      height: layout.value.contentHeight - props.padding * 2 - props.border.width * 2,
      stroke: 'rgba(0,0,0,0.1)',
      strokeWidth: 1,
      cornerRadius: props.border.radius - 2,
    }),
  );
};

// 创建信息标签
const createInfoLabel = () => {
  return new Konva.Text({
    x: props.margin + props.padding + 20,
    y: layout.value.containerHeight - props.margin - props.padding - 60,
    text: 'Photo Information',
    fontSize: 14,
    padding: 8,
    fill: '#333',
    backgroundFill: 'rgba(255,255,255,0.9)',
    cornerRadius: 4,
  });
};

// 加载图片
const loadImage = async () => {
  if (!stage || !mainLayer) return;

  const img = new Image();
  img.src = props.src;
  img.crossOrigin = 'anonymous';
  await new Promise(resolve => (img.onload = resolve));

  // 清除旧内容
  mainLayer.destroyChildren();

  // 计算图片缩放
  const maxWidth = layout.value.contentWidth - props.padding * 2 - props.border.width * 2;
  const scale = Math.min(maxWidth / img.width, 1);

  // 创建各层级元素
  mainLayer.add(createBackground());
  mainLayer.add(createBlurLayer(img));
  mainLayer.add(createBorderSystem());

  konvaImage = createMainImage(img);
  konvaImage.scale({ x: scale, y: scale });
  mainLayer.add(konvaImage);

  mainLayer.add(createInfoLabel());
  mainLayer.batchDraw();
};

// 响应式更新系统
const updateLayout = () => {
  if (!containerRef.value) return;

  const rect = containerRef.value.getBoundingClientRect();
  layout.value = {
    containerWidth: rect.width,
    containerHeight: rect.height,
    contentWidth: rect.width - props.margin * 2,
    contentHeight: rect.height - props.margin * 2,
  };

  stage?.size({
    width: layout.value.containerWidth,
    height: layout.value.containerHeight,
  });

  loadImage();
};

// 事件监听
const debouncedResize = debounce(updateLayout, 200);

onMounted(() => {
  initStage();
  loadImage();
  window.addEventListener('resize', debouncedResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', debouncedResize);
  stage?.destroy();
});

// 属性变化监听
watch(() => [props.margin, props.padding, props.border, props.background], updateLayout);

// 工具函数
function debounce(fn: Function, delay: number) {
  let timer: number;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}
</script>

<template>
  <div ref="containerRef" class="konva-container" />
</template>

<style>
  .konva-container {
    /* 确保Konva画布填充容器 */
    height: 50vh;
    width: 60vw;
  }
</style>
