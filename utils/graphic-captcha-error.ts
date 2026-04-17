/** 与后端约定：图形验证码需要自动刷新的业务码 */
export const GRAPHIC_CAPTCHA_REFRESH_BIZ_CODE = 10001;

export function shouldRefreshGraphicCaptcha(bizCode: number | string | undefined): boolean {
  return Number(bizCode) === GRAPHIC_CAPTCHA_REFRESH_BIZ_CODE;
}
