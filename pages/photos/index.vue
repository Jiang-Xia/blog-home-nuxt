<script setup lang="ts">
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
</script>

<template>
  <div class="photos-container">
    <div class="top-banner p-6 flex justify-center items-start">
      <section class="w-3/4 h-2/3">
        <ClientOnly>
          <FilterBorderCanvas
            :pic="currentImage"
            :padding="36"
            :radius="16"
          />
        </ClientOnly>
      </section>
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
        <XiaButtonBorder
          :animation-duration="1"
          rx="8"
          @click="add"
        >
          <div class="h-24 w-24 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
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
          <div
            class="w-24 rounded-lg"
            :class="{ selected: item === currentImage }"
          >
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
    .selected {
      @apply border-solid border-red-500 border-2;
    }
  }
</style>
