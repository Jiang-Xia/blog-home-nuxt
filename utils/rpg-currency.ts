/** 大额钻石增加时展示飞入特效的阈值 */
export const CURRENCY_GAIN_FX_THRESHOLD = 50;

/** C 端展示用：隐藏运营/补单文案（如 Admin「支付补钻 RG…」） */
export function formatRpgCurrencyReasonLabel(reason?: string, reasonLabel?: string): string {
  const raw = (reasonLabel || reason || '').trim();
  if (!raw) return '钻石奖励';
  if (raw.startsWith('支付补钻') || raw.includes('支付补钻')) return '充值';
  if (raw === 'admin_recharge' || raw === '管理员充值') return '充值';
  if (raw === 'recharge' || raw === '充值') return '充值';
  return raw;
}

/** 是否应展示钻石飞入庆祝特效（仅正向大额） */
export function shouldShowCurrencyGainFx(delta: number): boolean {
  return delta >= CURRENCY_GAIN_FX_THRESHOLD;
}
