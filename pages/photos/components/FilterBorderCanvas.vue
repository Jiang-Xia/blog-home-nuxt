<template>
  <PhotoFrame2 :src="pic" />
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
  radius: {
    type: Number,
    default: 16,
  },
});
</script>

<style lang="less" scoped></style>
