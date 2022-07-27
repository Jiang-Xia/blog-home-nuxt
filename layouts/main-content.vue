<!--
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-20 11:28:42
 * @LastEditTime: 2022-07-27 15:32:16
 * @Description: 
 * @FilePath: \blog-home-nuxt\layouts\main-content.vue
-->
<script setup lang="ts">
import { ref } from "vue";
import { dailyImage } from "~~/api/article";

const images = ref([]);
const { data: imagesData } = await useAsyncData("index_GetIMG", () =>
  dailyImage(3)
);
images.value = imagesData.value.images.map(
  (v: any) => "https://cn.bing.com" + v.url
);
const key = new Date().getTime();
</script>
<template>
  <div class="custom-layout-contaier paper-feeling" :key="key">
    <!-- 全局共享布局 -->
    <section class="banner-container">
      <div class="banner-content">
        <!-- <div class="text-wrap">
          <h3 class="animate-pulse">
          </h3>
        </div> -->
        <div class="carousel w-full h-full">
          <div
            class="carousel-item w-full"
            v-for="(image, index) in images"
            :key="index"
          >
            <img
              :src="image"
              :style="{
                width: '100%',
              }"
            />
          </div>
        </div>
      </div>
    </section>
    <!-- 主显示区 -->
    <div class="custom-main w-11/12 md:w-9/12">
      <slot />
    </div>
  </div>
</template>

<style lang="less" scoped>
.banner-container {
  height: 50vh;
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
        font-size: 38px;
        text-shadow: 3px 3px #000;
        text-align: center;
        font-weight: 500;
      }
    }
  }
  // .el-carousel {
  //   height: 100%;
  // }
}
.custom-layout-contaier {
  position: relative;
  // min-height: 100vh;
  // noise 遮罩层
  &::after {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    content: "";
    pointer-events: none;
    display: none;
    z-index: 0;
    // background-image: url(@/assets/img/background/noise.png);
  }
  background-color: var(--main-bgc) !important;
  color: var(--text-color) !important;
}
.custom-main {
  margin: 20px auto 0;
  // padding: 10px 20px 20px 20px;
  min-height: 50vh;
  // border-radius: var(--layout-border-radius);
  // background-color: var(--minor-bgc);
}
.paper-feeling {
  &::after {
    display: block;
  }
}
</style>
