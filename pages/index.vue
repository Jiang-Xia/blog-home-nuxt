<script setup lang="ts">
import { reactive, ref } from "vue";
</script>
<template>
  <div>
    <div>index page</div>
    <!--跳转链接-->
    <NuxtLink to="/detail">Detail Page</NuxtLink>
    <br/>
    <NuxtLink to="/home">Home Page</NuxtLink>
  </div>
</template>
<style lang="scss" scoped></style>
