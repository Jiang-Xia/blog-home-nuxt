<script setup lang="ts">
  import { reactive, ref, onMounted } from 'vue'
  import request from '~~/api/request.js'
  import api from '@/api'
  import { dailyImage } from '~~/api/article'

  import { messageDanger, messageSuccess } from '~~/utils/toast'
  // console.log(imagesData);
  onMounted(() => {})
  const token = useToken()

  definePageMeta({
    layout: 'custom', // 不使用default布局
  })
  useHead({
    title: '登录',
    titleTemplate: title => `${title} - 江夏的个人博客-记录生活记录你~`,
  })
  interface formState extends StringKey {
    mobile: string;
    password: string;
  }
  const form: formState = reactive({
    mobile: '',
    password: '',
  })
  /* 登录 */
  const loginHandle = async () => {
    // console.log(res)
  }
  const okHandle = async () => {
    const msg: formState = {
      mobile: '填写手机号',
      password: '填写密码',
    }
    for (const key in form) {
      if (!form[key]) {
        // console.log(msg[key]);
        messageDanger(msg[key] as string)
        return
      }
    }
    let res: any
    try {
      res = await request.post('/user/login', form)
      token.value = res.data.info.token
      navigateTo('/')
      localStorage.setItem('x-token', token.value)
      messageSuccess('登录成功')
    } catch (err) {}
  }
</script>
<template>
  <div class="form-container">
    <div class="w-10/12 md:w-96">
      <div class="card max-w-sm shadow-2x text-white">
        <!-- <figure><img src="@/assets/images/login/coding3.jpg " alt="注 册" /></figure> -->
        <div class="card-body" autocomplete="off">
          <h1 class="card-title">登 录</h1>
          <div class="form-control">
            <label class="label">
              <span class="label-text">手机号</span>
            </label>
            <input
              v-model="form.mobile"
              type="text"
              class="input"
              maxlength="11"
              placeholder="手机号"
            >
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">密码</span>
            </label>
            <input
              v-model="form.password"
              type="password"
              class="input"
              maxlength="16"
              placeholder="密码"
            >
          </div>
          <div class="flex justify-between mt-1">
            <a
              href="/register"
              class="link text-xs text-gray-600 hover:text-gray-500"
            >还没有账号?快去注册吧！</a>
            <a href="/" class="link text-xs text-gray-600 hover:text-gray-500">返回首页</a>
          </div>

          <div class="form-control mt-4">
            <button class="btn btn-primary" @click.prevent="okHandle">登 录</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
  .form-container {
    height: 100vh;
    width: 100vw;
    @apply flex justify-center items-center;
    background-image: url(@/assets/images/login/coding3.jpg);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    // color: var(--text-color);
    .label .label-text {
      @apply text-gray-200;
    }
    .input {
      @apply bg-transparent text-gray-200 border border-gray-700 focus:border-gray-600;
    }
    .card {
      backdrop-filter: blur(40px);
    }
  }
</style>
