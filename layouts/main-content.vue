<!--
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-20 11:28:42
 * @LastEditTime: 2022-08-03 16:56:45
 * @Description:
 * @FilePath: \blog-home-nuxt\layouts\main-content.vue
-->
<script setup lang="ts">
  const banners = useBanners()
  defineProps({
    // 页面自定义banner
    images: {
      type: Array<BannerState>,
      default: () => [],
    },
  })
</script>
<template>
  <div class="custom-layout-contaier paper-feeling">
    <!-- 全局共享布局 -->
    <section class="banner-container">
      <div class="banner-content">
        <xia-carousel :images="images.length ? images : banners" />
      </div>
    </section>
    <!-- 主显示区 -->
    <div class="custom-main w-11/12 md:w-9/12 rounded-box">
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
        h2 {
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
      content: '';
      pointer-events: none;
      display: none;
      z-index: 0;
      // background-image: url(@/assets/img/background/noise.png);
    }
    background: var(--main-bgc) !important;
    color: var(--text-color) !important;
  }
  .custom-main {
    margin: 20px auto 0;
    min-height: 50vh;
    background: var(--main-bgc);
  }
  .paper-feeling {
    &::after {
      display: block;
    }
  }
</style>
