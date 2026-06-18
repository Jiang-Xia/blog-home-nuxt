<script setup lang="ts">
import { ref } from 'vue';
import request from '~~/api/request';
import { messageDanger, messageSuccess } from '~~/utils/toast';
import { SiteTitle } from '@/utils/constant';

interface LinkState {
  icon: string;
  url: string;
  title: string;
  desp: string;
}

const { data: linkList } = await useAsyncData('link_Get', () =>
  request.get('/link', { client: true }),
);
const linkState = ref<LinkState>({
  icon: '',
  url: '',
  title: '',
  desp: '',
});
const okHandle = async () => {
  if (Object.keys(linkState.value).some(v => !linkState.value[v as keyof LinkState])) {
    messageDanger('请信息填写完整信息', 2);
    return;
  }
  await request.post('/link', linkState.value);
  messageSuccess('申请成功');
  linkState.value = {
    icon: '',
    url: '',
    title: '',
    desp: '',
  };
  linkList.value = await request.get('/link', { client: true });
};
useHead({
  title: '友链',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});
</script>

<template>
  <CyberPageContainer label="LINKS" title="友情链接" subtitle="与志同道合的站点互联互通">
    <h1 class="hidden">
      友情链接 - {{ SiteTitle }}
    </h1>

    <div class="mb-6 flex justify-end">
      <label for="link-add-modal" class="cyber-btn-primary cursor-pointer text-sm">
        + 申请外链
      </label>
    </div>

    <input id="link-add-modal" type="checkbox" class="modal-toggle">
    <div class="modal">
      <div class="modal-box cyber-glass-card border border-tech">
        <label
          for="link-add-modal"
          class="btn btn-sm cyber-btn-secondary btn-circle absolute right-2 top-2"
        >✕</label>
        <h3 class="text-lg font-bold text-tech">
          申请外链
        </h3>
        <div class="mt-4 space-y-4">
          <label
            v-for="field in [
              { key: 'title', label: '网站名', placeholder: '网站名' },
              { key: 'url', label: '网址', placeholder: 'https://...' },
              { key: 'icon', label: '图标', placeholder: '图标 URL' },
              { key: 'desp', label: '个签', placeholder: '站点简介' },
            ]"
            :key="field.key"
            class="form-control"
          >
            <span class="label"><span class="label-text"><span class="text-red-500">*</span>{{ field.label }}</span></span>
            <input
              v-model="linkState[field.key as keyof LinkState]"
              type="text"
              :placeholder="field.placeholder"
              class="input input-bordered w-full login-input"
            >
          </label>
          <div class="modal-action">
            <label for="link-add-modal" class="cursor-pointer" @click="okHandle">
              <CyberButton variant="primary">确 认</CyberButton>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <CyberCard
        v-for="item in linkList"
        :key="item.url"
        hover
        class="group !p-4 transition-transform hover:scale-[1.02]"
      >
        <h2 class="mb-2 text-lg font-semibold text-tech">
          <a
            target="_blank"
            :href="item.url"
            class="no-underline transition-colors hover:text-primary"
          >{{ item.title }}</a>
        </h2>
        <a class="flex items-center gap-3 no-underline" target="_blank" :href="item.url">
          <div class="avatar">
            <div class="w-10 rounded-full bg-tech-header ring-2 ring-tech">
              <xia-image
                v-show="item.icon"
                lazyload
                :src="item.icon"
                :alt="item.title"
                class="h-full"
              />
            </div>
          </div>
          <p class="text-sm text-tech-muted group-hover:text-tech transition-colors">{{
            item.desp
          }}</p>
        </a>
      </CyberCard>
    </div>
  </CyberPageContainer>
</template>
