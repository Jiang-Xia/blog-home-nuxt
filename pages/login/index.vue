<script setup lang="ts">
/**
   * 登录页
   * - 账号/邮箱登录；成功后 resolveRedirectPath 回跳（防 open redirect）
   */
import { reactive } from 'vue';
import request from '~~/api/request.js';
import { messageDanger, messageSuccess, messageInfo } from '~~/utils/toast';
import { debounce } from '~~/utils/index';
import { baseUrl } from '~~/config';
import { isPC } from '~/utils/common';
import { setToken, TokenKey, RefreshTokenKey } from '@/utils/cookie';
import { rsaEncrypt as rsaEncryptUtil } from '~~/utils/jsencrypt';
import { loadRsaScript } from '~/utils/script-loader';
import { shouldRefreshGraphicCaptcha } from '~~/utils/graphic-captcha-error';
import {
  createEmailVerificationCodeInputBinding,
  createGraphicCaptchaInputBinding,
  emailVerificationCodeNativeInputAttrs,
  graphicCaptchaNativeInputAttrs,
} from '~~/utils/captcha-input';
import { LOGIN_ACCOUNT_MAX_LENGTH, validateUsernameForLogin } from '~~/utils/username';

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
const route = useRoute();
const submitting = ref(false);

const persistLoginTokens = (accessToken: string, refreshToken: string) => {
  token.value = accessToken;
  setToken(TokenKey, accessToken);
  setToken(RefreshTokenKey, refreshToken, '', 7);
};

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
const graphicCaptchaInput = createGraphicCaptchaInputBinding(
  () => form.authCode,
  (value) => {
    form.authCode = value;
  },
);
const emailVerificationCodeInput = createEmailVerificationCodeInputBinding(
  () => form.verificationCode,
  (value) => {
    form.verificationCode = value;
  },
);
  /* 登录 */
const okHandle = async () => {
  if (submitting.value) {
    return;
  }
  const requiredFields
    = loginType.value === 'account'
      ? ['username', 'password', 'authCode']
      : ['email', 'verificationCode'];

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

  submitting.value = true;
  try {
    let url = '/user/login';
    const params: any = { loginType: loginType.value };
    if (loginType.value === 'account') {
      params.username = form.username;
      params.password = rsaEncrypt(form.password);
      params.authCode = form.authCode;
      params.captchaId = captchaId.value;
    }
    else {
      params.email = form.email;
      params.verificationCode = form.verificationCode;
      url = '/user/email/login';
    }

    res = await request.post(url, params);
    persistLoginTokens(res.info.accessToken, res.info.refreshToken);
    await refreshUserInfo();
    void useRpgAudio().playSfx('uiClick');
    messageSuccess('登录成功');
    await navigateTo(resolveRedirectPath(route.query.redirect as string));
  }
  catch (err: any) {
    console.error(err);
    if (loginType.value === 'account' && shouldRefreshGraphicCaptcha(err?.bizCode)) {
      form.authCode = '';
      captchaId.value = '';
      void changeAuthCode();
    }
  }
  finally {
    submitting.value = false;
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
const oauthTicketLoading = ref(false);

const exchangeOAuthTicket = async (ticket: string) => {
  oauthTicketLoading.value = true;
  messageInfo('正在完成登录...', 3000);
  try {
    const res: any = await request.post('/user/auth/ticket/exchange', { ticket });
    persistLoginTokens(res.info.accessToken, res.info.refreshToken);
    await refreshUserInfo();
    void useRpgAudio().playSfx('uiClick');
    messageSuccess('登录成功');
    history.replaceState({}, '', route.path);
    await navigateTo(resolveRedirectPath(route.query.redirect as string));
  }
  catch {
    messageDanger('登录凭证无效或已过期，请重新登录');
    history.replaceState({}, '', route.path);
  }
  finally {
    oauthTicketLoading.value = false;
  }
};

if (import.meta.client) {
  if (isPC()) {
    isPcClient.value = true;
  }
  const query: any = route.query;
  if (query.accessToken || query.refreshToken) {
    messageDanger('检测到 URL 携带敏感登录信息，已拦截。请重新通过授权流程登录。');
    history.replaceState({}, '', route.path);
  }
  else if (query.ticket) {
    void exchangeOAuthTicket(String(query.ticket));
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
  <CyberPageContainer
    label="LOGIN"
    title="欢迎登录"
    subtitle="登录后即可发表文章与评论"
    max-width="max-w-sm"
  >
    <CyberCard v-if="oauthTicketLoading" class="py-8 text-center">
      <span class="loading loading-spinner loading-lg text-primary" />
      <p class="mt-4 text-sm text-tech-muted">
        正在完成 GitHub 登录...
      </p>
    </CyberCard>
    <CyberCard v-else class="!p-6 md:!p-8">
      <form autocomplete="off" class="space-y-4" @submit.prevent="okHandle">
        <!-- 阻止浏览器自动填充 -->
        <input
          type="text"
          name="prevent_autofill"
          tabindex="-1"
          autocomplete="off"
          class="hidden"
          aria-hidden="true"
        >
        <input
          type="password"
          name="prevent_autofill_pw"
          tabindex="-1"
          autocomplete="new-password"
          class="hidden"
          aria-hidden="true"
        >
        <template v-if="loginType === 'account'">
          <div class="form-control">
            <label class="login-label">
              <span class="login-label-text">用户名 / 邮箱 / 手机号</span>
            </label>
            <label class="login-input input">
              <xia-icon icon="blog-shoujihao" />
              <input
                v-model="form.username"
                type="text"
                name="login_username"
                autocomplete="off"
                :maxlength="LOGIN_ACCOUNT_MAX_LENGTH"
                placeholder="用户名 / 邮箱 / 手机号"
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
                name="login_password"
                autocomplete="new-password"
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
              <input
                :value="form.authCode"
                name="login_auth_code"
                placeholder="验证码"
                v-bind="graphicCaptchaNativeInputAttrs"
                v-on="graphicCaptchaInput"
              >
              <ClientOnly>
                <img
                  v-if="authCodeUrl && !authCodeLoadError"
                  class="h-8 cursor-pointer rounded select-none"
                  :src="authCodeUrl"
                  alt="验证码"
                  @click="changeAuthCodeDebounced"
                  @error="authCodeLoadError = true"
                >
                <button
                  v-else
                  type="button"
                  class="btn btn-ghost btn-xs opacity-80"
                  @click="changeAuthCodeDebounced"
                >
                  点击获取
                </button>
              </ClientOnly>
            </label>
          </div>
        </template>

        <template v-else>
          <div class="form-control">
            <label class="login-label">
              <span class="login-label-text">邮箱</span>
            </label>
            <label class="login-input input">
              <xia-icon icon="blog-youxiang" />
              <input
                v-model="form.email"
                type="email"
                name="login_email"
                autocomplete="off"
                placeholder="邮箱地址"
              >
            </label>
          </div>
          <div class="form-control">
            <label class="login-label">
              <span class="login-label-text">邮箱验证码</span>
            </label>
            <label class="login-input input">
              <xia-icon icon="blog-yanzhengma" />
              <input
                :value="form.verificationCode"
                name="login_verification_code"
                placeholder="邮箱验证码"
                v-bind="emailVerificationCodeNativeInputAttrs"
                v-on="emailVerificationCodeInput"
              >
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

        <div class="flex justify-between items-center gap-3 text-sm">
          <p class="m-0 text-base-content/75">
            还没有账号？
            <NuxtLink to="/register" class="font-semibold text-primary hover:underline">
              去注册
            </NuxtLink>
          </p>
          <NuxtLink to="/" class="text-xs text-tech-muted hover:text-primary shrink-0">返回首页</NuxtLink>
        </div>
        <div class="text-xs text-center">
          <button
            type="button"
            class="text-tech-muted hover:text-primary"
            @click="loginType = loginType === 'account' ? 'email' : 'account'"
          >
            {{ loginType === 'account' ? '邮箱登录' : '账号登录' }}
          </button>
        </div>

        <CyberButton type="button" variant="secondary" class="w-full" @click="githubLogin">
          <span v-if="githubLoginLoading" class="loading loading-spinner" />
          <xia-icon icon="blog-github" width="24px" height="24px" />
          Login with GitHub
        </CyberButton>

        <CyberButton type="submit" variant="primary" class="w-full" :disabled="submitting">
          <span v-if="submitting" class="loading loading-spinner loading-sm" />
          {{ submitting ? '登录中...' : '登录' }}
        </CyberButton>
      </form>
    </CyberCard>
  </CyberPageContainer>
</template>
