<template>
<!-- 需要个默认布局 因为default.vue中使用NuxtChild 所以app是所有页面的父级组件 必须存在！-->
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
