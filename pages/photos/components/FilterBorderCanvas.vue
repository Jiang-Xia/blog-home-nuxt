<template>
  <PhotoFrame :src="pic" />
</template>

<script setup>
import PhotoFrame from './PhotoFrame2.vue';

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
