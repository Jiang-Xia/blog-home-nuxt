<template>
  <CyberPageContainer label="PROJECTS" title="项目展示" subtitle="个人项目与作品演示">
    <div class="page-container m-auto">
      <section>
        <CyberCard
          class="navbar mb-4 overflow-hidden rounded-2xl border border-tech text-tech shadow-xl !p-0"
        >
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
            <CyberButton variant="secondary" class="!px-4 !py-2 text-sm" @click="goTargetPage(1)">
              GO
            </CyberButton>
          </div>
        </CyberCard>
        <CyberCard class="mockup-window overflow-hidden !p-0">
          <div class="flex h-full justify-center bg-tech-header p-4">
            <iframe class="iframe" :src="goUrl" />
          </div>
        </CyberCard>
      </section>

      <section class="mt-10">
        <CyberCard
          class="navbar mb-4 overflow-hidden rounded-2xl border border-tech text-tech shadow-xl !p-0"
        >
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
            <CyberButton variant="secondary" class="!px-4 !py-2 text-sm" @click="goTargetPage(2)">
              GO
            </CyberButton>
          </div>
        </CyberCard>

        <section class="flex flex-col md:flex-row">
          <div class="mockup-phone m-0 mx-auto mb-4 md:w-96">
            <div class="mockup-phone-camera" />
            <div class="mockup-phone-display">
              <div class="iframe-wrap">
                <iframe class="iframe" :src="zoneUrl" />
              </div>
            </div>
          </div>
          <div class="flex flex-1 flex-wrap items-start justify-center">
            <CyberCard
              v-for="item in zoneCards"
              :key="item.title"
              hover
              class="mt-4 h-auto w-full max-w-96 overflow-hidden shadow-xl md:mr-4 md:h-96 md:w-56 !p-0"
            >
              <figure>
                <img :src="item.image" :alt="item.title">
              </figure>
              <div class="p-4">
                <h2 class="text-lg font-semibold text-tech">
                  {{ item.title }}
                </h2>
                <p class="mt-1 text-sm text-tech-muted">
                  {{ item.desc }}
                </p>
              </div>
            </CyberCard>
          </div>
        </section>
      </section>

      <section class="mt-10">
        <CyberCard
          class="navbar mb-4 overflow-hidden rounded-2xl border border-tech text-tech shadow-xl !p-0"
        >
          <div class="navbar-start">
            <label class="swap swap-flip text-3xl">
              <input type="checkbox">
              <div class="swap-on">🔐</div>
              <div class="swap-off">🔓</div>
            </label>
          </div>
          <div class="navbar-center">
            <a class="btn btn-ghost normal-case text-xl">Zone Admin</a>
          </div>
          <div class="navbar-end">
            <CyberButton variant="secondary" class="!px-4 !py-2 text-sm" @click="goTargetPage(3)">
              GO
            </CyberButton>
          </div>
        </CyberCard>
        <CyberCard class="mockup-window overflow-hidden !p-0">
          <div class="flex h-full justify-center bg-tech-header p-4">
            <iframe class="iframe" :src="zoneAdminUrl" />
          </div>
        </CyberCard>
      </section>
    </div>
  </CyberPageContainer>
</template>

<script setup lang="ts">
import { adminUrl, originUrl } from '@/config';

const goUrl = adminUrl;
const zoneUrl = originUrl + '/zone/#/';
const zoneAdminUrl = 'https://admin.jiang-xia.top/admin/zone-admin/login';

const zoneCards = [
  {
    title: 'APP',
    desc: '扫码下载安装即可体验App',
    image:
        'https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/2e5d10df027b4cf28545b44901f7e8a4-app-code.png',
  },
  {
    title: 'h5页面',
    desc: '扫码即可体验h5页面！',
    image:
        'https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/ea68358e78fd433fb5d2123e2cc0763b-h5.png',
  },
  {
    title: '微信小程序',
    desc: '微信扫码即可体验微信小程序！',
    image:
        'https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/1d6c3ffe42c3498a820965d9a46e0e2b-mini-program-code.jpg',
  },
  {
    title: '支付宝小程序',
    desc: '支付宝扫码即可体验微信小程序！',
    image:
        'https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/68a238667168490ea59c417e7f438b4b-circle_blue_slogan_50cm.png',
  },
];

const goTargetPage = (type: number) => {
  let url = '';
  if (type === 1) {
    url = goUrl;
  }
  else if (type === 2) {
    url = zoneUrl;
  }
  else if (type === 3) {
    url = zoneAdminUrl;
  }
  window.open(url, '_blank');
};
</script>

<style lang="less" scoped>
  .page-container {
    padding: 24px 12px 12px 12px;

    .iframe-wrap {
      height: 100%;
      width: 100%;
      background: var(--tech-shell);
    }

    .iframe {
      height: 100%;
      width: 100%;
      border-radius: 10px;
      border-width: none;
      border-style: solid;
      border-color: var(--tech-border);
      border-image: none;
      background: var(--tech-input-bg);
    }

    .mockup-window {
      .iframe {
        min-height: 65vh;
      }
    }
  }
</style>
