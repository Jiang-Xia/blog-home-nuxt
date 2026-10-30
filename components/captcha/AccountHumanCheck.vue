<script setup lang="ts">
/**
   * 账号登录/注册人机验证区
   * - 进页随机 graphic / slide / click / rotate（与 admin 一致）
   * - graphic：表单内嵌字符图，提交前直接取值
   * - slide / click / rotate：表单不展示；点登录后弹窗完成，拿到 captchaVerification
   * - 底图/拼图为 Nest 官方示例素材
   */
import { Slide, Click, Rotate } from 'go-captcha-vue';
import 'go-captcha-vue/dist/style.css';
import request from '~~/api/request.js';
import { messageDanger } from '~~/utils/toast';
import { debounce } from '~~/utils/index';
import {
  createGraphicCaptchaInputBinding,
  graphicCaptchaNativeInputAttrs,
} from '~~/utils/captcha-input';
import {
  captchaModeLabel,
  pickRandomCaptchaMode,
  type CaptchaMode,
  type HumanCheckPayload,
} from '~~/composables/useCaptchaConfig';

type BehaviorType = 'slide' | 'click' | 'rotate';

const mode = ref<CaptchaMode>('graphic');
const authCode = ref('');
const captchaId = ref('');
const authCodeUrl = ref('');
const authCodeLoadError = ref(false);
const captchaVerification = ref('');
const loadingBehavior = ref(false);
const modalVisible = ref(false);

const slideData = ref<{
  thumbX: number;
  thumbY: number;
  thumbWidth: number;
  thumbHeight: number;
  image: string;
  thumb: string;
} | null>(null);
const clickData = ref<{ image: string; thumb: string } | null>(null);
const rotateData = ref<{
  angle: number;
  image: string;
  thumb: string;
  thumbSize: number;
} | null>(null);
const behaviorCaptchaId = ref('');

/** 弹窗等待 resolve：完成验证或关闭 */
let modalResolve: ((payload: HumanCheckPayload | null) => void) | null = null;

const graphicCaptchaInput = createGraphicCaptchaInputBinding(
  () => authCode.value,
  (value) => {
    authCode.value = value;
  },
);

const isBehaviorMode = computed(
  () => mode.value === 'slide' || mode.value === 'click' || mode.value === 'rotate',
);

/** 字符图形验证码（仅 graphic 模式） */
async function loadGraphic() {
  try {
    const res = await request.get('/user/authCode', { t: Date.now() });
    if (!res?.captchaBase64) {
      throw new Error('captcha payload missing captchaBase64');
    }
    authCodeUrl.value = `data:image/svg+xml;base64,${res.captchaBase64}`;
    captchaId.value = res.captchaId || '';
    authCode.value = '';
    authCodeLoadError.value = false;
  }
  catch (err) {
    console.error('[AccountHumanCheck] graphic failed', err);
    authCodeUrl.value = '';
    captchaId.value = '';
    authCodeLoadError.value = true;
  }
}

const loadGraphicDebounced = debounce(() => {
  void loadGraphic();
}, 300);

function clearBehaviorData() {
  slideData.value = null;
  clickData.value = null;
  rotateData.value = null;
}

/** 行为挑战图（仅弹窗打开时拉取） */
async function loadBehavior(type: BehaviorType) {
  loadingBehavior.value = true;
  clearBehaviorData();
  behaviorCaptchaId.value = '';
  captchaVerification.value = '';
  try {
    const res = await request.post('/captcha/behavior/get', { type });
    behaviorCaptchaId.value = res.captchaId || '';
    if (type === 'slide') {
      slideData.value = {
        thumbX: res.thumbX,
        thumbY: res.thumbY,
        thumbWidth: res.thumbWidth,
        thumbHeight: res.thumbHeight,
        image: res.image,
        thumb: res.thumb,
      };
    }
    else if (type === 'click') {
      clickData.value = { image: res.image, thumb: res.thumb };
    }
    else {
      rotateData.value = {
        angle: res.angle ?? 0,
        image: res.image,
        thumb: res.thumb,
        thumbSize: res.thumbSize ?? 0,
      };
    }
  }
  catch (err) {
    console.error('[AccountHumanCheck] behavior get failed', err);
  }
  finally {
    loadingBehavior.value = false;
  }
}

/** 关闭弹窗并回传结果（取消为 null） */
function settleModal(payload: HumanCheckPayload | null) {
  modalVisible.value = false;
  clearBehaviorData();
  const resolve = modalResolve;
  modalResolve = null;
  resolve?.(payload);
}

/** 滑动确认 */
async function onSlideConfirm(point: { x: number; y: number }, reset: () => void) {
  try {
    const res = await request.post('/captcha/behavior/check', {
      captchaId: behaviorCaptchaId.value,
      type: 'slide',
      point,
    });
    const token = res.captchaVerification || '';
    if (!token) {
      reset();
      await loadBehavior('slide');
      return;
    }
    captchaVerification.value = token;
    settleModal({ mode: 'slide', captchaVerification: token });
  }
  catch {
    reset();
    await loadBehavior('slide');
  }
}

/** 点选确认 */
async function onClickConfirm(dots: Array<{ x: number; y: number }>, reset: () => void) {
  try {
    const res = await request.post('/captcha/behavior/check', {
      captchaId: behaviorCaptchaId.value,
      type: 'click',
      points: dots.map(d => ({ x: d.x, y: d.y })),
    });
    const token = res.captchaVerification || '';
    if (!token) {
      reset();
      await loadBehavior('click');
      return;
    }
    captchaVerification.value = token;
    settleModal({ mode: 'click', captchaVerification: token });
  }
  catch {
    reset();
    await loadBehavior('click');
  }
}

/** 旋转确认 */
async function onRotateConfirm(angle: number, reset: () => void) {
  try {
    const res = await request.post('/captcha/behavior/check', {
      captchaId: behaviorCaptchaId.value,
      type: 'rotate',
      angle,
    });
    const token = res.captchaVerification || '';
    if (!token) {
      reset();
      await loadBehavior('rotate');
      return;
    }
    captchaVerification.value = token;
    settleModal({ mode: 'rotate', captchaVerification: token });
  }
  catch {
    reset();
    await loadBehavior('rotate');
  }
}

/**
   * 登录/注册提交前调用：graphic 直接返回；行为类弹窗完成后再返回。
   */
async function ensureReady(): Promise<HumanCheckPayload | null> {
  if (mode.value === 'graphic') {
    if (!authCode.value.trim()) {
      messageDanger('填写验证码');
      return null;
    }
    return {
      mode: 'graphic',
      authCode: authCode.value.trim(),
      captchaId: captchaId.value,
    };
  }

  captchaVerification.value = '';
  return new Promise((resolve) => {
    modalResolve = resolve;
    modalVisible.value = true;
    void loadBehavior(mode.value);
  });
}

/** 兼容旧调用名 */
function getSubmitPayload(): HumanCheckPayload | null {
  if (mode.value === 'graphic') {
    if (!authCode.value.trim()) {
      messageDanger('填写验证码');
      return null;
    }
    return {
      mode: 'graphic',
      authCode: authCode.value.trim(),
      captchaId: captchaId.value,
    };
  }
  if (!captchaVerification.value) {
    messageDanger(`请完成${captchaModeLabel(mode.value)}`);
    return null;
  }
  return {
    mode: mode.value,
    captchaVerification: captchaVerification.value,
  };
}

/** 登录失败后刷新：graphic 重拉图；行为模式清空 token，下次登录再弹窗 */
async function reset() {
  authCode.value = '';
  captchaVerification.value = '';
  if (mode.value === 'graphic') {
    await loadGraphic();
  }
  else {
    clearBehaviorData();
  }
}

function onModalClose() {
  settleModal(null);
}

defineExpose({ ensureReady, getSubmitPayload, reset });

onMounted(() => {
  mode.value = pickRandomCaptchaMode();
  if (mode.value === 'graphic') {
    void loadGraphic();
  }
});
</script>

<template>
  <div class="account-human-check">
    <!-- 仅 graphic 在表单内展示字符图 -->
    <div v-if="mode === 'graphic'" class="form-control">
      <label class="login-label">
        <span class="login-label-text">验证码</span>
      </label>
      <label class="login-input input">
        <xia-icon icon="blog-yanzhengma" />
        <input
          :value="authCode"
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
            @click="loadGraphicDebounced"
            @error="authCodeLoadError = true"
          >
          <button
            v-else
            type="button"
            class="btn btn-ghost btn-xs opacity-80"
            @click="loadGraphicDebounced"
          >
            点击获取
          </button>
        </ClientOnly>
      </label>
    </div>

    <!-- 滑动/点选/旋转：登录后弹窗 -->
    <ClientOnly>
      <Teleport to="body">
        <div
          v-if="modalVisible && isBehaviorMode"
          class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
          @click.self="onModalClose"
        >
          <div
            class="w-full max-w-[400px] rounded-xl bg-base-100 p-4 shadow-xl"
            role="dialog"
            aria-modal="true"
            :aria-label="captchaModeLabel(mode)"
          >
            <div class="mb-3 flex items-center justify-between gap-2">
              <span class="font-medium">{{ captchaModeLabel(mode) }}</span>
              <button type="button" class="btn btn-ghost btn-xs" @click="onModalClose">
                关闭
              </button>
            </div>
            <div class="flex min-h-[180px] justify-center">
              <div
                v-if="loadingBehavior"
                class="flex h-40 items-center justify-center text-sm text-tech-muted"
              >
                加载中…
              </div>
              <Slide
                v-else-if="mode === 'slide' && slideData"
                :data="slideData"
                :events="{
                  confirm: onSlideConfirm,
                  refresh: () => loadBehavior('slide'),
                  close: onModalClose,
                }"
              />
              <Click
                v-else-if="mode === 'click' && clickData"
                :data="clickData"
                :events="{
                  confirm: onClickConfirm,
                  refresh: () => loadBehavior('click'),
                  close: onModalClose,
                }"
              />
              <Rotate
                v-else-if="mode === 'rotate' && rotateData"
                :data="rotateData"
                :events="{
                  confirm: onRotateConfirm,
                  refresh: () => loadBehavior('rotate'),
                  close: onModalClose,
                }"
              />
              <button
                v-else
                type="button"
                class="btn btn-ghost btn-sm"
                @click="loadBehavior(mode as BehaviorType)"
              >
                重新获取验证
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </ClientOnly>
  </div>
</template>
