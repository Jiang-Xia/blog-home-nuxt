<script setup lang="ts">
  import { reactive, ref, computed } from 'vue'
  import { messageDanger } from '@/utils/toast'

  import request from '~~/api/request'
  interface MsgInterFace {
    name: ''
    eamil: ''
    address: ''
    comment: ''
  }
  const { data: msgboardList, refresh, } = await useAsyncData('msgboard_Get', () =>
    request.get('/msgboard').then(res => res.data)
  )
  // console.log(msgboardList.value)
  const showToast = ref(false)
  const msgForm: MsgInterFace = reactive({
    name: '',
    eamil: '',
    address: '',
    comment: '',
  })
  const showTip = () => {
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 1500)
  }
  onMounted(() => {
    document.addEventListener('click', () => {
      dialog.value = false
    })
  })
  const confirmHandle = async () => {
    try {
      const keys = Object.keys(msgForm)
      if (keys.every(k => !msgForm[k as keyof MsgInterFace])) {
        showTip()
        return
      }
      await request.post('/msgboard', msgForm)
      keys.forEach(k => (msgForm[k as keyof MsgInterFace] = ''))
      // refresh()
      msgboardList.value = await request.get('/msgboard').then(res => res.data)
    } catch (error) {
      console.log(error)
    }
  }
  // 回复功能
  const clickReplyHandle = (item: any) => {
    dialog.value = true
    currentItem.value = item
  }
  const currentItem = ref<any>()
  const dialog = ref(false)
  const replyForm: any = ref({
    name: '',
    comment: '',
  })
  const okHandle = async () => {
    await request.post('/msgboard', {
      pId: currentItem.value.id,
      name: replyForm.value.name,
      replyId: currentItem.value.id,
      respondent: currentItem.value.name,
      eamil: '',
      address: '',
      comment: replyForm.value.comment,
    })
    dialog.value = false
  }
  useHead({
    title: '留言板',
    titleTemplate: title => `${title} - 江夏的博客`,
  })
</script>
<template>
  <NuxtLayout name="main-content">
    <h1 class="hidden">网站留言板 - 江夏的博客</h1>
    <div class="msgboard-container">
      <div class="form-wrap max-w-3xl mx-auto">
        <div v-show="showToast" class="alert alert-info absolute top-0 left-0">
          <span>请填写完整信息哦！</span>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text"><span class="text-red-600 px-2">*</span>昵称</span>
          </label>
          <input
            v-model="msgForm.name"
            type="text"
            placeholder="您的昵称"
            class="input input-bordered"
          >
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text"><span class="text-red-600 px-2">*</span>邮件</span>
          </label>
          <input
            v-model="msgForm.eamil"
            type="text"
            placeholder="您的邮件"
            class="input input-bordered"
          >
          <label class="label">
            <a
              href="http://milu.blog/message"
              class="label-text-alt link link-primary link-hover"
              target="_blank"
            >Gravatar?</a>
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text"><span class="text-red-600 px-2">*</span>主页</span>
          </label>
          <input
            v-model="msgForm.address"
            type="text"
            placeholder="您的主页"
            class="input input-bordered"
          >
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text"><span class="text-red-600 px-2">*</span>评论</span>
          </label>
          <textarea
            v-model="msgForm.comment"
            class="textarea textarea-bordered"
            placeholder="您的评论"
          />
        </div>
        <div class="form-control mt-6">
          <button class="btn btn-primary" @click="confirmHandle">发表</button>
        </div>
      </div>
      <!-- 留言内容列表 -->
      <div class="mt-6 max-w-3xl mx-auto">
        <div v-for="item in msgboardList" :key="item.id" class="card card-compact card-side mb-3">
          <div class="card-body bg-base-100 rounded">
            <h2 class="card-title text-sm font-normal">
              <div class="avatar h-7 w-7">
                <div class="w-7 rounded-full bg-base-300" title="点击跳转他的主页！">
                  <a :href="item.address" target="_blank">
                    <img v-lazyImg="item.avatar">
                  </a>
                </div>
              </div>
              {{ item.name }}
            </h2>
            <p>{{ item.comment }}</p>
            <div class="card-actions justify-end text-xs text-gray-400">
              <button class="mr-auto" @click.stop="clickReplyHandle(item)">
                <xia-icon icon="blog-pinglun" width="14px" class="mr-1" />回复
              </button>
              <span> <xia-icon width="14px" icon="blog-dingwei" />{{ item.location }} </span>
              <span> <xia-icon width="14px" icon="blog-os" /> {{ item.system }} </span>
              <span> <xia-icon width="14px" icon="blog-browser" /> {{ item.browser }} </span>
              <span> <xia-icon width="14px" icon="blog-shijian" /> {{ item.createAt }} </span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal" :class="{ 'dialog-show': dialog }" @click.stop="">
        <div class="modal-box relative">
          <div class="pl-8 pt-4">
            <div class="flex items-center mb-4">
              <span class="w-16"><span class="text-red-600">*</span>名称</span>
              <input
                v-model="replyForm.name"
                type="text"
                placeholder="你的名称"
                class="input input-bordered input-sm max-w-xs w-5/6"
              >
            </div>
            <div class="flex items-center mb-4">
              <span class="w-16"><span class="text-red-600">*</span>内容</span>
              <textarea
                v-model="replyForm.comment"
                class="textarea textarea-bordered max-w-xs w-5/6"
                placeholder="您的评论"
              />
            </div>
            <div class="modal-action">
              <label for="link-add-modal" class="btn" @click="okHandle">确 认</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
<style lang="less" scoped>
  .msgboard-container {
    position: relative;
    width: 100%;
    .avatar:hover {
      animation: rotate-scale-up 0.65s linear both;
    }
    .form-wrap {
      position: relative;
    }
  }
  .dialog-show {
    pointer-events: auto;
    visibility: visible;
    opacity: 1;
  }
</style>
