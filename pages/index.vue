<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
// 该组件对应着 / 路径
onBeforeMount(() => {
  router.replace("/home");
});
</script>
<template></template>
<style lang="less" scoped></style>
