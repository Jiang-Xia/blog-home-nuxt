/** 充值汇率说明（1 元 = 100 钻石） */
export const RPG_RECHARGE_RATE_TEXT = '1 元 = 100 钻石';

/** 支付宝扫码说明 */
export const RPG_RECHARGE_ALIPAY_HINT = '支付宝小程序码，请使用支付宝扫码';

/** 充值弹窗底部提示语 */
export const RPG_RECHARGE_HINT = '扫码充值之后，站长亲自为您服务';

/** 充值二维码图片（可通过 VITE_NUXT_RPG_RECHARGE_QR_URL 覆盖） */
export const RPG_RECHARGE_QR_URL
  = import.meta.env.VITE_NUXT_RPG_RECHARGE_QR_URL
    || 'https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/b207c74929ea4349a7e2328c9a56ad7d-shoukuanma.png';
