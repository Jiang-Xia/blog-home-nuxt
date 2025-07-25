<script setup lang="ts">
import { gushici } from '@/api/index';
import { SiteTitle } from '@/utils/constant';

const banners = useBanners();
// console.log(imagesData);
useHead({
  title: '文章列表',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});
interface GushiciData {
  content?: string;
  author?: string;
  origin?: string;
}

const gushiciData = ref<GushiciData>({});

try {
  const { data } = await useAsyncData('gushici_Get', () => gushici());
  gushiciData.value = data.value || {};
}
catch (error) {
  console.log(error);
}

// 下一页
const goToNextPage = () => {
  window.scroll({ top: window.innerHeight, left: 0, behavior: 'smooth' });
};
</script>

<template>
  <div class="home-container">
    <h1 class="hidden">
      首页 - {{ SiteTitle }}
    </h1>
    <!-- 全局共享布局 -->
    <section class="banner-container">
      <!-- 文字信息 -->
      <div class="site-info">
        <!-- <div id="site-title" class="site-title">江夏</div> -->
        <div id="site-subtitle" class="site-subtitle">
          <p class="content">
            {{ gushiciData.content }}
          </p>
          <br>
          <p v-if="gushiciData.author" class="author-info">
            {{ gushiciData.author }}-[{{ gushiciData.origin }}]
          </p>
        </div>
      </div>
      <!-- 向下提示箭头 -->
      <div class="go-down" @click="goToNextPage">
        <xia-icon icon="blog-double-down" height="32px" width="32px" />
      </div>
      <div class="banner-content">
        <xia-carousel :images="banners" :duration="60000" interval arrow />
      </div>
    </section>
    <section class="home-content">
      <ArticleList />
    </section>
  </div>
</template>

<style lang="less" scoped>
  .grayscale {
    filter: grayscale(0.95);
  }

  .home-content {
    position: relative;
    min-height: 150vh;
    min-width: 40%;
    overflow: hidden;
    z-index: 0;
  }

  .banner-container {
    height: 100vh;
    .site-info {
      pointer-events: none;
      position: absolute;
      width: 100%;
      top: 50%;
      left: 0;
      transform: translate3d(0, -50%, 0);
      z-index: 2;
      font-size: 24px;
      color: #fff;
      text-align: center;
      .site-title {
        // letter-spacing: .5em;
        font-size: 38px;
      }

      .content {
        letter-spacing: 0.5em;
      }
      .author-info {
        font-size: 16px;
      }
    }
    .go-down {
      cursor: pointer;
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translate3d(-50%, 0, 0);
      z-index: 3;
      color: rgba(255, 255, 255, 0.3);
      animation: arrow-down 2s infinite;
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
