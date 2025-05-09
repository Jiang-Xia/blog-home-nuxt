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
    type: String,
    default: '20px',
  },
  padding: {
    type: Number,
    default: 15,
  },
  shadow: {
    type: Number,
    default: 15,
  },
  // 边框样式
  border: {
    type: Object,
    default: () => ({
      width: 2,
      color: 'rgba(255,255,255,0.8)',
      radius: 12,
    }),
  },
  // 背景滤镜
  background: {
    type: Object,
    default: () => ({
      blur: 30,
      opacity: 0.7,
    }),
  },
});

const containerRef = ref<HTMLDivElement | null>(null);
let stage: Konva.Stage | null = null;
let mainLayer: Konva.Layer | null = null;

const exifInfo = ref<any>({});
// 核心布局参数
const layout = reactive<any>({
  containerWidth: 0,
  containerHeight: 0,
  contentWidth: 0,
  contentHeight: 0,
  img: null,
  imgWidth: 0,
  imgHeight: 0,
  logo: '',
});

// 获取图片信息
const getExifInfo = async (img: any) => {
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
// 根据exif获取品牌logo
const getLogo = async () => {
  let make: string = exifInfo.value.Make;
  if (make) {
    make = make.toLocaleUpperCase();
    const logo = '/images/photos/logo/' + 'nikon.png';
    console.log('logo', logo);
    return await loadImage(logo);
  }
};

// 初始化舞台
const initStage = async () => {
  if (!containerRef.value) return;
  // 获取容器尺寸（不依赖CSS）
  const rect = containerRef.value.getBoundingClientRect();
  console.log('当前容器宽高：', rect.width, rect.height);
  // reactive批量赋值
  Object.assign(layout, {
    containerWidth: rect.width || layout.imgWidth,
    containerHeight: rect.height || layout.imgHeight,
    contentWidth: rect.width,
    contentHeight: rect.height,
  });
  stage = new Konva.Stage({
    container: containerRef.value,
    width: layout.containerWidth,
    height: layout.containerHeight,
  });

  mainLayer = new Konva.Layer();
  stage.add(mainLayer);
};

const createBackground = () => {
  return new Konva.Rect({
    x: 0,
    y: 0,
    width: layout.containerWidth,
    height: layout.containerHeight,
    fill: '#ff0',
    // cornerRadius: props.border.radius,
    // shadowColor: 'rgba(0,0,0,0.15)',
    // shadowBlur: 10,
    // shadowOffset: { x: 0, y: 4 },
  });
};

// 创建模糊滤镜层
const createBlurLayer = (img: HTMLImageElement) => {
  const blurImage = new Konva.Image({
    image: img,
    x: 0,
    y: 0,
    width: layout.containerWidth,
    height: layout.containerHeight,
    // opacity: props.background.opacity,
  });
  blurImage.cache();
  blurImage.filters([Konva.Filters.Blur]);
  blurImage.blurRadius(props.background.blur);
  return blurImage;
};

// 创建主图片层
const createMainImage = (img: HTMLImageElement) => {
  // console.log('createMainImage', layout);
  const width = Math.min(layout.imgWidth, layout.containerWidth - props.padding * 2);
  const height = Math.min(layout.imgHeight, layout.containerHeight - props.padding * 2);
  // 计算图片缩放
  const maxWidth = layout.containerWidth - props.padding * 2;
  const scale = Math.min(maxWidth / layout.imgWidth, 1);

  const mainImage = new Konva.Image({
    image: img,
    x: props.padding,
    y: props.padding,
    width,
    height,
    // 前景主要图片阴影
    shadowColor: '#f00',
    shadowBlur: props.shadow,
    // 前景主要图片圆角
    cornerRadius: props.border.radius,
  });
    // mainImage.cache();
    // mainImage.scale({ x: scale, y: scale });
  return mainImage;
};
  // 创建边框系统
const createBorderSystem = () => {
  return new Konva.Group({
    x: props.padding,
    y: props.padding,
  })
    .add
  // new Konva.Rect({
  //   // 外边框
  //   width: layout.contentWidth - props.padding * 2,
  //   height: layout.contentHeight - props.padding * 2,
  //   stroke: props.border.color,
  //   strokeWidth: props.border.width,
  //   cornerRadius: props.border.radius,
  // }),
  // new Konva.Rect({
  //   // 内边框
  //   x: props.border.width,
  //   y: props.border.width,
  //   width: layout.contentWidth - props.padding * 2 - props.border.width * 2,
  //   height: layout.contentHeight - props.padding * 2 - props.border.width * 2,
  //   stroke: 'rgba(0,0,0,0.1)',
  //   strokeWidth: 1,
  //   cornerRadius: props.border.radius - 2,
  // }),
    ();
};

// 创建信息面板
const createInfoLabel = () => {
  const infoGroup = new Konva.Group();
  const makeText = new Konva.Text({
    x: props.padding + 20,
    y: layout.containerHeight - props.padding - 60,
    text: `${exifInfo.value.Make}`,
    fontSize: 14,
    fill: 'white',
    shadowColor: 'black',
    shadowBlur: 5,
    shadowOpacity: 0.8,
    lineHeight: 1.5,
  });
  const exposureText = new Konva.Text({
    x: props.padding + 20,
    y: layout.containerHeight - props.padding - 20,
    text: `${exifInfo.value.FocalLengthIn35mmFilm}
    \n${exifInfo.value.FNumber}
    \n${exifInfo.value.ExposureTime ? exifInfo.value.ExposureTime + 'n' : ''}
    \n${exifInfo.value.ISOSpeedRatings ? 'ISO' + exifInfo.value.ISOSpeedRatings : ''}
    `,
    fontSize: 14,
    fill: 'white',
    shadowColor: 'black',
    shadowBlur: 5,
    shadowOpacity: 0.8,
    lineHeight: 1.5,
  });

  if (layout.logo) {
    const logoImage = new Konva.Image({
      image: layout.logo,
      x: props.padding,
      y: props.padding,
      width: 30,
      height: 30,
      // 前景主要图片圆角
      cornerRadius: 2,
    });
    infoGroup.add(logoImage);
  }
  infoGroup.add(makeText);
  infoGroup.add(exposureText);
  return infoGroup;
};

// 加载图片
const loadImage = async (src: string) => {
  const img = new Image();
  img.src = src;
  img.crossOrigin = 'anonymous';
  await new Promise(resolve => (img.onload = resolve));
  return img;
};
  // 获取和计算图片长宽信息
const calcImageData = async (src: string) => {
  const img = await loadImage(src);
  layout.imgWidth = img.width;
  layout.imgHeight = img.height;
  layout.img = img;
  return img;
};
  // 初始化
const initCanvas = async (img: HTMLImageElement) => {
  if (!stage || !mainLayer) return;
  // 清除旧内容
  mainLayer.destroyChildren();
  // 创建各层级元素
  mainLayer.add(createBackground());
  mainLayer.add(createBlurLayer(img));
  mainLayer.add(createMainImage(img));
  mainLayer.add(createInfoLabel());
  // mainLayer.add(createBorderSystem());
  mainLayer.batchDraw();
};

onMounted(async () => {
  // await calcImageData(props.src);
  await initStage();
  initPage(props.src);
});
watch(
  () => props.src,
  async (n: string) => {
    initPage(n);
  },
);
const initPage = async (n: string) => {
  const [info, img] = await Promise.all([getExifInfo(n), calcImageData(n)]);
  exifInfo.value = info;
  const logo = await getLogo();
  layout.logo = logo;
  initCanvas(img);
  console.log('exifInfo', info);
  console.log('layou-info', { ...layout });
};

onBeforeUnmount(() => {
  stage?.destroy();
});
</script>

<template>
  <div
    ref="containerRef"
    class="photo-frame"
    :style="{ margin: margin }"
  />
</template>

<style lang="less" scoped>
  .photo-frame {
    height: 50vh;
    width: 60vw;
    // padding: 16px;
  }
</style>
