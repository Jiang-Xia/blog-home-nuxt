<template>
  <div class="page-container m-auto">
    <section>
      <div class="navbar bg-base-100 mb-4 shadow-xl rounded-box">
        <div class="navbar-start">
          <label class="swap swap-flip text-3xl">
            <input type="checkbox">
            <div class="swap-on">😈</div>
            <div class="swap-off">😇</div>
          </label>
        </div>
        <div class="navbar-center">
          <a class="btn btn-ghost normal-case text-xl">Blog Admin</a>
        </div>
        <div class="navbar-end">
          <button class="btn btn-neutral" @click="goTargetPage(1)">
            GO
          </button>
        </div>
      </div>
      <div class="mockup-window border border-base-300 bg-base-100">
        <div class="flex justify-center p-4 bg-base-200 h-full">
          <iframe class="iframe" :src="goUrl" />
        </div>
      </div>
    </section>

    <section class="mt-10">
      <div class="navbar bg-base-100 mb-4 shadow-xl rounded-box">
        <div class="navbar-start">
          <label class="swap swap-flip text-3xl">
            <input type="checkbox">
            <div class="swap-on">😭</div>
            <div class="swap-off">🥳</div>
          </label>
        </div>
        <div class="navbar-center">
          <a class="btn btn-ghost normal-case text-xl">Zone</a>
        </div>
        <div class="navbar-end">
          <button class="btn btn-neutral" @click="goTargetPage(2)">
            GO
          </button>
        </div>
      </div>

      <div class="flex flex-col items-center lg:flex-row sm:justify-around">
        <div class="mockup-phone m-0 mb-4">
          <div class="mockup-phone-camera" />
          <div class="mockup-phone-display">
            <div class="iframe-wrap">
              <iframe class="iframe" :src="zoneUrl" />
            </div>
          </div>
        </div>
        <div class="card w-96 bg-base-100 shadow-xl sm:w-60 md:w-96">
          <figure>
            <img src="@/assets/images/other/app-code.png" alt="code">
          </figure>
          <div class="card-body">
            <h2 class="card-title">
              APP
            </h2>
            <p>扫码下载安装即可体验App</p>
          </div>
        </div>
        <div class="card w-96 mt-4 bg-base-100 shadow-xl sm:w-60 md:w-96 md:mt-0">
          <figure>
            <img src="@/assets/images/other/mini-program-code.jpg" alt="code">
          </figure>
          <div class="card-body">
            <h2 class="card-title">
              微信小程序
            </h2>
            <p>微信扫码即可体验微信小程序！</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { adminUrl } from '@/config';

const token = useToken();
const goUrl = `${adminUrl}?ticket=${token.value}`;
const zoneUrl = 'https://jiang-xia.top/zone/#/';
const goTargetPage = (type: number) => {
  let url = '';
  if (type === 1) {
    url = goUrl;
  }
  else if (type === 2) {
    url = zoneUrl;
  }
  window.open(url, '_blank');
};
</script>

<style lang="less" scoped>
  .page-container {
    background: var(--main-bgc);
    padding: 124px 24px 24px 24px;

    .iframe-wrap {
      height: 100%;
      width: 100%;
      background: #f8f8f8;
    }

    .iframe {
      height: 100%;
      width: 100%;
      border-radius: 10px;
      border-width: none;
      border-style: solid;
      border-color: #555555;
      border-image: none;
      background: #ffffff;
    }

    .mockup-window {
      .iframe {
        min-height: 65vh;
      }
    }

    .mockup-phone {
    }
  }
</style>
