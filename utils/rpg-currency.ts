/** 大额钻石增加时展示飞入特效的阈值 */
export const CURRENCY_GAIN_FX_THRESHOLD = 50;

/** 是否应展示钻石飞入庆祝特效（仅正向大额） */
export function shouldShowCurrencyGainFx(delta: number): boolean {
  return delta >= CURRENCY_GAIN_FX_THRESHOLD;
}
