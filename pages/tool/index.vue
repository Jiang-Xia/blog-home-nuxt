<template>
  <div class="p-4">
    正在跳转到工具页...
  </div>
</template>

<script setup lang="ts">
await navigateTo('/tool/sm', { replace: true });
</script>
