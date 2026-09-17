/**
 * 关于页赞赏金额与文案常量（与后端 site-tip 对齐；流水展示名由 API 下发）
 */

/** 快捷赞赏面额（元） */
export const SITE_TIP_AMOUNT_OPTIONS = [6.66, 16.66, 26.66, 66.66] as const;

/** 默认选中面额（元） */
export const SITE_TIP_DEFAULT_AMOUNT = 6.66;

/** 自定义赞赏范围（元，下限与支付宝最小金额一致） */
export const SITE_TIP_MIN_YUAN = 0.01;
export const SITE_TIP_MAX_YUAN = 200;

/** 展示名最大长度（与后端一致） */
export const SITE_TIP_DISPLAY_NAME_MAX = 16;

/** 未登录默认展示名 */
export const SITE_TIP_ANONYMOUS_NAME = '匿名用户';

/** 留言最大长度（与后端一致） */
export const SITE_TIP_MESSAGE_MAX = 40;

/** 留言默认文案 */
export const SITE_TIP_DEFAULT_MESSAGE = '请作者喝杯咖啡！';

/** 面板标题 */
export const SITE_TIP_TITLE = '请作者喝咖啡';

/** 支付宝扫码说明 */
export const SITE_TIP_ALIPAY_HINT = '请使用支付宝扫码，进入小程序完成支付';

/** 赞赏金额归一化到分 */
export function normalizeTipYuan(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** 解析自定义赞赏输入 */
export function parseTipYuanInput(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const text = String(raw).trim();
  if (!text || !/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const parsed = Number.parseFloat(text);
  if (!Number.isFinite(parsed)) return null;
  return normalizeTipYuan(parsed);
}

/** 金额是否在允许范围内 */
export function isTipYuanInRange(amount: number): boolean {
  const normalized = normalizeTipYuan(amount);
  return normalized >= SITE_TIP_MIN_YUAN && normalized <= SITE_TIP_MAX_YUAN;
}

/** 金额比较（分精度） */
export function isSameTipYuan(a: number, b: number): boolean {
  return normalizeTipYuan(a) === normalizeTipYuan(b);
}
