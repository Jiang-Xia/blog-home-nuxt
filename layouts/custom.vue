<!--
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-20 11:28:42
 * @LastEditTime: 2022-07-23 17:12:27
 * @Description: 
 * @FilePath: \blog-home-nuxt\layouts\custom.vue
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
const showBanner = computed(() => {
  const route = useRoute();
  return route.path.includes("home");
});
</script>
<template>
  <div class="app-layout-contaier paper-feeling">
    <!-- 全局共享布局 -->
    <section class="banner-container" :style="{
      height:showBanner?'height: calc(100vh + 100px)':'40vh'
    }">
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
    </section>
    <!-- 主显示区 -->
    <el-main>
      <slot />
    </el-main>
  </div>
</template>

<style lang="less" scoped>
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
  .el-carousel{
    height: 100%;
  }
}
.app-layout-contaier {
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

.paper-feeling {
  &::after {
    display: block;
  }
}
.el-main {
  min-height: calc(50vh);
}
</style>
