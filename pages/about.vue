<script setup lang="ts">
import { reactive, ref } from "vue";
import axios from "axios";
definePageMeta({
  layout: false,
});
</script>
<template>
  <NuxtLayout name="custom">
    <el-empty description="关于页面 暂时没有东西哦！" />
  </NuxtLayout>
</template>
<style lang="less" scoped></style>
