<template>
  <CyberPageContainer label="PROJECTS" title="项目展示" subtitle="个人项目与作品演示">
    <div class="m-auto space-y-10">
      <CyberProjectSection
        title="Zone" icon-on="😭" icon-off="🥳"
        :url="zoneUrl"
        preview="phone"
      >
        <template #aside>
          <CyberCard
            v-for="item in zoneCards"
            :key="item.title"
            hover
            class="mt-4 h-auto w-full max-w-96 overflow-hidden shadow-xl md:mr-4 md:h-96 md:w-56 !p-0"
          >
            <figure>
              <img :src="item.image" :alt="item.title" loading="lazy">
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
        </template>
      </CyberProjectSection>

      <CyberProjectSection title="Blog Admin" icon-on="😈" icon-off="😇" :url="blogAdminUrl" />

      <CyberProjectSection title="Data Screen" icon-on="📉" icon-off="📊" :url="dataScreenUrl" />

      <CyberProjectSection title="Zone Admin" icon-on="🔐" icon-off="🔓" :url="zoneAdminUrl" />
    </div>
  </CyberPageContainer>
</template>

<script setup lang="ts">
import { adminUrl, originUrl } from '@/config';
import { joinUrl, withCacheBust } from '@/utils/url';

const adminBaseUrl = adminUrl.replace(/\/$/, '');

const blogAdminUrl = ref('');
const zoneUrl = ref('');
const dataScreenUrl = ref('');
const zoneAdminUrl = ref('');

onMounted(() => {
  const ts = Date.now();
  blogAdminUrl.value = withCacheBust(adminBaseUrl, ts);
  dataScreenUrl.value = withCacheBust(joinUrl(adminBaseUrl, 'datascreen'), ts);
  zoneUrl.value = withCacheBust(`${originUrl}/zone/#/`, ts);
  zoneAdminUrl.value = withCacheBust(joinUrl(adminBaseUrl, 'admin/zone-admin/login'), ts);
});

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
</script>

<style lang="less" scoped></style>
