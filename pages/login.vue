<script setup lang="ts">
import { reactive } from 'vue';
import request from '~~/api/request.js';
import { messageDanger, messageSuccess } from '~~/utils/toast';
import { baseUrl } from '~~/config';
import { isPC } from '~/utils/common';
import { setToken, TokenKey, RefreshTokenKey } from '@/utils/cookie';
// import { useMainStore } from '~/stores'
let rsaEncrypt: any;
// 客户端才引入
if (import.meta.client) {
  import('~~/utils/jsencrypt').then((res) => {
    rsaEncrypt = res.rsaEncrypt;
  });
}
const codeUrl = baseUrl + '/user/authCode';
const authCodeUrl = ref('');
const token = useToken();
definePageMeta({
  layout: 'custom', // 不使用default布局
});
useHead({
  title: '登录',
  titleTemplate: title => `${title} - 江夏的个人博客-记录生活记录你~`,
});
interface formState extends StringKey {
  mobile: string;
  password: string;
  authCode: string;
}
const form: formState = reactive({
  mobile: '',
  password: '',
  authCode: '',
});
  /* 登录 */
const okHandle = async () => {
  const msg: formState = {
    mobile: '填写手机号',
    password: '填写密码',
    authCode: '填写验证码',
  };
  for (const key in form) {
    if (!form[key]) {
      // console.log(msg[key]);
      messageDanger(msg[key] as string);
      return;
    }
  }
  let res: any;

  try {
    const params = { ...form };
    params.password = rsaEncrypt(form.password);
    res = await request.post('/user/login', params);
    token.value = res.info.accessToken;
    await navigateTo('/');
    setToken(TokenKey, res.info.accessToken);
    setToken(RefreshTokenKey, res.info.refreshToken, '', 7);
    messageSuccess('登录成功');
  }
  catch (err) {}
};
  // 更换验证码
const changeAuthCode = () => {
  authCodeUrl.value = codeUrl + '?t=' + new Date().getTime();
};
changeAuthCode();
// const counter = useMainStore()
// const videoUrl = 'https://jiang-xia.top/x-zone/api/v1/public/uploads/2023-05/赛博朋克.mp4'
// const posterUrl = 'https://jiang-xia.top/x-zone/api/v1/public/uploads/2023-05/赛博朋克-封面.jpg'
// const posterUrl2 = 'https://jiang-xia.top/x-zone/api/v1/public/uploads/2023-05/神经细胞-封面.jpg'
// const videoUrl2 = ref('https://jiang-xia.top/x-zone/api/v1/public/uploads/2023-05/神经细胞.mp4')
// viedeo静音了(muted=true)才能自动播放
const isPcClient = ref(false);
if (import.meta.client) {
  if (isPC()) {
    isPcClient.value = true;
  }
}
const bgConfig = reactive({ height: 0, width: 0 });
onMounted(() => {
  bgConfig.height = window.innerHeight;
  bgConfig.width = window.innerWidth;
});
</script>

<template>
  <div class="login-container">
    <div class="form-wrap w-10/12 md:w-96">
      <div class="card max-w-sm shadow-2x text-white">
        <!-- <figure><img src="@/assets/images/login/coding3.jpg " alt="注 册" /></figure> -->
        <div class="card-body" autocomplete="off">
          <h1 class="card-title">
            欢 迎 登 录
          </h1>
          <div class="form-control">
            <label class="login-label">
              <span class="login-label-text">手机号</span>
            </label>
            <input
              v-model="form.mobile"
              type="text"
              class="login-input input"
              maxlength="11"
              placeholder="手机号"
            >
          </div>
          <div class="form-control">
            <label class="login-label">
              <span class="login-label-text">密码</span>
            </label>
            <input
              v-model="form.password"
              type="password"
              class="login-input input"
              maxlength="16"
              placeholder="密码"
            >
          </div>
          <div class="form-control">
            <label class="login-label">
              <span class="login-label-text">验证码</span>
            </label>
            <input
              v-model="form.authCode"
              class="login-input input"
              maxlength="8"
              placeholder="验证码"
            >
          </div>
          <div class="form-control">
            <div>
              <img
                class="rounded-sm h-10"
                :src="authCodeUrl"
                alt="验证码"
                @click="changeAuthCode"
              >
            </div>
          </div>
          <div class="flex justify-between mt-1">
            <a href="/register" class="link text-xs text-gray-600 hover:text-gray-500">还没有账号?快去注册吧！</a>
            <a href="/" class="link text-xs text-gray-600 hover:text-gray-500">返回首页</a>
          </div>

          <div class="form-control mt-4">
            <InShimmerButton
              class="shadow-2xl btn-block text-gray-300 hover:text-gray-100 dark:from-white dark:to-slate-900/10"
              shimmer-size="2px"
              @click.prevent="okHandle"
            >
              <span
                class="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg dark:from-white dark:to-slate-900/10"
              >
                <span class="pr-16">登</span>录
              </span>
            </InShimmerButton>
          </div>
        </div>
      </div>
    </div>
    <InParticlesBg
      class="absolute inset-0"
      :quantity="100"
      :ease="100"
      color="#FFF"
      :staticity="10"
      refresh
    />
    <!-- <video class="video-bg" :poster="posterUrl2" autoplay loop :muted="true">
      <source v-if="isPcClient" type="video/mp4" :src="videoUrl2">
    </video> -->
  </div>
</template>

<style lang="less" scoped>
  .video-bg {
    height: 100vh;
    width: 100vw;
    position: fixed;
    z-index: 0;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }
  .login-container {
    height: 100vh;
    width: 100vw;
    background-image: url(@/assets/images/login/coding3.jpg);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    .form-wrap {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
    }
    .card {
      backdrop-filter: blur(40px);
    }
  }
</style>
