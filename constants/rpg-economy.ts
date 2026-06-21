/** 充值汇率说明（1 元 = 100 钻石） */
export const RPG_RECHARGE_RATE = 100;
export const RPG_RECHARGE_RATE_TEXT = '1 元 = 100 钻石';

/** 快捷充值面额（元） */
export const RPG_RECHARGE_AMOUNT_OPTIONS = [1, 5, 10, 50] as const;

/** 自定义充值范围（元，最少 0.01，最多两位小数） */
export const RPG_RECHARGE_MIN_YUAN = 0.01;
export const RPG_RECHARGE_MAX_YUAN = 200;

/** 充值金额归一化到分 */
export function normalizeRechargeYuan(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** 解析自定义充值输入 */
export function parseRechargeYuanInput(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const text = String(raw).trim();
  if (!text || !/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const parsed = Number.parseFloat(text);
  if (!Number.isFinite(parsed)) return null;
  return normalizeRechargeYuan(parsed);
}

export function isSameRechargeYuan(a: number, b: number): boolean {
  return normalizeRechargeYuan(a) === normalizeRechargeYuan(b);
}

/** 按汇率计算钻石（整数） */
export function calcRechargeDiamonds(amountYuan: number): number {
  return Math.round(normalizeRechargeYuan(amountYuan) * RPG_RECHARGE_RATE);
}

export function isRechargeYuanInRange(amount: number): boolean {
  const normalized = normalizeRechargeYuan(amount);
  return normalized >= RPG_RECHARGE_MIN_YUAN && normalized <= RPG_RECHARGE_MAX_YUAN;
}

/** 默认选中面额（元） */
export const RPG_RECHARGE_DEFAULT_AMOUNT = 5;

/** 支付宝扫码说明 */
export const RPG_RECHARGE_ALIPAY_HINT = '请使用支付宝扫码，进入小程序完成支付';

/** 归档静态充值弹窗底部提示语（RpgRechargeModal，已下线） */
export const RPG_RECHARGE_HINT = '扫码充值之后，站长亲自为您服务';

/** 归档静态充值二维码（RpgRechargeModal 预览用，全站已不走静态码） */
export const RPG_RECHARGE_QR_URL
  = import.meta.env.VITE_NUXT_RPG_RECHARGE_QR_URL
    || 'https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/b207c74929ea4349a7e2328c9a56ad7d-shoukuanma.png';
