<!--
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-20 11:28:42
 * @LastEditTime: 2022-06-18 19:59:09
 * @Description: 
 * @FilePath: \blog-home-nuxt\layouts\custom.vue
-->
<script setup lang="ts">
import { ref, watch } from "vue";
const scrollTop = ref(0);
const scrollHandle = (e: any) => {};
const showFooter = computed(() => {
  return true;
});
</script>
<template>
  <div class="app-layout-contaier paper-feeling">
    <el-header :class="{ 'arco-header__active': true }">
      <Nav></Nav>
    </el-header>
    <el-main>
      <slot />
    </el-main>
    <el-footer v-if="showFooter">
      <p>桂ICP备2022001119号-1</p>
      <p>
        Powered By Typescript & Vue3 & Vite & Arco-design & Node.js & NestJS
      </p>
    </el-footer>
    <el-backtop>
      <el-button type="primary" shape="circle"> </el-button>
    </el-backtop>
  </div>
</template>

<style lang="less" scoped>
.app-layout-contaier {
  position: relative;
  min-height: 100vh;
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
.arco-layout,
.arco-layout-footer {
  background: none;
}
.arco-layout-header {
  height: 58px;
  line-height: 58px;
  width: 100%;
  z-index: 2;
  top: 0px;
  left: 0px;
  position: fixed;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
  transition: all 1s;
  background: transparent !important;
  padding: 0 1.5vw;
}
.arco-layout-header__active {
  background-color: var(--nav-color) !important;
  border-color: var(--nav-color) !important;
}
.el-main {
  min-height: calc(100vh - 120px);
}
.arco-layout-footer {
  padding: 24px 1.5vw;
  text-align: center;
  line-height: 1.7;
  color: var(--text-color2);
}
</style>
<style lang="less">
.banner-container {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 40vh;
  min-height: 260px;
  z-index: 0;
  .banner-content {
    position: relative;
    height: 100%;
  }
}
.main {
  background-color: #000;
}
</style>
