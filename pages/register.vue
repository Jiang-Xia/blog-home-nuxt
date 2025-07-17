<script setup lang="ts">
import { reactive } from 'vue';
import request from '~~/api/request.js';
import { getRandomAvatar } from '~~/utils/common';
import { messageDanger, messageSuccess } from '~~/utils/toast';
import { baseUrl } from '~~/config';

let rsaEncrypt: any;
// 客户端才引入
if (import.meta.client) {
  import('~~/utils/jsencrypt').then((res) => {
    rsaEncrypt = res.rsaEncrypt;
  });
}
definePageMeta({
  layout: 'custom', // 不使用default布局
});
useHead({
  title: '注册',
  titleTemplate: title => `${title} - 江夏的个人博客-记录生活记录你~`,
});
interface formState extends StringKey {
  mobile: string;
  password: string;
  passwordRepeat: string;
  nickname: string;
  avatar?: string;
}
const form: formState = reactive({
  password: '',
  passwordRepeat: '',
  nickname: '',
  mobile: '',
  avatar: getRandomAvatar() as string,
});
const codeUrl = baseUrl + '/user/authCode';
const authCodeUrl = ref('');
const token = useToken();
/* 登录 */
const okHandle = async () => {
  form.passwordRepeat = form.password;
  const msg: formState = {
    mobile: '填写手机号',
    password: '填写密码',
    nickname: '填写昵称',
    passwordRepeat: '再次填写密码',
  };
  for (const key in form) {
    if (!form[key]) {
      // console.log(msg[key]);
      messageDanger(msg[key] as string);
      return;
    }
  }
  await request.post('/user/register', form);
  messageSuccess('注册成功');
  setTimeout(async () => {
    await navigateTo('/login');
  }, 500);
};
  // 更换验证码
const changeAuthCode = () => {
  authCodeUrl.value = codeUrl + '?t=' + new Date().getTime();
};
changeAuthCode();
// const posterUrl2 = 'https://jiang-xia.top/x-zone/api/v1/public/uploads/2023-05/神经细胞-封面.jpg'
// const videoUrl2 = 'https://jiang-xia.top/x-zone/api/v1/public/uploads/2023-05/神经细胞.mp4'
const isPcClient = ref(false);
if (import.meta.client) {
  if (isPC()) {
    isPcClient.value = true;
  }
}
</script>

<template>
  <div class="register-container">
    <div class="form-wrap w-10/12 md:w-96">
      <div class="card max-w-sm shadow-2x text-white">
        <!-- <figure  class="h-full"><img src="@/assets/images/login/phone.jpg" alt="注 册" /></figure> -->
        <div class="card-body">
          <div class="flex justify-between items-center">
            <h1 class="card-title">
              欢 迎 注 册
            </h1>
            <div
              class="avatar btn btn-ghost btn-circle btn-sm"
              title="点击切换头像"
              @click="form.avatar = getRandomAvatar()"
            >
              <div class="rounded-full">
                <img :src="form.avatar">
              </div>
            </div>
          </div>
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
              <span class="login-label-text">昵称</span>
            </label>
            <input
              v-model="form.nickname"
              type="text"
              class="login-input input"
              maxlength="16"
              placeholder="昵称"
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
          <a href="/login" class="link text-xs text-gray-600 hover:text-gray-500 mt-1">已有账号?快去登录吧！</a>

          <div class="form-control mt-2">
            <InShimmerButton
              class="shadow-2xl btn-block text-gray-300 hover:text-gray-100"
              shimmer-size="2px"
              @click.prevent="okHandle"
            >
              <span
                class="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg dark:from-white dark:to-slate-900/10"
              >
                <span class="pr-16">注</span>册
              </span>
            </InShimmerButton>
          </div>
        </div>
      </div>
    </div>
    <InFlickeringGrid
      class="relative inset-0 z-0 [mask-image:radial-gradient(650px_circle_at_center,white,transparent)]"
      :square-size="4"
      :grid-gap="6"
      color="#4ba6c6"
      :max-opacity="0.5"
      :flicker-chance="0.1"
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
  .register-container {
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
      // filter: blur(28px) brightness(0.95);
      // backdrop-filter: blur(20px);
      backdrop-filter: blur(40px);
    }
  }
</style>
