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

// 登录方式切换
const loginType = ref<'mobile' | 'email'>('mobile');

interface formState extends StringKey {
  mobile: string;
  email: string;
  password: string;
  authCode: string;
  verificationCode: string;
}
const form: formState = reactive({
  mobile: '',
  email: '',
  password: '',
  authCode: '',
  verificationCode: '',
});
  /* 登录 */
const okHandle = async () => {
  const requiredFields
      = loginType.value === 'mobile'
        ? ['mobile', 'password', 'authCode']
        : ['email', 'password', 'verificationCode'];

  const msg: StringKey = {
    mobile: '填写账号',
    email: '填写邮箱',
    password: '填写密码',
    authCode: '填写验证码',
    verificationCode: '填写邮箱验证码',
  };

  for (const key of requiredFields) {
    if (!form[key]) {
      messageDanger(msg[key] as string);
      return;
    }
  }

  let res: any;

  try {
    const params: any = {
      password: rsaEncrypt(form.password),
      loginType: loginType.value,
    };
    let url = '/user/login';
    if (loginType.value === 'mobile') {
      params.mobile = form.mobile;
      params.authCode = form.authCode;
    }
    else {
      params.email = form.email;
      params.verificationCode = form.verificationCode;
      url = '/user/email/login';
    }

    res = await request.post(url, params);
    token.value = res.info.accessToken;
    await navigateTo('/');
    setToken(TokenKey, res.info.accessToken);
    setToken(RefreshTokenKey, res.info.refreshToken, '', 7);
    messageSuccess('登录成功');
  }
  catch (err) {
    console.error(err);
  }
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
    await request.post('/user/email/sendCode', { email: form.email, type: 'login' });
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
  // viedeo静音了(muted=true)才能自动播放
const isPcClient = ref(false);
if (import.meta.client) {
  if (isPC()) {
    isPcClient.value = true;
  }
  // github授权登录
  const route = useRoute();
  const query: any = route.query;
  if (query.accessToken) {
    token.value = query.accessToken;
    setToken(TokenKey, query.accessToken);
    setToken(RefreshTokenKey, query.refreshToken, '', 7);
    messageSuccess('登录成功');
    navigateTo('/');
  }
}
const githubLoginLoading = ref(false);
const githubLogin = () => {
  githubLoginLoading.value = true;
  messageInfo('正在登录...', 3000);
  location.href = `${baseUrl}/user/auth/github`;
};

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

          <!-- 账号登录表单 -->
          <template v-if="loginType === 'mobile'">
            <div class="form-control">
              <label class="login-label">
                <span class="login-label-text">账号</span>
              </label>
              <label class="login-input input">
                <xia-icon icon="blog-shoujihao" />
                <input v-model="form.mobile" type="text" maxlength="11" placeholder="账号">
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

          <!-- 邮箱登录表单 -->
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
          <div class="flex justify-between mt-1">
            <a href="/register" class="link text-xs text-gray-600 hover:text-gray-500">还没有账号?快去注册吧！</a>
            <a href="/" class="link text-xs text-gray-600 hover:text-gray-500">返回首页</a>
          </div>
          <div class="flex justify-between mt-1">
            <label>
              <div
                v-if="loginType === 'mobile'"
                class="link text-xs text-gray-600 hover:text-gray-500"
                @click="loginType = 'email'"
              >邮箱登录</div>
              <div
                v-else
                class="link text-xs text-gray-600 hover:text-gray-500"
                @click="loginType = 'mobile'"
              >账号登录</div>
            </label>
          </div>
          <button
            class="btn bg-black btn-circle text-white border-black block w-full"
            @click="githubLogin"
          >
            <span v-if="githubLoginLoading" class="loading loading-spinner" />
            <xia-icon icon="blog-github" width="40px" height="40px" />
            Login with GitHub
          </button>
          <div class="form-control mt-2">
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
