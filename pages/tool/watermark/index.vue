<template>
  <div class="mx-auto w-full max-w-3xl space-y-4">
    <CyberToolCard title="批量加水印" desc="本功能 ts 部分由 ChatGPT 编写（图片查看器亦同）">
      <div class="join w-full pb-2">
        <select v-model="timeMark" class="select select-bordered login-input join-item">
          <option value="no">
            无时间水印
          </option>
          <option value="yes">
            有时间水印
          </option>
        </select>
        <input
          v-model="customMark"
          class="input input-bordered login-input join-item min-w-0 flex-1"
          placeholder="输入自定义水印描述"
        >
      </div>
      <input
        ref="fileContents"
        multiple
        type="file"
        class="file-input file-input-bordered login-input w-full"
        name="fileContents"
        accept="image/*"
        @change="handleFileUpload"
      >
    </CyberToolCard>

    <CyberToolCard title="预览与下载">
      <span v-if="loading" class="loading loading-dots loading-md text-primary" />
      <div class="mb-4 flex items-center justify-between gap-2">
        <span class="text-sm text-tech-subtle">瀑布流展示已选照片</span>
        <CyberButton variant="secondary" class="!py-2 !text-sm" @click="downloadAllImages">
          下载所有图片
        </CyberButton>
      </div>
      <div class="container mx-auto columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
        <div
          v-for="(image, index) in imageSrcList"
          :key="index"
          class="item mb-4"
          @click="openViewer(index)"
        >
          <canvas ref="canvasRefs" class="h-auto w-full rounded-lg" />
        </div>
      </div>
    </CyberToolCard>

    <base-image-viewer
      v-if="isViewerOpen"
      :images="markMmageSrcList"
      :initial-index="initialIndex"
      @close="isViewerOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { messageDanger } from '@/utils/toast';
import { loadWatermarkScripts } from '~/utils/script-loader';

const customMark = ref('江夏的图片');
const timeMark = ref('yes');
const imageSrcList = ref<string[]>([]);
const markMmageSrcList = ref<string[]>([]);
const canvasRefs = ref<(HTMLCanvasElement | null)[]>([]);
const loading = ref(false);

const handleFileUpload = (event: Event): void => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (files) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          imageSrcList.value.push(e.target.result as string);
          drawWatermark(e.target.result as string, imageSrcList.value.length - 1);
        }
      };
      reader.readAsDataURL(file);
    });
  }
};

const drawWatermark = (src: string, index: number): void => {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    const canvas = canvasRefs.value[index];
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    ctx?.drawImage(img, 0, 0);

    const watermarkText = `${customMark.value}  ${timeMark.value === 'yes' ? new Date().toLocaleDateString() : ''}`;
    const fontSize = 30;
    ctx!.font = `${fontSize}px Arial`;
    ctx!.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx!.textAlign = 'center';
    ctx!.textBaseline = 'middle';

    const x = canvas.width / 2;
    const y = canvas.height - fontSize - 20;

    ctx!.fillText(watermarkText, x, y);
    const dataUrl = canvas.toDataURL('image/png');
    markMmageSrcList.value.push(dataUrl);
  };
};

const downloadAllImages = (): void => {
  if (!imageSrcList.value.length) {
    messageDanger('请先选择图片!');
    return;
  }
  loading.value = true;
  setTimeout(() => {
    const zip = new JSZip();

    markMmageSrcList.value.forEach((item, index) => {
      zip.file(`watermarked-image-${index + 1}.png`, item.split(',')[1], { base64: true });
    });

    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'watermarked-images.zip';
      link.click();
      loading.value = false;
    });
  }, 10);
};
const isViewerOpen = ref(false);
const initialIndex = ref(0);
const openViewer = (index: any) => {
  isViewerOpen.value = true;
  initialIndex.value = index;
};
onMounted(async () => {
  await loadWatermarkScripts();
});
</script>

<style lang="less" scoped>
  .image-item {
    width: 100%;
    height: 200px;
    background-color: var(--tech-border);
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.5s ease,
      transform 0.5s ease;
  }

  .image-item.loaded {
    opacity: 1;
    transform: translateY(0);
  }
</style>
