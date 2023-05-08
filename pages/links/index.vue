<script setup lang="ts">
  import { ref } from 'vue'
  import request from '~~/api/request'
  import { messageDanger, messageSuccess } from '~~/utils/toast'

  interface LinkState {
    icon: string
    url: string
    title: string
    desp: string
  }

  const { data: linkList, } = await useAsyncData('link_Get', () =>
    request.get('/link', { client: true, }).then(res => res.data)
  )
  const linkState = ref<LinkState>({
    icon: '',
    url: '',
    title: '',
    desp: '',
  })
  const okHandle = async () => {
    if (Object.keys(linkState.value).some(v => !linkState.value[v as keyof LinkState])) {
      messageDanger('请信息填写完整信息', 2)
      return
    }
    await request.post('/link', linkState.value)
    messageSuccess('申请成功')
    isOpen.value = false
    linkState.value = {
      icon: '',
      url: '',
      title: '',
      desp: '',
    }
    linkList.value = await request.get('/link', { client: true, }).then(res => res.data)
    // console.log(linkList.value)
  }
  const isOpen = ref(false)
  useHead({
    title: '友链',
    titleTemplate: title => `${title} - 江夏的博客`,
  })
</script>
<template>
  <NuxtLayout name="main-content">
    <div class="links-container pt-3 rounded-box p-4">
      <h1 class="hidden">友情链接 - 江夏的博客</h1>
      <div class="flex justify-end">
        <label for="link-add-modal" class="btn modal-button link-btn btn-ghost">+ 申请外链</label>
      </div>

      <!-- 新增弹框 -->
      <input id="link-add-modal" type="checkbox" class="modal-toggle">
      <div class="modal">
        <div class="modal-box relative">
          <label for="link-add-modal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
          <h3 class="text-lg font-bold">申请外链</h3>
          <div class="pl-8 pt-4">
            <div class="flex items-center mb-4">
              <span class="w-16"><span class="text-red-600">*</span>网站名</span>
              <input
                v-model="linkState.title"
                type="text"
                placeholder="网站名"
                class="input input-bordered input-sm max-w-xs w-5/6"
              >
            </div>
            <div class="flex items-center mb-4">
              <span class="w-16"><span class="text-red-600">*</span>网址</span>
              <input
                v-model="linkState.url"
                type="text"
                placeholder="网址"
                class="input input-bordered input-sm max-w-xs w-5/6"
              >
            </div>
            <div class="flex items-center mb-4">
              <span class="w-16"><span class="text-red-600">*</span>图标</span>
              <input
                v-model="linkState.icon"
                type="text"
                placeholder="图标"
                class="input input-bordered input-sm max-w-xs w-5/6"
              >
            </div>
            <div class="flex items-center">
              <span class="w-16"><span class="text-red-600">*</span>个签</span>
              <input
                v-model="linkState.desp"
                type="text"
                placeholder="个签"
                class="input input-bordered input-sm max-w-xs w-5/6"
              >
            </div>
            <div class="modal-action">
              <label for="link-add-modal" class="btn" @click="okHandle">确 认</label>
            </div>
          </div>
        </div>
      </div>

      <!-- 友链列表 -->
      <div class="flex flex-wrap justify-around mt-6">
        <div
          v-for="item in linkList"
          class="card w-full lg:w-80 shadow-xl bg-base-100 mb-6 transition duration-700 ease-in-out hover:scale-105 border border-base-300"
        >
          <div class="card-body p-2 sm:p-4">
            <h2 class="card-title">
              <a target="_blank" :href="item.url">{{ item.title }}</a>
            </h2>
            <a class="flex items-center" target="_blank" :href="item.url">
              <div class="avatar">
                <div class="w-10 rounded-full bg-base-300">
                  <img v-show="item.icon" v-lazyImg="item.icon" :alt="item.title">
                </div>
              </div>
              <div class="pl-2 text-sm">{{ item.desp }}</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
<style lang="less" scoped>
  .links-container {
    min-height: 40vh;

    .link-btn {
      background: var(--minor-bgc);
    }

    .link-btn:hover {
      animation: jump ease 1.5s 1;
    }
  }
</style>
