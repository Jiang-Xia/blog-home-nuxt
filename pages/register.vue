<script setup lang="ts">
import { reactive } from 'vue';
import request from '~~/api/request.js';
import { getRandomAvatar, isPC } from '~~/utils/common';
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

// 注册方式切换
const registerType = ref<'mobile' | 'email'>('mobile');

interface formState extends StringKey {
  mobile: string;
  email: string;
  password: string;
  passwordRepeat: string;
  nickname: string;
  avatar?: string;
  authCode: string;
  verificationCode: string;
}
const form: formState = reactive({
  password: '',
  passwordRepeat: '',
  nickname: '',
  mobile: '',
  email: '',
  avatar: '',
  authCode: '',
  verificationCode: '',
});
const codeUrl = baseUrl + '/user/authCode';
const authCodeUrl = ref('');
const token = useToken();

request
  .get('/resources/files', {
    page: 1,
    pageSize: 100,
    pid: 'f25ca7bc-bd12-4c42-95ef-6c1b70f05012',
    originalname: '',
    type: '',
  })
  .then((res: any) => {
    const urls = res[0].map((v: any) => baseUrl + v.url);
    form.avatar = getRandomAvatar(urls);
  });
/* 注册 */
const okHandle = async () => {
  form.passwordRepeat = form.password;

  const requiredFields
      = registerType.value === 'mobile'
        ? ['mobile', 'password', 'nickname', 'authCode']
        : ['email', 'password', 'nickname', 'verificationCode'];

  const msg: StringKey = {
    mobile: '填写手机号',
    email: '填写邮箱',
    password: '填写密码',
    nickname: '填写昵称',
    authCode: '填写验证码',
    verificationCode: '填写邮箱验证码',
  };

  for (const key of requiredFields) {
    if (!form[key]) {
      messageDanger(msg[key] as string);
      return;
    }
  }

  const params: any = {
    password: form.password,
    passwordRepeat: form.password,
    nickname: form.nickname,
    avatar: form.avatar,
    registerType: registerType.value,
  };
  let url = '/user/register';
  if (registerType.value === 'mobile') {
    params.mobile = form.mobile;
  }
  else {
    params.email = form.email;
    params.verificationCode = form.verificationCode;
    url = '/user/email/register';
  }

  await request.post(url, params);
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

// 发送邮箱验证码
const emailCodeLoading = ref(false);
const emailCodeText = ref('获取验证码');
const emailCodeDisabled = ref(false);

const sendEmailCode = async () => {
  if (!form.email) {
    messageDanger('请先填写邮箱');
    return;
  }

  // 简单邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    messageDanger('请填写正确的邮箱格式');
    return;
  }

  try {
    emailCodeLoading.value = true;
    await request.post('/user/email/sendCode', { email: form.email, type: 'register' });
    messageSuccess('验证码已发送');

    // 倒计时
    let countdown = 60;
    emailCodeDisabled.value = true;
    const timer = setInterval(() => {
      countdown--;
      emailCodeText.value = `${countdown}s后重发`;
      if (countdown <= 0) {
        clearInterval(timer);
        emailCodeText.value = '获取验证码';
        emailCodeDisabled.value = false;
      }
    }, 1000);
  }
  catch (err) {
    // 错误已由request拦截器处理
  }
  finally {
    emailCodeLoading.value = false;
  }
};
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

          <!-- 手机号注册表单 -->
          <template v-if="registerType === 'mobile'">
            <div class="form-control">
              <label class="login-label">
                <span class="login-label-text">手机号</span>
              </label>
              <label class="login-input input">
                <xia-icon icon="blog-shoujihao" />
                <input v-model="form.mobile" type="text" maxlength="11" placeholder="手机号">
              </label>
            </div>

            <div class="form-control">
              <label class="login-label">
                <span class="login-label-text">昵称</span>
              </label>
              <label class="login-input input">
                <xia-icon icon="blog-yonghuming" />
                <input v-model="form.nickname" type="text" maxlength="16" placeholder="昵称">
              </label>
            </div>
            <div class="form-control">
              <label class="login-label">
                <span class="login-label-text">密码</span>
              </label>
              <label class="login-input input">
                <xia-icon icon="blog-mima" />
                <input v-model="form.password" type="password" maxlength="16" placeholder="密码">
              </label>
            </div>
            <div class="form-control">
              <label class="login-label">
                <span class="login-label-text">验证码</span>
              </label>
              <label class="login-input input">
                <xia-icon icon="blog-yanzhengma" />
                <input v-model="form.authCode" maxlength="4" placeholder="验证码">
                <ClientOnly><img
                  class="rounded-sm h-10"
                  :src="authCodeUrl"
                  alt="验证码"
                  @click="changeAuthCode"
                ></ClientOnly>
              </label>
            </div>
          </template>

          <!-- 邮箱注册表单 -->
          <template v-else>
            <div class="form-control">
              <label class="login-label">
                <span class="login-label-text">邮箱</span>
              </label>
              <label class="login-input input">
                <xia-icon icon="blog-youxiang" />
                <input v-model="form.email" type="email" placeholder="邮箱地址">
              </label>
            </div>
            <div class="form-control">
              <label class="login-label">
                <span class="login-label-text">昵称</span>
              </label>

              <label class="login-input input">
                <xia-icon icon="blog-yonghuming" />
                <input v-model="form.nickname" type="text" maxlength="16" placeholder="昵称">
              </label>
            </div>
            <div class="form-control">
              <label class="login-label">
                <span class="login-label-text">密码</span>
              </label>
              <label class="login-input input">
                <xia-icon icon="blog-mima" />
                <input v-model="form.password" type="password" maxlength="16" placeholder="密码">
              </label>
            </div>
            <div class="form-control">
              <label class="login-label">
                <span class="login-label-text">邮箱验证码</span>
              </label>
              <label class="login-input input">
                <xia-icon icon="blog-yanzhengma" />
                <input v-model="form.verificationCode" maxlength="6" placeholder="邮箱验证码">
                <button
                  type="button"
                  class="btn btn-primary btn-sm mr-1"
                  :disabled="emailCodeDisabled || emailCodeLoading"
                  @click="sendEmailCode"
                >
                  <span v-if="!emailCodeLoading">{{ emailCodeText }}</span>
                  <span v-else class="loading loading-spinner" />
                </button>
              </label>
            </div>
          </template>
          <a href="/login" class="link text-xs text-gray-600 hover:text-gray-500 mt-1">已有账号?快去登录吧！</a>
          <div class="flex justify-between mt-1">
            <label>
              <div
                v-if="registerType === 'mobile'"
                class="link text-xs text-gray-600 hover:text-gray-500"
                @click="registerType = 'email'"
              >邮箱注册</div>
              <div
                v-else
                class="link text-xs text-gray-600 hover:text-gray-500"
                @click="registerType = 'mobile'"
              >手机号注册
              </div>
            </label>
          </div>
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
