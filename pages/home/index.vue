<script setup lang="ts">

</script>
<template>
  <NuxtLayout name="custom">
    <section class="home-content">
      <ArticleList />
    </section>
  </NuxtLayout>
</template>
<style lang="less" scoped>
.home-content {
  position: relative;
  margin: 20px auto 0;
  width: 70vw;
  min-height: 150vh;
  min-width: 40%;
  overflow: hidden;
  @media screen and (max-width: 768px) {
    width: 90%;
  }
  z-index: 0;
  // background-color: #f4f4f4;
  // background-color: #252d38;
  padding: 0 0 20px 0;
}
</style>
