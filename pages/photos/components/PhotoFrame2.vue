<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import Konva from 'konva';
import ExifReader from 'exifreader';

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
const exifInfo = ref<any>({});
// 核心布局参数
const layout = ref({
  containerWidth: 0,
  containerHeight: 0,
  contentWidth: 0,
  contentHeight: 0,
});

// 获取图片信息
const getImageData = async (img: any) => {
  if (img.includes('blob:')) {
    img = await blobUrlToArrayBufferReader(img);
    console.log(img);
  }
  const tags: any = await ExifReader.load(img, { async: true });
  const customTags = [
    'FNumber',
    'Make',
    'DateTime',
    'ExposureTime',
    'FocalLength',
    'FocalLengthIn35mmFilm',
    'ISOSpeedRatings',
  ];
  const obj: any = {};
  customTags.forEach((key) => {
    obj[key] = tags[key]?.description || '';
  });
  return obj;
};
  // blob url 转为文件对象
async function blobUrlToArrayBufferReader(blobUrl: string) {
  const blob = await fetch(blobUrl).then(r => r.blob());
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
  });
}
// 初始化舞台
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

// 创建信息面板
const createInfoLabel = () => {
  return new Konva.Text({
    x: props.margin + props.padding + 20,
    y: layout.value.containerHeight - props.margin - props.padding - 60,
    text: `${exifInfo.value.Make}\n${exifInfo.value.FocalLengthIn35mmFilm}\n${exifInfo.value.FNumber}n${exifInfo.value.ExposureTime}s\nISO${exifInfo.value.ISOSpeedRatings}
    `,
    fontSize: 14,
    fill: 'white',
    shadowColor: 'black',
    shadowBlur: 5,
    shadowOpacity: 0.8,
    lineHeight: 1.5,
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

// 响应式更新
watch(
  () => exifInfo.value,
  () => {
    if (mainLayer) {
      const infoNode = mainLayer.findOne('.info-label');
      if (infoNode) {
        (infoNode as Konva.Text).text(
          `${exifInfo.value.filename}\n${exifInfo.value.size}\n${exifInfo.value.time}`,
        );
        mainLayer.batchDraw();
      }
    }
  },
);

onMounted(() => {
  initStage();
  loadImage();
});
watch(
  () => props.src,
  async (n) => {
    const info = await getImageData(props.src);
    exifInfo.value = info;
    loadImage();
    console.log('exifInfo', info);
  },
);

onBeforeUnmount(() => {
  stage?.destroy();
});
</script>

<template>
  <div
    ref="containerRef"
    class="photo-frame"
  />
</template>

<style lang="less" scoped>
  .photo-frame {
    height: 50vh;
    width: 60vw;
  }
</style>
