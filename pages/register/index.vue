<script setup lang="ts">
/**
   * 注册页
   * - 账号/邮箱注册；账号侧人机同登录（进页随机；graphic 内嵌，slide/click/rotate 点注册后弹窗）
   */
import { reactive } from 'vue';
import request from '~~/api/request.js';
import { getRegisterAvatars } from '~~/api/index';
import { uploadRegisterAvatar, parseUploadedUrl } from '~~/api/resources';
import {
  DEFAULT_AVATAR_FALLBACK,
  getRandomAvatar,
  getRandomNickname,
  isPC,
} from '~~/utils/common';
import { resolveStaticUrl } from '~~/utils/static-url';
import { messageDanger, messageSuccess } from '~~/utils/toast';
import { rsaEncrypt as rsaEncryptUtil } from '~~/utils/jsencrypt';
import { loadRsaScript } from '~/utils/script-loader';
import { shouldRefreshGraphicCaptcha } from '~~/utils/graphic-captcha-error';
import {
  createEmailVerificationCodeInputBinding,
  emailVerificationCodeNativeInputAttrs,
} from '~~/utils/captcha-input';
import { USERNAME_MAX_LENGTH, validateUsernameForRegister } from '~~/utils/username';
import type { HumanCheckPayload } from '~~/composables/useCaptchaConfig';

let rsaEncrypt: any;
// 客户端才加载
if (import.meta.client) {
  // 按需加载 RSA 加密脚本
  loadRsaScript().then(() => {
    rsaEncrypt = rsaEncryptUtil;
  });
}
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
  verificationCode: string;
}
const form: formState = reactive({
  password: '',
  passwordRepeat: '',
  nickname: getRandomNickname(),
  username: '',
  email: '',
  avatar: DEFAULT_AVATAR_FALLBACK,
  verificationCode: '',
});
const emailVerificationCodeInput = createEmailVerificationCodeInputBinding(
  () => form.verificationCode,
  (value) => {
    form.verificationCode = value;
  },
);
const humanCheckRef = ref<{
  ensureReady: () => Promise<HumanCheckPayload | null>;
  reset: () => Promise<void>;
} | null>(null);
const submitting = ref(false);

const registerAvatarPool = ref<string[]>([]);
const avatarUploading = ref(false);

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

const onAvatarFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  avatarUploading.value = true;
  try {
    const res = await uploadRegisterAvatar(file, form.avatar);
    form.avatar = parseUploadedUrl(res);
  }
  catch (err: any) {
    console.log(err);
    messageDanger('头像上传失败');
  }
  finally {
    avatarUploading.value = false;
    input.value = '';
  }
};

if (import.meta.client) {
  void loadRegisterAvatars();
}

/* 注册 */
const okHandle = async () => {
  if (submitting.value) {
    return;
  }
  form.passwordRepeat = form.password;

  const requiredFields
    = registerType.value === 'account'
      ? ['username', 'password', 'nickname']
      : ['email', 'password', 'nickname', 'verificationCode'];

  const msg: StringKey = {
    username: '填写用户名',
    email: '填写邮箱',
    password: '填写密码',
    nickname: '填写昵称',
    verificationCode: '填写邮箱验证码',
  };

  for (const key of requiredFields) {
    if (!form[key]) {
      messageDanger(msg[key] as string);
      return;
    }
  }

  let humanPayload: HumanCheckPayload | null = null;
  if (registerType.value === 'account') {
    const usernameErr = validateUsernameForRegister(form.username);
    if (usernameErr) {
      messageDanger(usernameErr);
      return;
    }
    // slide/click：此处弹窗；取消则中断注册
    humanPayload = (await humanCheckRef.value?.ensureReady()) || null;
    if (!humanPayload) {
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
    if (humanPayload?.captchaVerification) {
      params.captchaVerification = humanPayload.captchaVerification;
    }
    else {
      params.authCode = humanPayload?.authCode;
      params.captchaId = humanPayload?.captchaId;
    }
  }
  else {
    params.email = form.email;
    params.verificationCode = form.verificationCode;
    url = '/user/email/register';
  }

  try {
    submitting.value = true;
    await request.post(url, params);
    void useRpgAudio().playSfx('uiClick');
    messageSuccess('注册成功');
    setTimeout(async () => {
      await navigateTo('/login');
    }, 500);
  }
  catch (err: any) {
    if (registerType.value === 'account' && shouldRefreshGraphicCaptcha(err?.bizCode)) {
      void humanCheckRef.value?.reset();
    }
  }
  finally {
    submitting.value = false;
  }
};

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
  <CyberPageContainer
    label="REGISTER"
    title="欢迎注册"
    subtitle="创建账号，加入本站"
    max-width="max-w-sm"
  >
    <CyberCard class="!p-6 md:!p-8">
      <div class="mb-4 flex items-center justify-end gap-2">
        <div
          class="avatar btn btn-ghost btn-circle btn-sm relative"
          title="点击切换随机头像"
          @click="pickRandomAvatar()"
        >
          <div class="rounded-full">
            <img :src="form.avatar" alt="头像" @error="onAvatarError">
            <span
              v-if="avatarUploading"
              class="absolute inset-0 flex items-center justify-center rounded-full bg-base-100/70"
            >
              <span class="loading loading-spinner loading-xs" />
            </span>
          </div>
        </div>
        <label class="btn btn-ghost btn-xs h-7 min-h-0">
          上传头像
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            :disabled="avatarUploading"
            @change="onAvatarFileChange"
          >
        </label>
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
        <CaptchaAccountHumanCheck ref="humanCheckRef" />
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
            <input
              :value="form.verificationCode"
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
          已有账号？
          <NuxtLink to="/login" class="font-semibold text-primary hover:underline">
            去登录
          </NuxtLink>
        </p>
        <NuxtLink to="/" class="text-xs text-tech-muted hover:text-primary shrink-0">返回首页</NuxtLink>
      </div>
      <div class="text-xs text-center">
        <button
          v-if="registerType === 'account'"
          type="button"
          class="text-tech-muted hover:text-primary"
          @click="registerType = 'email'"
        >
          邮箱注册
        </button>
        <button
          v-else
          type="button"
          class="text-tech-muted hover:text-primary"
          @click="registerType = 'account'"
        >
          账号注册
        </button>
      </div>
      <CyberButton
        type="button"
        variant="primary"
        class="mt-4 w-full"
        :disabled="submitting"
        @click="okHandle"
      >
        <span v-if="submitting" class="loading loading-spinner loading-sm" />
        {{ submitting ? '注册中...' : '注册' }}
      </CyberButton>
    </CyberCard>
  </CyberPageContainer>
</template>

<style lang="less" scoped>
  .nickname-switch-btn {
    flex-shrink: 0;
    height: 2.5rem;
    min-height: 2.5rem;
    padding: 0 0.5rem;
    border: none;
    background: transparent;
    color: var(--tech-fg-subtle);
    font-size: 0.75rem;
    line-height: 1rem;
    opacity: 0.8;
    cursor: pointer;

    &:hover,
    &:focus,
    &:active {
      background: transparent;
      color: var(--tech-section-label);
      opacity: 1;
      outline: none;
      box-shadow: none;
    }
  }
</style>
