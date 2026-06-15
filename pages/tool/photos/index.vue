<script setup lang="ts">
import FilterBorderCanvas from './components/FilterBorderCanvas.vue';
import {
  DEFAULT_PHOTO_SETTINGS,
  EXIF_LABELS,
  LOGO_BRAND_OPTIONS,
  MAX_PHOTOS,
  type PhotoSettings,
} from './constants';
import {
  clearPhotoCaches,
  EXPORT_SIZE,
  exportPhotoBlob,
  getPhotoExif,
  initPhotoWorker,
  preloadPhotoAssets,
  registerPhotoFile,
  terminatePhotoWorker,
  unregisterPhotoFile,
} from './photo-renderer';
import { messageDanger, messageSuccess } from '~~/utils/toast';
import { debounce } from '~~/utils/index';
import { loadPhotoScripts } from '~/utils/script-loader';

interface PhotoItem {
  id: string;
  url: string;
  name: string;
}

const scriptsReady = ref(false);
const settings = reactive<PhotoSettings>({ ...DEFAULT_PHOTO_SETTINGS });
const appliedSettings = ref<PhotoSettings>({ ...DEFAULT_PHOTO_SETTINGS });

const imageList = ref<PhotoItem[]>([]);
const currentIndex = ref(0);
const exifMap = ref<Record<string, Record<string, string>>>({});
const exifLoading = ref(false);

const fileInputRef = ref<HTMLInputElement | null>(null);
const exportLoading = ref(false);
const exportProgress = ref('');
const isDragging = ref(false);

const EMPTY_EXIF: Record<string, string> = {};

const currentPhoto = computed(() => imageList.value[currentIndex.value] ?? null);
const currentExif = computed(() => {
  const key = currentPhoto.value?.url;
  if (!key) return EMPTY_EXIF;
  return exifMap.value[key] ?? EMPTY_EXIF;
});
const hasExifData = computed(() => Object.values(currentExif.value).some(v => Boolean(v)));

const loadExifForPhoto = async (url: string) => {
  if (!url || !scriptsReady.value || exifMap.value[url]) return;
  exifLoading.value = true;
  try {
    exifMap.value[url] = await getPhotoExif(url);
  }
  catch {
    exifMap.value[url] = EMPTY_EXIF;
  }
  finally {
    exifLoading.value = false;
  }
};

watch(
  () => currentPhoto.value?.url,
  (url) => {
    if (url && scriptsReady.value) loadExifForPhoto(url);
  },
);

watch(currentIndex, (index) => {
  const list = imageList.value;
  [index - 1, index + 1].forEach((i) => {
    const item = list[i];
    if (item && scriptsReady.value) preloadPhotoAssets(item.url);
  });
});

watch(scriptsReady, (ready) => {
  const url = currentPhoto.value?.url;
  if (ready && url) loadExifForPhoto(url);
});

const applySettings = debounce(() => {
  appliedSettings.value = { ...settings };
}, 250);

watch(settings, applySettings, { deep: true });

const createPhotoItem = (file: File): PhotoItem => {
  const url = URL.createObjectURL(file);
  registerPhotoFile(url, file);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url,
    name: file.name,
  };
};

const ensureExportReady = async () => {
  if (typeof JSZip === 'undefined') {
    await loadPhotoScripts();
  }
};

onMounted(() => {
  initPhotoWorker();
  scriptsReady.value = true;
});

const addFiles = (files: FileList | File[]) => {
  const remain = MAX_PHOTOS - imageList.value.length;
  if (remain <= 0) {
    messageDanger(`最多选择 ${MAX_PHOTOS} 张图片`);
    return;
  }
  const picked = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (!picked.length) {
    messageDanger('请选择图片文件');
    return;
  }
  const toAdd = picked.slice(0, remain);
  if (picked.length > remain)
    messageDanger(`最多选择 ${MAX_PHOTOS} 张，已添加 ${toAdd.length} 张`);
  const newItems = toAdd.map(file => createPhotoItem(file));
  imageList.value.push(...newItems);
  if (scriptsReady.value) {
    newItems.forEach(item => preloadPhotoAssets(item.url));
  }
  if (imageList.value.length && currentIndex.value >= imageList.value.length) {
    currentIndex.value = imageList.value.length - 1;
  }
};

const openFilePicker = () => fileInputRef.value?.click();

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) addFiles(input.files);
  input.value = '';
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files) addFiles(event.dataTransfer.files);
};

const selectFolder = async () => {
  if (!('showDirectoryPicker' in window)) {
    messageDanger('当前浏览器不支持文件夹选择，请使用 Chrome/Edge');
    return;
  }
  try {
    const dirHandle = await (window as any).showDirectoryPicker();
    const files: File[] = [];
    const walk = async (handle: any) => {
      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          if (file.type.startsWith('image/')) files.push(file);
        }
        else if (entry.kind === 'directory') {
          await walk(entry);
        }
      }
    };
    await walk(dirHandle);
    if (!files.length) {
      messageDanger('文件夹内未找到图片');
      return;
    }
    addFiles(files);
    messageSuccess('文件夹导入完成');
  }
  catch {
    // 用户取消
  }
};

const selectPhoto = (index: number) => {
  if (index === currentIndex.value) return;
  currentIndex.value = index;
};

const removePhoto = (index: number) => {
  const item = imageList.value[index];
  if (!item) return;
  if (item.url.startsWith('blob:')) URL.revokeObjectURL(item.url);
  unregisterPhotoFile(item.url);
  const { [item.url]: _removed, ...restExif } = exifMap.value;
  exifMap.value = restExif;
  imageList.value.splice(index, 1);
  if (!imageList.value.length) {
    currentIndex.value = 0;
    return;
  }
  if (currentIndex.value >= imageList.value.length) {
    currentIndex.value = imageList.value.length - 1;
  }
};

const clearAll = () => {
  imageList.value.forEach((item) => {
    if (item.url.startsWith('blob:')) URL.revokeObjectURL(item.url);
    unregisterPhotoFile(item.url);
  });
  imageList.value = [];
  exifMap.value = {};
  currentIndex.value = 0;
  clearPhotoCaches();
};

const prevPhoto = () => {
  if (!imageList.value.length) return;
  currentIndex.value = (currentIndex.value - 1 + imageList.value.length) % imageList.value.length;
};

const nextPhoto = () => {
  if (!imageList.value.length) return;
  currentIndex.value = (currentIndex.value + 1) % imageList.value.length;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const exportCurrent = async () => {
  const photo = currentPhoto.value;
  if (!photo) {
    messageDanger('请先添加图片');
    return;
  }
  exportLoading.value = true;
  exportProgress.value = '正在导出当前图片...';
  try {
    await ensureExportReady();
    const blob = await exportPhotoBlob({
      src: photo.url,
      settings: appliedSettings.value,
      size: EXPORT_SIZE,
    });
    const name = photo.name.replace(/\.[^.]+$/, '') || 'photo';
    downloadBlob(blob, `${name}-framed.jpg`);
    messageSuccess('已导出当前图片');
  }
  catch {
    messageDanger('导出失败，请重试');
  }
  finally {
    exportLoading.value = false;
    exportProgress.value = '';
  }
};

const exportAll = async () => {
  if (!imageList.value.length) {
    messageDanger('请先添加图片');
    return;
  }
  exportLoading.value = true;
  try {
    await ensureExportReady();
    const zip = new JSZip();
    const folder = zip.folder('photos')!;
    const total = imageList.value.length;

    for (let i = 0; i < total; i++) {
      const item = imageList.value[i]!;
      exportProgress.value = `正在处理 ${i + 1} / ${total}...`;
      const blob = await exportPhotoBlob({
        src: item.url,
        settings: appliedSettings.value,
        size: EXPORT_SIZE,
      });
      const base = item.name.replace(/\.[^.]+$/, '') || `photo-${i + 1}`;
      folder.file(`${base}-framed.jpg`, blob);
      // 让出主线程，避免长时间阻塞 UI
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    exportProgress.value = '正在打包...';
    const content = await zip.generateAsync({ type: 'blob' });
    downloadBlob(content, 'photos-framed.zip');
    messageSuccess(`已导出 ${total} 张图片`);
  }
  catch {
    messageDanger('批量导出失败，请重试');
  }
  finally {
    exportLoading.value = false;
    exportProgress.value = '';
  }
};

const resetSettings = () => {
  Object.assign(settings, DEFAULT_PHOTO_SETTINGS);
};

onBeforeUnmount(() => {
  clearAll();
  terminatePhotoWorker();
});
</script>

<template>
  <div class="photos-tool space-y-5">
    <div class="text-center">
      <h2 class="text-xl text-tech">
        摄影
      </h2>
      <p class="mt-1 text-sm text-tech-subtle">
        图片浏览与边框滤镜处理 · 自动读取 EXIF 并生成品牌相框
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="cyber-btn-primary !py-2 !text-sm"
        :disabled="!scriptsReady || exportLoading"
        @click="openFilePicker"
      >
        <xia-icon icon="blog-upload" class="mr-1.5" />
        添加图片
      </button>
      <button
        class="cyber-btn-secondary !py-2 !text-sm"
        :disabled="!scriptsReady || exportLoading"
        @click="selectFolder"
      >
        <xia-icon icon="blog-wenjian" class="mr-1.5" />
        选择文件夹
      </button>
      <button
        class="cyber-btn-secondary !py-2 !text-sm"
        :disabled="!imageList.length || exportLoading"
        @click="clearAll"
      >
        清空
      </button>
      <div class="flex-1" />
      <span v-if="exportProgress" class="text-xs text-tech-subtle">{{ exportProgress }}</span>
      <button
        class="cyber-btn-secondary !py-2 !text-sm"
        :disabled="!currentPhoto || exportLoading"
        @click="exportCurrent"
      >
        导出当前
      </button>
      <button
        class="cyber-btn-primary !py-2 !text-sm"
        :disabled="!imageList.length || exportLoading"
        @click="exportAll"
      >
        <span v-if="exportLoading" class="loading loading-spinner loading-xs mr-1.5" />
        全部导出
      </button>
    </div>

    <input
      ref="fileInputRef"
      multiple
      type="file"
      class="hidden"
      accept="image/*"
      @change="handleFileUpload"
    >

    <div class="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside class="cyber-glass-card space-y-4 p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-tech">
            边框设置
          </h3>
          <button
            class="text-xs text-tech-subtle hover:text-primary"
            :disabled="exportLoading"
            @click="resetSettings"
          >
            重置
          </button>
        </div>

        <label class="block space-y-1.5">
          <span class="flex justify-between text-xs text-tech-subtle">
            <span>内边距</span>
            <span>{{ settings.padding }}px</span>
          </span>
          <input
            v-model.number="settings.padding"
            type="range"
            min="8"
            max="60"
            class="range range-primary range-xs w-full"
          >
        </label>

        <label class="block space-y-1.5">
          <span class="flex justify-between text-xs text-tech-subtle">
            <span>背景模糊</span>
            <span>{{ settings.blur }}</span>
          </span>
          <input
            v-model.number="settings.blur"
            type="range"
            min="0"
            max="40"
            class="range range-primary range-xs w-full"
          >
        </label>

        <label class="block space-y-1.5">
          <span class="flex justify-between text-xs text-tech-subtle">
            <span>圆角</span>
            <span>{{ settings.borderRadius }}px</span>
          </span>
          <input
            v-model.number="settings.borderRadius"
            type="range"
            min="0"
            max="32"
            class="range range-primary range-xs w-full"
          >
        </label>

        <label class="block space-y-1.5">
          <span class="flex justify-between text-xs text-tech-subtle">
            <span>阴影</span>
            <span>{{ settings.shadow }}</span>
          </span>
          <input
            v-model.number="settings.shadow"
            type="range"
            min="0"
            max="30"
            class="range range-primary range-xs w-full"
          >
        </label>

        <label class="block space-y-1.5">
          <span class="text-xs text-tech-subtle">品牌 Logo</span>
          <select
            v-model="settings.logoBrand"
            class="photos-tool-select select select-bordered select-sm w-full border-tech text-tech"
          >
            <option v-for="opt in LOGO_BRAND_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </label>

        <label class="flex cursor-pointer items-center gap-2">
          <input
            v-model="settings.showExif"
            type="checkbox"
            class="checkbox checkbox-primary checkbox-sm"
          >
          <span class="text-sm text-tech-muted">显示 EXIF 信息</span>
        </label>

        <div v-if="currentPhoto" class="border-t border-tech pt-3">
          <h4 class="mb-2 text-xs font-medium text-tech-subtle">
            当前图片 EXIF
          </h4>
          <div v-if="exifLoading" class="flex items-center gap-2 text-xs text-tech-faint">
            <span class="loading loading-spinner loading-xs text-primary" />
            读取中...
          </div>
          <dl v-else-if="hasExifData" class="space-y-1.5">
            <template v-for="(label, key) in EXIF_LABELS" :key="key">
              <div v-if="currentExif[key]" class="flex justify-between gap-2 text-xs">
                <dt class="text-tech-faint shrink-0">
                  {{ label }}
                </dt>
                <dd class="text-tech-muted truncate text-right">
                  {{ currentExif[key] }}
                </dd>
              </div>
            </template>
          </dl>
          <p v-else class="text-xs text-tech-faint">
            暂无 EXIF 数据（截图、部分 PNG 或经社交软件压缩的图片通常不含拍摄参数）
          </p>
        </div>
      </aside>

      <section
        class="cyber-glass-card relative min-h-[400px] p-3 md:p-4"
        :class="{ 'ring-2 ring-primary/40': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <div v-if="!scriptsReady" class="flex h-[360px] items-center justify-center">
          <span class="loading loading-spinner loading-lg text-primary" />
        </div>

        <div
          v-else-if="!currentPhoto"
          class="flex h-[360px] flex-col items-center justify-center gap-3 text-center"
        >
          <xia-icon icon="blog-xiangji" class="text-4xl text-tech-faint" />
          <p class="text-sm text-tech-subtle">
            拖拽图片到此处，或点击「添加图片」
          </p>
          <p class="text-xs text-tech-faint">
            最多 {{ MAX_PHOTOS }} 张 · 支持 JPG / PNG / WebP 等格式
          </p>
        </div>

        <template v-else>
          <div class="mb-3 flex items-center justify-between">
            <div class="min-w-0">
              <p class="truncate text-sm text-tech">
                {{ currentPhoto.name }}
              </p>
              <p class="text-xs text-tech-faint">
                {{ currentIndex + 1 }} / {{ imageList.length }}
              </p>
            </div>
            <div class="flex gap-1">
              <button
                class="cyber-btn-secondary !px-3 !py-1.5 !text-xs"
                :disabled="exportLoading"
                @click="prevPhoto"
              >
                ❮
              </button>
              <button
                class="cyber-btn-secondary !px-3 !py-1.5 !text-xs"
                :disabled="exportLoading"
                @click="nextPhoto"
              >
                ❯
              </button>
            </div>
          </div>

          <div class="h-[min(56vh,520px)]">
            <FilterBorderCanvas :pic="currentPhoto.url" :settings="settings" :exif="currentExif" />
          </div>
        </template>

        <div
          v-if="isDragging"
          class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[1.5rem] bg-primary/10 backdrop-blur-sm"
        >
          <p class="text-sm text-primary">
            松开以添加图片
          </p>
        </div>
      </section>
    </div>

    <div v-if="imageList.length" class="cyber-glass-card p-4">
      <div class="mb-3 flex items-center justify-between">
        <span class="text-sm text-tech-muted">已选 {{ imageList.length }} / {{ MAX_PHOTOS }} 张</span>
        <button
          class="cyber-btn-secondary !px-3 !py-1.5 !text-xs"
          :disabled="exportLoading"
          @click="openFilePicker"
        >
          + 继续添加
        </button>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          class="group flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-tech text-tech-subtle transition-colors hover:border-primary/40 hover:text-primary"
          :disabled="exportLoading"
          @click="openFilePicker"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
        <div
          v-for="(item, index) in imageList"
          :key="item.id"
          class="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border transition-all"
          :class="
            index === currentIndex
              ? 'border-primary/50 ring-2 ring-primary/30'
              : 'border-tech hover:border-primary/30'
          "
          @click="selectPhoto(index)"
        >
          <img
            :src="item.url"
            :alt="item.name"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover"
          >
          <button
            class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-md bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
            @click.stop="removePhoto(index)"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .photos-tool {
    :deep(.range-primary) {
      --range-shdw: var(--color-primary);
    }

    :deep(.select-bordered) {
      border-color: var(--tech-border);
    }

    .photos-tool-select {
      appearance: auto;
      color-scheme: dark;
      background-color: #111827 !important;
      color: #f8fafc !important;

      &:focus {
        background-color: #111827 !important;
      }

      option {
        background-color: #111827 !important;
        color: #f8fafc !important;
      }
    }
  }

  :global(html.tech-shell[data-theme='cyber-light']) .photos-tool {
    .photos-tool-select {
      color-scheme: light;
      background-color: #ffffff !important;
      color: #0f172a !important;

      &:focus {
        background-color: #ffffff !important;
      }

      option {
        background-color: #ffffff !important;
        color: #0f172a !important;
      }
    }
  }
</style>
