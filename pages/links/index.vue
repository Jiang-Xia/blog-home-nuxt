<script setup lang="ts">
import { computed, ref } from "vue";
import MdEditor from "md-editor-v3";
</script>
<template>
  <NuxtLayout name="custom">
    <div class="links-container">
      <el-empty description="友链页面 暂时没有东西哦！" />
    </div>
  </NuxtLayout>
</template>
<style lang="less" scoped>
.links-container {
  min-height: 100%;
}
</style>
