<template>
  <CyberPageContainer
    label="PROJECTS"
    title="项目展示"
    subtitle="问题 → 方案 → Demo → 相关文章；先看叙事，再点进演示"
  >
    <div class="m-auto space-y-12">
      <!-- Zone -->
      <section :id="storyZone.slug" class="scroll-mt-24">
        <ProjectStoryNarrative :story="storyZone" />
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
      </section>

      <!-- Blog UniApp：完整四段示范 -->
      <section :id="storyUniapp.slug" class="scroll-mt-24">
        <ProjectStoryNarrative :story="storyUniapp" />
        <p class="mb-3 text-xs uppercase tracking-widest text-tech-faint">
          Demo
        </p>
        <CyberProjectSection
          title="Blog UniApp"
          icon-on="📱"
          icon-off="💻"
          :url="blogUniappUrl"
          preview="phone"
        />
      </section>

      <!-- Blog Admin -->
      <section :id="storyAdmin.slug" class="scroll-mt-24">
        <ProjectStoryNarrative :story="storyAdmin" />
        <CyberProjectSection title="Blog Admin" icon-on="😈" icon-off="😇" :url="blogAdminUrl" />
      </section>

      <!-- Data Screen -->
      <section :id="storyDataScreen.slug" class="scroll-mt-24">
        <ProjectStoryNarrative :story="storyDataScreen" />
        <CyberProjectSection title="Data Screen" icon-on="📉" icon-off="📊" :url="dataScreenUrl" />
      </section>

      <!-- Zone Admin -->
      <section :id="storyZoneAdmin.slug" class="scroll-mt-24">
        <ProjectStoryNarrative :story="storyZoneAdmin" />
        <CyberProjectSection title="Zone Admin" icon-on="🔐" icon-off="🔓" :url="zoneAdminUrl" />
      </section>
    </div>
  </CyberPageContainer>
</template>

<script setup lang="ts">
/**
   * 项目展示：叙事（constants/project-stories）+ iframe Demo。
   * - Zone H5 / Zone Admin 固定 zone.jiang-xia.top
   * - Blog UniApp 固定 go.jiang-xia.top
   * - Blog Admin / DataScreen 随 adminUrl
   * UniApp 区块为「问题→方案→Demo→文章」完整示范；锚点供详情页回链。
   */
import { adminUrl } from '@/config';
import { joinUrl, withCacheBust } from '@/utils/url';
import { getProjectStory } from '~/constants/project-stories';
import { SiteTitle } from '@/utils/constant';

useHead({
  title: '项目展示',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});

const storyZone = getProjectStory('zone')!;
const storyUniapp = getProjectStory('blog-uniapp')!;
const storyAdmin = getProjectStory('blog-admin')!;
const storyDataScreen = getProjectStory('data-screen')!;
const storyZoneAdmin = getProjectStory('zone-admin')!;

/** 线上 uni-app H5 入口（go.jiang-xia.top 根路径） */
const BLOG_UNIAPP_URL = 'https://go.jiang-xia.top/#/';
/** Zone H5（zone.jiang-xia.top 根路径） */
const ZONE_H5_URL = 'https://zone.jiang-xia.top/#/';
/** Zone Admin（与 Nginx /admin/zone-admin/ 及历史 publicPath 一致） */
const ZONE_ADMIN_URL = 'https://zone.jiang-xia.top/admin/zone-admin/login';

const adminBaseUrl = adminUrl.replace(/\/$/, '');

const blogAdminUrl = ref('');
const zoneUrl = ref('');
const blogUniappUrl = ref('');
const dataScreenUrl = ref('');
const zoneAdminUrl = ref('');

/** 挂载后写入带 cache-bust 的演示 URL，避免 iframe 缓存旧页 */
onMounted(() => {
  const ts = Date.now();
  blogAdminUrl.value = withCacheBust(adminBaseUrl, ts);
  dataScreenUrl.value = withCacheBust(joinUrl(adminBaseUrl, 'datascreen'), ts);
  zoneUrl.value = withCacheBust(ZONE_H5_URL, ts);
  blogUniappUrl.value = withCacheBust(BLOG_UNIAPP_URL, ts);
  zoneAdminUrl.value = withCacheBust(ZONE_ADMIN_URL, ts);

  // 详情页 /projects#slug 进入时，等布局稳定再滚到锚点
  const hash = window.location.hash.replace(/^#/, '');
  if (hash) {
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
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
