<script setup lang="ts">
import { reactive, ref } from "vue";
import axios from "axios";
// definePageMeta({
//   layout: 'custom',
// });
// axios.get('https://jiang-xia.top/x-api/blog-server/article/info?id=16').then(res=>{
//     console.log(res,'res')
// })
</script>
<template>
  <NuxtLayout name="custom">
    <el-button type="primary">home</el-button><br />
    <NuxtLink to="/detail">Detail Page</NuxtLink>
  </NuxtLayout>
</template>
<style lang="less" scoped></style>
