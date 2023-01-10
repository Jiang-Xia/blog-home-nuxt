<script setup lang="ts">
  import { reactive, ref, computed } from 'vue'
  import { messageDanger, messageSuccess } from '@/utils/toast'

  import request from '~~/api/request'
  interface MsgInterFace  {
    name: '',
    eamil: '',
    address: '',
    comment: '',
    code: '',
  }
  const { data: msgboardList, } = await useAsyncData('msgboard_Get', () =>
    request.get('/msgboard').then(res => res.data)
  )
  const authCode = ref('')
  const authCodeRef = ref()
  const showToast = ref(false)
  const createCodeHandle = () => {
    authCode.value = authCodeRef.value.createCode(4)
  }
  const createdHandle = (v: string) => {
    authCode.value = v
  }
  const msgForm:MsgInterFace = reactive({
    name: '',
    eamil: '',
    address: '',
    comment: '',
    code: '',
  })
  const isRight = computed(() => {
    return authCode.value.toUpperCase() === msgForm.code.toUpperCase()
  })
  const showTip = () => {
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 1500)
  }
  const confirmHandle = () => {
    const keys = Object.keys(msgForm)
    console.log(isRight, authCode.value.toUpperCase() === msgForm.code.toUpperCase())
    if (!isRight.value) {
      // console.log("验证码错误！");
      messageDanger('验证码错误！')
      showTip()
      return
    }
    if (keys.every(v => !v)) {
      showTip()
    }
    console.log(msgForm)
    request.post('/msgboard', msgForm)
    keys.forEach((k) => (msgForm[k as keyof MsgInterFace] = ''))
  }

  useHead({
    title: '留言板',
    titleTemplate: title => `${title} - 江夏的个人博客 - 记录生活记录你~`,
  })
</script>
<template>
  <NuxtLayout name="main-content">
    <h1 class="hidden">网站留言板 - 江夏的个人博客 - 记录生活记录你~</h1>
    <div class="msgboard-container flex flex-wrap md:flex-nowrap">
      <div
        class="card card-compact flex-shrink-0 w-full md:max-w-sm shadow-2xl bg-base-100 form-wrap relative"
      >
        <div v-show="showToast" class="alert alert-info absolute top-0 left-0">
          <div>
            <span>请填写完整信息哦！</span>
          </div>
        </div>
        <div class="card-body">
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

          <div class="form-control">
            <label class="label">
              <span class="label-text"><span class="text-red-600 px-2">*</span>验证码</span>
            </label>
            <div class="flex justify-between items-center mb-2">
              <xia-auth-code
                ref="authCodeRef"
                class="bg-base-300 rounded-sm"
                @created="createdHandle"
              />

              <span
                class="label-text-alt link link-secondary link-hover"
                @click="createCodeHandle"
              >看不清？重新生成</span>
            </div>
            <input
              v-model="msgForm.code"
              class="input input-bordered"
              placeholder="请输入图片中的验证码"
            >
          </div>

          <div class="form-control mt-6">
            <button class="btn btn-primary" @click="confirmHandle">发表</button>
          </div>
        </div>
      </div>

      <!-- 留言内容列表 -->
      <!-- 正常是移动样式 大于sm宽度时变成pc样式 -->
      <div class="card card-compact mt-3 ml-0 md:ml-4 md:mt-0 md:flex-1 w-full shadow-2xl">
        <div class="card-body">
          <div
            v-for="(item) in msgboardList"
            class="card card-compact card-side bg-base-100 shadow-xl mb-3"
          >
            <figure>
              <div class="avatar h-16 w-16 ml-3">
                <div class="w-24 rounded-full bg-base-300" title="点击跳转他的主页！">
                  <a :href="item.address" target="_blank">
                    <img :alt="item.name" :src="item.avatar">
                  </a>
                </div>
              </div>
            </figure>
            <div class="card-body">
              <h2 class="card-title">{{ item.name }}</h2>
              <p>{{ item.comment }}</p>
              <div class="card-actions justify-end">
                <div class="text-xs text-gray-400"> 发表于 {{ item.createAt }} </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
<style lang="less" scoped>
  .msgboard-container {
    .form-wrap {
      max-height: 48rem;
    }
    .avatar:hover {
      animation: rotate-scale-up 0.65s linear both;
    }
  }
</style>
