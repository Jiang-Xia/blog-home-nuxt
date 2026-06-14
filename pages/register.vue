<script setup lang="ts">
import { reactive } from 'vue';
import request from '~~/api/request.js';
import { getRegisterAvatars } from '~~/api/index';
import {
  DEFAULT_AVATAR_FALLBACK,
  getRandomAvatar,
  getRandomNickname,
  isPC,
  resolveStaticUrl,
} from '~~/utils/common';
import { messageDanger, messageSuccess } from '~~/utils/toast';
import { debounce } from '~~/utils/index';
import { rsaEncrypt as rsaEncryptUtil } from '~~/utils/jsencrypt';
import { loadRsaScript } from '~/utils/script-loader';
import { shouldRefreshGraphicCaptcha } from '~~/utils/graphic-captcha-error';
import { USERNAME_MAX_LENGTH, validateUsernameForRegister } from '~~/utils/username';

let rsaEncrypt: any;
// 客户端才加载
if (import.meta.client) {
  // 按需加载 RSA 加密脚本
  loadRsaScript().then(() => {
    rsaEncrypt = rsaEncryptUtil;
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
const registerType = ref<'account' | 'email'>('account');

interface formState extends StringKey {
  username: string;
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
  nickname: getRandomNickname(),
  username: '',
  email: '',
  avatar: DEFAULT_AVATAR_FALLBACK,
  authCode: '',
  verificationCode: '',
});
const authCodeUrl = ref('');
const authCodeLoadError = ref(false);
const captchaId = ref('');

const registerAvatarPool = ref<string[]>([]);

const pickRandomAvatar = () => {
  if (!registerAvatarPool.value.length) return;
  form.avatar = getRandomAvatar(registerAvatarPool.value);
};

const pickRandomNickname = () => {
  form.nickname = getRandomNickname();
};

const loadRegisterAvatars = async () => {
  try {
    const { avatars } = await getRegisterAvatars();
    if (!avatars?.length) return;
    registerAvatarPool.value = avatars.map(resolveStaticUrl);
    form.avatar = getRandomAvatar(registerAvatarPool.value);
  }
  catch {
    // 接口失败时保留本地兜底图
  }
};

const onAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img.src.includes(DEFAULT_AVATAR_FALLBACK)) return;
  img.src = DEFAULT_AVATAR_FALLBACK;
  form.avatar = DEFAULT_AVATAR_FALLBACK;
};

if (import.meta.client) {
  void loadRegisterAvatars();
}

/* 注册 */
const okHandle = async () => {
  form.passwordRepeat = form.password;

  const requiredFields
    = registerType.value === 'account'
      ? ['username', 'password', 'nickname', 'authCode']
      : ['email', 'password', 'nickname', 'verificationCode'];

  const msg: StringKey = {
    username: '填写用户名',
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

  if (registerType.value === 'account') {
    const usernameErr = validateUsernameForRegister(form.username);
    if (usernameErr) {
      messageDanger(usernameErr);
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
  if (registerType.value === 'account') {
    params.username = form.username;
    params.authCode = form.authCode;
    params.captchaId = captchaId.value;
  }
  else {
    params.email = form.email;
    params.verificationCode = form.verificationCode;
    url = '/user/email/register';
  }

  try {
    await request.post(url, params);
    messageSuccess('注册成功');
    setTimeout(async () => {
      await navigateTo('/login');
    }, 500);
  }
  catch (err: any) {
    if (registerType.value === 'account' && shouldRefreshGraphicCaptcha(err?.bizCode)) {
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
              @click="pickRandomAvatar()"
            >
              <div class="rounded-full">
                <img :src="form.avatar" alt="头像" @error="onAvatarError">
              </div>
            </div>
          </div>

          <!-- 账号注册表单 -->
          <template v-if="registerType === 'account'">
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
                <span class="login-label-text">昵称</span>
              </label>
              <label class="login-input input">
                <xia-icon icon="blog-yonghuming" />
                <input
                  v-model="form.nickname"
                  type="text"
                  maxlength="6"
                  placeholder="昵称（最多6字）"
                >
                <button
                  type="button"
                  class="nickname-switch-btn"
                  title="随机昵称"
                  @click="pickRandomNickname"
                >
                  换一换
                </button>
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
                <input
                  v-model="form.nickname"
                  type="text"
                  maxlength="6"
                  placeholder="昵称（最多6字）"
                >
                <button
                  type="button"
                  class="nickname-switch-btn"
                  title="随机昵称"
                  @click="pickRandomNickname"
                >
                  换一换
                </button>
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
                v-if="registerType === 'account'"
                class="link text-xs text-gray-600 hover:text-gray-500"
                @click="registerType = 'email'"
              >邮箱注册</div>
              <div
                v-else
                class="link text-xs text-gray-600 hover:text-gray-500"
                @click="registerType = 'account'"
              >账号注册
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

  .nickname-switch-btn {
    flex-shrink: 0;
    height: 2.5rem;
    min-height: 2.5rem;
    padding: 0 0.5rem;
    border: none;
    background: transparent;
    color: rgb(156 163 175);
    font-size: 0.75rem;
    line-height: 1rem;
    opacity: 0.8;
    cursor: pointer;

    &:hover,
    &:focus,
    &:active {
      background: transparent;
      color: rgb(156 163 175);
      opacity: 0.8;
      outline: none;
      box-shadow: none;
    }
  }
</style>
