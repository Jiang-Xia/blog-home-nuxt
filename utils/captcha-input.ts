/** 图形验证码长度（与 blog-server captcha.service size 一致） */
export const GRAPHIC_CAPTCHA_LENGTH = 4;

/** 邮箱验证码长度（与 blog-server email.service 一致） */
export const EMAIL_VERIFICATION_CODE_LENGTH = 6;

export type CaptchaNativeInputAttrs = Record<string, string | number | boolean>;

/** 原生 input / Arco input-attrs：图形验证码 */
export const graphicCaptchaNativeInputAttrs: CaptchaNativeInputAttrs = {
  type: 'text',
  maxlength: GRAPHIC_CAPTCHA_LENGTH,
  inputmode: 'text',
  autocomplete: 'off',
  autocapitalize: 'characters',
  autocorrect: 'off',
  spellcheck: false,
  pattern: '[A-Za-z0-9]*',
  enterkeyhint: 'done',
};

/** 原生 input / Arco input-attrs：邮箱验证码 */
export const emailVerificationCodeNativeInputAttrs: CaptchaNativeInputAttrs = {
  type: 'text',
  maxlength: EMAIL_VERIFICATION_CODE_LENGTH,
  inputmode: 'numeric',
  autocomplete: 'one-time-code',
  autocapitalize: 'off',
  autocorrect: 'off',
  spellcheck: false,
  pattern: '[0-9]*',
  enterkeyhint: 'done',
};

/** 图形验证码字符集与 blog-server captcha.service charPreset 一致 */
export function sanitizeGraphicCaptchaInput(value: string): string {
  return String(value || '')
    .replace(/[^0-9a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, GRAPHIC_CAPTCHA_LENGTH);
}

/** 邮箱验证码：服务端固定 6 位纯数字 */
export function sanitizeEmailVerificationCodeInput(value: string): string {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, EMAIL_VERIFICATION_CODE_LENGTH);
}

export interface CaptchaInputBinding {
  input: (event: Event) => void;
  compositionstart: () => void;
  compositionend: (event: Event) => void;
  paste: (event: ClipboardEvent) => void;
}

function createCaptchaInputBinding(
  getValue: () => string,
  setValue: (value: string) => void,
  sanitize: (value: string) => string,
): CaptchaInputBinding {
  let composing = false;

  const apply = (target: HTMLInputElement, raw: string) => {
    const next = sanitize(raw);
    if (target.value !== next) {
      target.value = next;
    }
    if (getValue() !== next) {
      setValue(next);
    }
  };

  return {
    compositionstart: () => {
      composing = true;
    },
    compositionend: (event: Event) => {
      composing = false;
      apply(event.target as HTMLInputElement, (event.target as HTMLInputElement).value);
    },
    input: (event: Event) => {
      if (composing) {
        return;
      }
      apply(event.target as HTMLInputElement, (event.target as HTMLInputElement).value);
    },
    paste: (event: ClipboardEvent) => {
      event.preventDefault();
      const target = event.target as HTMLInputElement;
      const pasted = event.clipboardData?.getData('text') ?? '';
      const start = target.selectionStart ?? getValue().length;
      const end = target.selectionEnd ?? getValue().length;
      const merged = getValue().slice(0, start) + pasted + getValue().slice(end);
      apply(target, merged);
    },
  };
}

/** 原生 input：图形验证码事件绑定（配合 :value + v-bind="graphicCaptchaNativeInputAttrs"） */
export function createGraphicCaptchaInputBinding(
  getValue: () => string,
  setValue: (value: string) => void,
): CaptchaInputBinding {
  return createCaptchaInputBinding(getValue, setValue, sanitizeGraphicCaptchaInput);
}

/** 原生 input：邮箱验证码事件绑定（配合 :value + v-bind="emailVerificationCodeNativeInputAttrs"） */
export function createEmailVerificationCodeInputBinding(
  getValue: () => string,
  setValue: (value: string) => void,
): CaptchaInputBinding {
  return createCaptchaInputBinding(getValue, setValue, sanitizeEmailVerificationCodeInput);
}

/** Arco Input / InputSearch：v-model 更新时清洗 */
export function createSanitizedModelUpdater(
  setValue: (value: string) => void,
  sanitize: (value: string) => string,
): (value: string) => void {
  return (value: string) => {
    setValue(sanitize(value));
  };
}

/** Arco Input：watch 兜底（IME 提交、程序赋值等） */
export function watchCaptchaInput(
  source: () => string,
  setValue: (value: string) => void,
  sanitize: (value: string) => string,
  watchFn: (source: () => string, cb: (val: string) => void) => void,
): void {
  watchFn(source, (val) => {
    const next = sanitize(val);
    if (next !== val) {
      setValue(next);
    }
  });
}
