<template>
  <PhotoFrame2
    :src="pic"
    :blob-url-list="blobUrlList"
    @processed="processedHandle"
  />
</template>

<script setup>
import PhotoFrame2 from './PhotoFrame2.vue';

const props = defineProps({
  pic: {
    type: String,
    default: '',
  },
  padding: {
    type: Number,
    default: 36,
  },
  blobUrlList: {
    type: Array,
    default: () => [],
  },
  radius: {
    type: Number,
    default: 16,
  },
});
const emit = defineEmits(['processed']);
const processedHandle = (data) => {
  emit('processed', data);
  // console.log(url);
};
</script>

<style lang="less" scoped></style>
