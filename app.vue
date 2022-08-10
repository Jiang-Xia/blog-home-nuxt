<script lang="ts" setup>
</script>
<template>
<!-- 需要个默认布局 因为default.vue中使用NuxtChild 所以app是所有页面的父级组件 必须存在！-->
  <NuxtLayout />
</template>
<script setup lang="ts">
import "@/styles/index.less";
import "md-editor-v3/lib/style.css";
</script>
