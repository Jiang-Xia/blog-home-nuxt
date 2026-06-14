<script setup lang="ts">
import { reactive } from 'vue';
import request from '~~/api/request.js';
import { messageDanger, messageSuccess } from '~~/utils/toast';
import { debounce } from '~~/utils/index';
import { baseUrl } from '~~/config';
import { isPC } from '~/utils/common';
import { setToken, TokenKey, RefreshTokenKey } from '@/utils/cookie';
import { rsaEncrypt as rsaEncryptUtil } from '~~/utils/jsencrypt';
import { loadRsaScript } from '~/utils/script-loader';
import { shouldRefreshGraphicCaptcha } from '~~/utils/graphic-captcha-error';
import { USERNAME_MAX_LENGTH, validateUsernameForLogin } from '~~/utils/username';

let rsaEncrypt: any;
// 客户端才加载
if (import.meta.client) {
  // 按需加载 RSA 加密脚本
  loadRsaScript().then(() => {
    rsaEncrypt = rsaEncryptUtil;
  });
}
const authCodeUrl = ref('');
const authCodeLoadError = ref(false);
const captchaId = ref('');
const token = useToken();
definePageMeta({
  layout: 'custom', // 不使用default布局
});
useHead({
  title: '登录',
  titleTemplate: title => `${title} - 江夏的个人博客-记录生活记录你~`,
});

// 登录方式切换
const loginType = ref<'account' | 'email'>('account');

interface formState extends StringKey {
  username: string;
  email: string;
  password: string;
  authCode: string;
  verificationCode: string;
}
const form: formState = reactive({
  username: '',
  email: '',
  password: '',
  authCode: '',
  verificationCode: '',
});
  /* 登录 */
const okHandle = async () => {
  const requiredFields
    = loginType.value === 'account'
      ? ['username', 'password', 'authCode']
      : ['email', 'password', 'verificationCode'];

  const msg: StringKey = {
    username: '填写用户名',
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

  if (loginType.value === 'account') {
    const usernameErr = validateUsernameForLogin(form.username);
    if (usernameErr) {
      messageDanger(usernameErr);
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
    if (loginType.value === 'account') {
      params.username = form.username;
      params.authCode = form.authCode;
      params.captchaId = captchaId.value;
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
  catch (err: any) {
    console.error(err);
    if (loginType.value === 'account' && shouldRefreshGraphicCaptcha(err?.bizCode)) {
      form.authCode = '';
      captchaId.value = '';
      void changeAuthCode();
    }
  }
};
  // 更换验证码
const changeAuthCode = async () => {
  try {
    const res = await request.get('/user/authCode', { t: Date.now() });
    authCodeUrl.value = `data:image/svg+xml;base64,${res.captchaBase64}`;
    captchaId.value = res.captchaId || '';
    authCodeLoadError.value = false;
  }
  catch {
    authCodeUrl.value = '';
    captchaId.value = '';
    authCodeLoadError.value = true;
    // 错误提示由 request 拦截器统一处理
  }
};
const changeAuthCodeDebounced = debounce(() => {
  void changeAuthCode();
}, 300);
void changeAuthCode();

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
  if (query.accessToken || query.refreshToken || query.ticket) {
    messageDanger('检测到URL携带敏感登录信息，已拦截。请重新通过授权流程登录。');
    history.replaceState({}, '', route.path);
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

          <form @submit.prevent="okHandle">
            <!-- 账号登录表单 -->
            <template v-if="loginType === 'account'">
              <div class="form-control">
                <label class="login-label">
                  <span class="login-label-text">用户名 / 手机号</span>
                </label>
                <label class="login-input input">
                  <xia-icon icon="blog-shoujihao" />
                  <input
                    v-model="form.username"
                    type="text"
                    :maxlength="USERNAME_MAX_LENGTH"
                    placeholder="用户名 / 手机号"
                  >
                </label>
              </div>
              <div class="form-control">
                <label class="login-label">
                  <span class="login-label-text">密码</span>
                </label>
                <label class="login-input input">
                  <xia-icon icon="blog-mima" />
                  <input
                    v-model="form.password"
                    type="password"
                    maxlength="16"
                    placeholder="密码"
                  >
                </label>
              </div>

              <div class="form-control">
                <label class="login-label">
                  <span class="login-label-text">验证码</span>
                </label>
                <label class="login-input input">
                  <xia-icon icon="blog-yanzhengma" />
                  <input v-model="form.authCode" maxlength="4" placeholder="验证码">
                  <ClientOnly>
                    <img
                      v-if="authCodeUrl && !authCodeLoadError"
                      class="rounded-sm h-10 cursor-pointer select-none"
                      :src="authCodeUrl"
                      alt="验证码"
                      @click="changeAuthCodeDebounced"
                      @error="authCodeLoadError = true"
                    >
                    <button
                      v-else
                      type="button"
                      class="btn btn-ghost btn-xs h-10 min-h-10 px-2 opacity-80"
                      @click="changeAuthCodeDebounced"
                    >
                      点击获取
                    </button>
                  </ClientOnly>
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
                  <input
                    v-model="form.password"
                    type="password"
                    maxlength="16"
                    placeholder="密码"
                  >
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
                  v-if="loginType === 'account'"
                  class="link text-xs text-gray-600 hover:text-gray-500"
                  @click="loginType = 'email'"
                >邮箱登录</div>
                <div
                  v-else
                  class="link text-xs text-gray-600 hover:text-gray-500"
                  @click="loginType = 'account'"
                >账号登录</div>
              </label>
            </div>
            <button
              type="button"
              class="btn bg-black btn-circle text-white border-black block w-full"
              @click="githubLogin"
            >
              <span v-if="githubLoginLoading" class="loading loading-spinner" />
              <xia-icon icon="blog-github" width="40px" height="40px" />
              Login with GitHub
            </button>
            <div class="form-control mt-2">
              <InShimmerButton
                type="submit"
                class="shadow-2xl btn-block text-gray-300 hover:text-gray-100 dark:from-white dark:to-slate-900/10"
                shimmer-size="2px"
              >
                <span
                  class="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg dark:from-white dark:to-slate-900/10"
                >
                  <span class="pr-16">登</span>录
                </span>
              </InShimmerButton>
            </div>
          </form>
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
