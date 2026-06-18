<script setup lang="ts">
import type { PhotoSettings } from '../constants';
import PhotoFrame2 from './PhotoFrame2.vue';

defineProps<{
  pic: string;
  settings: PhotoSettings;
  exif: Record<string, string>;
}>();
</script>

<template>
  <PhotoFrame2 :src="pic" :settings="settings" :exif="exif" />
</template>
