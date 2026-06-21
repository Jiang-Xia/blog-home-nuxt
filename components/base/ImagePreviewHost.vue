<script setup lang="ts">
/** 全站图片预览宿主，挂载于 default layout */
const { state, close } = useImagePreview();

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && state.open) {
    close();
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <BaseImageViewer
    v-if="state.open"
    :images="state.images"
    :initial-index="state.initialIndex"
    :simple="state.mode === 'simple'"
    :file-names="state.fileNames"
    :on-download="state.onDownload"
    @close="close"
  />
</template>
