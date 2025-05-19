<script setup lang="ts">
import JSZip from 'jszip';
import FilterBorder from './components/FilterBorder.vue';
import FilterBorderCanvas from './components/FilterBorderCanvas.vue';
import { messageDanger } from '~~/utils/toast';

const logoImgNameList = [
  'nikon',
  'nikon_full',
  'canon',
  'sony',
  'fujifilm',
  'hasselblad',
  'hasselblad-t',
  'leica',
  'leica_full',
  'leica_red_full',
  'red',
  'red_full',
  'dji',
  'install360',
  'kodak',
  'lumix',
  'mamiya',
  'olympus',
  'panasonic',
  'pentax',
  'phaseOne',
  'ricoh',
  'rolleiflex',
  'sigma',
  'tamron',
  'zeiss_full',
];
const banners = useBanners();
onMounted(() => {
  currentImage.value = banners.value.length ? banners.value[0].url : '';
  imageSrcList.value = banners.value.map(v => v.url);
});
const currentImage = ref('');
const fileContents = ref<any>(null);
const imageSrcList = ref<string[]>([]);
const add = () => {
  if (imageSrcList.value.length > 20) {
    messageDanger('最大选择20张图片！');
    return;
  }
  fileContents.value && fileContents.value.click();
};

// 处理批量文件上传
const handleFileUpload = (event: Event): void => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (files) {
    for (const file of Array.from(files)) {
      if (imageSrcList.value.length > 20) {
        messageDanger('最大选择20张图片！');
        break;
      }
      imageSrcList.value.push(URL.createObjectURL(file) as string);
    }
    console.log('imageSrcList:', imageSrcList.value);
  }
};
const selectImage = (item: string) => {
  currentImage.value = item;
};
const deleteImage = (item: string) => {
  imageSrcList.value.splice(imageSrcList.value.indexOf(item), 1);
  nextTick(() => {
    currentImage.value = imageSrcList.value.length
      ? imageSrcList.value[0]
      : banners.value.length
        ? banners.value[0].url
        : '';
  });
};

const blobUrlList = ref<any>([]);
const processedHandle = (data: any) => {
  blobUrlList.value.push(data);
  console.log(blobUrlList.value);
};

const exportLoading = ref(false);
// 导出全部图片
const exportAll = () => {
  if (!blobUrlList.value.length) {
    messageDanger('请先选择图片');
    return;
  }
  setTimeout(async () => {
    exportLoading.value = true;
    const zip = new JSZip(); // 使用 JSZip 来打包文件
    let index = 0;
    for (const item of blobUrlList.value) {
      const blob = await fetch(item.blobUrl).then(res => res.blob());
      console.log(blob);
      const folder = zip.folder('images') as JSZip;
      folder.file(`图片-${index + 1}.png`, blob, { base64: true });
      index++;
    }
    // console.log('index', index);
    // 生成并下载zip文件
    zip.generateAsync({ type: 'blob' }).then(function (content) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'images.zip';
      link.click();
      exportLoading.value = false;
    });
  }, 10);
};
</script>

<template>
  <div class="photos-container">
    <div class="top-banner p-6 flex justify-center items-start">
      <section class="w-3/4 h-2/3">
        <ClientOnly>
          <!-- <FilterBorderCanvas
            v-for="(item, index) in imageSrcList"
            :key="item+index"
            :pic="item"
            :padding="36"
            :radius="16"
            :blob-url-list="blobUrlList"
            @processed="processedHandle"
          /> -->
          <div class="carousel w-full">
            <div
              v-for="(item, index) in imageSrcList"
              :id="'slide' + index"
              :key="item + index"
              class="carousel-item relative w-full"
            >
              <FilterBorderCanvas
                class="w-full"
                :pic="item"
                :padding="36"
                :radius="16"
                :blob-url-list="blobUrlList"
                @processed="processedHandle"
              />
              <div
                class="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between"
              >
                <a
                  :href="'#slide' + (index - 1 < 0 ? imageSrcList.length : index - 1)"
                  class="btn btn-neutral btn-circle"
                >❮</a>
                <a
                  :href="
                    '#slide' + (index + 1 > imageSrcList.length ? imageSrcList.length : index + 1)
                  "
                  class="btn btn-neutral btn-circle"
                >❯</a>
              </div>
            </div>
          </div>
        </ClientOnly>
      </section>
    </div>
    <div class="flex py-2 px-6">
      <span v-if="exportLoading" class="loading loading-dots loading-md bg-accent" />
      <button class="btn btn-neutral" :disabled="exportLoading" @click="exportAll">
        全部导出
      </button>
    </div>
    <div>
      <input
        ref="fileContents"
        multiple
        type="file"
        class="file-input file-input-bordered w-full hidden"
        name="fileContents"
        accept="image/*"
        @change="handleFileUpload"
      >
    </div>
    <div
      class="container columns-3 sm:columns-4 md:columns-6 lg:columns-9 xlg:columns-11 gap-4 px-6 pt-2"
    >
      <div class="mb-4 h-24 w-24">
        <XiaButtonBorder :animation-duration="1" rx="8" @click="add">
          <div class="h-24 w-24 flex items-center justify-center">
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
          </div>
        </XiaButtonBorder>
      </div>
      <div
        v-for="(item, index) in imageSrcList"
        :key="item + String(index)"
        class="item h-24 w-24 mb-4 cursor-pointer"
        @click="selectImage(item)"
      >
        <div class="avatar relative">
          <div
            class="absolute rounded-tr right-0 top-0 bg-gray-500 opacity-60 text-gray-200 p-1 flex items-center justify-center text-xs leading-none"
            @click.stop="deleteImage(item)"
          >
            X
          </div>
          <div class="w-24 rounded-lg" :class="{ selected: item === currentImage }">
            <img :src="item">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .photos-container {
    .top-banner {
      padding: 30px;
      height: 70vh;
    }
  }
</style>
