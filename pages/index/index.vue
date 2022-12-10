<script setup lang="ts">
const banners = useBanners()
// console.log(imagesData);
useHead({
  title: '文章列表',
  titleTemplate: title => `${title} - 江夏的个人博客 - 记录生活记录你~`,
})
</script>
<template>
  <div class="home-contaier main-bgc">
    <h1 class="hidden">首页 - 江夏的个人博客 - 记录生活记录你~</h1>
    <!-- 全局共享布局 -->
    <section class="banner-container">
      <div class="banner-content">
        <xia-carousel
          :images="banners"
          :duration="60000"
          interval
          arrow
        />
      </div>
    </section>
    <section class="home-content">
      <ArticleList />
    </section>
  </div>
</template>
<style lang="less" scoped>
.grayscale{
  filter: grayscale(.95)
}
.home-content {
  position: relative;
  min-height: 150vh;
  min-width: 40%;
  overflow: hidden;
  z-index: 0;
}
.banner-container {
  height: calc(100vh + 100px);
  @media screen and (max-width: 768px) {
    height: 60vh;
  }

  .banner-content {
    position: relative;
    height: 100%;
    img {
      color: #fff;
      height: 100%;
      width: 100%;
    }
    .text-wrap {
      position: absolute;
      width: 100%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      h2 {
        color: #fff;
        font-size: 56px;
        text-shadow: 3px 3px #000;
        text-align: center;
        font-weight: 500;
      }
    }
  }
}
</style>
