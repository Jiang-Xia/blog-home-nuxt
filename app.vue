<template>
  <NuxtLayout />
</template>
<script setup lang="ts">
import { ID_INJECTION_KEY } from "element-plus";
// 解决 ElementPlusError
provide(ID_INJECTION_KEY, {
  prefix: Math.floor(Math.random() * 10000),
  current: 0,
});
</script>
