<script setup lang="ts">
import { dailyImage } from "~~/api/article";
const images = ref([]);
const { data: imagesData } = await useAsyncData("index_GetIMG", () =>
  dailyImage(3)
);
images.value = imagesData.value.images.map(
  (v: any) => "https://cn.bing.com" + v.url
);
useHead({
  title: "文章列表",
  titleTemplate: (title) => `${title} - 江夏的个人博客`,
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  charset: "utf-8",
  meta: [
    { name: "Keywords", content: "江夏的个人博客" },
    {
      name: "description",
      content: "江夏的个人博客，用于记录工作生活学习中的点滴~",
    },
  ],
});
</script>
<template>
  <div class="home-contaier">
    <!-- 全局共享布局 -->
    <!-- <section
      class="banner-container"
      :style="{
        height: 'calc(100vh + 100px)'
      }"
    >
      <div class="banner-content">
        <el-carousel :initial-index="0" indicator-position="none" height="100%" :interval="60000">
          <el-carousel-item v-for="(image, index) in images" :key="index">
            <img
              :src="image"
              :style="{
                width: '100%',
              }"
            />
          </el-carousel-item>
        </el-carousel>
      </div>
    </section> -->
    <section class="home-content w-11/12 md:w-9/12">
      <ArticleList />
    </section>
  </div>
</template>
<style lang="less" scoped>
.home-content {
  position: relative;
  margin: 20px auto 0;
  min-height: 150vh;
  min-width: 40%;
  overflow: hidden;
  z-index: 0;
  padding: 0 0 20px 0;
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
        h1 {
          color: #fff;
          font-size: 56px;
          text-shadow: 3px 3px #000;
          text-align: center;
          font-weight: 500;
        }
      }
    }
    .el-carousel {
      height: 100%;
    }
  }
// .common-layout-contaier {
//   position: relative;
//   // min-height: 100vh;
//   // noise 遮罩层
//   &::after {
//     position: absolute;
//     left: 0;
//     top: 0;
//     width: 100%;
//     height: 100%;
//     content: "";
//     pointer-events: none;
//     display: none;
//     z-index: 0;
//     // background-image: url(@/assets/img/background/noise.png);
//   }
//   background-color: var(--main-bgc) !important;
//   color: var(--text-color) !important;
// }
</style>
