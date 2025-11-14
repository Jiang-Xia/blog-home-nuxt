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

      <section class="flex flex-col md:flex-row">
        <div class="">
          <div class="mockup-phone m-0 mb-4 md:w-96 mx-auto">
            <div class="mockup-phone-camera" />
            <div class="mockup-phone-display">
              <div class="iframe-wrap">
                <iframe class="iframe" :src="zoneUrl" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-1 flex-wrap justify-center items-start">
          <div
            class="card w-full max-w-96 mt-4 h-auto bg-base-100 shadow-xl md:w-56 md:h-96 md:mr-4"
          >
            <figure>
              <img
                src="https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/2e5d10df027b4cf28545b44901f7e8a4-app-code.png"
                alt="code"
              >
            </figure>
            <div class="card-body">
              <h2 class="card-title">
                APP
              </h2>
              <p>扫码下载安装即可体验App</p>
            </div>
          </div>
          <div
            class="card w-full max-w-96 mt-4 h-auto bg-base-100 shadow-xl md:w-56 md:h-96 md:mr-4"
          >
            <figure>
              <img
                src="https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/ea68358e78fd433fb5d2123e2cc0763b-h5.png"
                alt="code"
              >
            </figure>
            <div class="card-body">
              <h2 class="card-title">
                h5页面
              </h2>
              <p>扫码即可体验h5页面！</p>
            </div>
          </div>
          <div
            class="card w-full max-w-96 mt-4 h-auto bg-base-100 shadow-xl md:w-56 md:h-96 md:mr-4"
          >
            <figure>
              <img
                src="https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/1d6c3ffe42c3498a820965d9a46e0e2b-mini-program-code.jpg"
                alt="code"
              >
            </figure>
            <div class="card-body">
              <h2 class="card-title">
                微信小程序
              </h2>
              <p>微信扫码即可体验微信小程序！</p>
            </div>
          </div>
          <div
            class="card w-full max-w-96 mt-4 h-auto bg-base-100 shadow-xl md:w-56 md:h-96 md:mr-4"
          >
            <figure>
              <img
                src="https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/68a238667168490ea59c417e7f438b4b-circle_blue_slogan_50cm.png"
                alt="code"
              >
            </figure>
            <div class="card-body">
              <h2 class="card-title">
                支付宝小程序
              </h2>
              <p>支付宝扫码即可体验微信小程序！</p>
            </div>
          </div>
        </div>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { adminUrl, originUrl } from '@/config';

const token = useToken();
const goUrl = `${adminUrl}?ticket=${token.value}`;
const zoneUrl = originUrl + '/zone/#/';
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
    // background: var(--main-bgc);
    // padding: 124px 24px 24px 24px;
    padding: 124px 12px 12px 12px;

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
