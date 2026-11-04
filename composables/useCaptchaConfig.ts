/**
 * 人机验证公共类型（home / 组件共用）
 * 进页随机四种；graphic 内嵌，slide/click/rotate 点登录后弹窗；服务端无类型开关
 */

export type CaptchaMode = 'graphic' | 'slide' | 'click' | 'rotate';

/** 登录/注册提交时携带的人机校验字段 */
export type HumanCheckPayload = {
  mode: CaptchaMode;
  authCode?: string;
  captchaId?: string;
  captchaVerification?: string;
};

const MODE_LABEL: Record<CaptchaMode, string> = {
  graphic: '字符验证码',
  slide: '滑动拼图',
  click: '点选形状',
  rotate: '旋转验证',
};

const ALL_MODES: CaptchaMode[] = ['graphic', 'slide', 'click', 'rotate'];

/** 展示用文案 */
export function captchaModeLabel(mode: CaptchaMode): string {
  return MODE_LABEL[mode] || mode;
}

/** 进页随机一种验证方式 */
export function pickRandomCaptchaMode(): CaptchaMode {
  return ALL_MODES[Math.floor(Math.random() * ALL_MODES.length)];
}
