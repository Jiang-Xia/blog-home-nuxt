/**
 * 网关耗时日志：仅开发环境且 VITE_NUXT_GATEWAY_CRYPTO_LOG=true 时输出。
 */

/** 是否打印加解密分步/汇总耗时（生产恒关；开发靠 env 开关） */
function shouldLogGatewayTiming(): boolean {
  return import.meta.dev && import.meta.env.VITE_NUXT_GATEWAY_CRYPTO_LOG === 'true';
}

/** 开发环境打印 `[gateway-crypto] label Xms` */
export function logTiming(label: string, ms: number): void {
  if (shouldLogGatewayTiming()) {
    console.log(`[gateway-crypto] ${label} ${ms}ms`);
  }
}

/** 以 startedAt 计算耗时并打印 */
export function logTimingSince(label: string, startedAt: number): void {
  logTiming(label, Date.now() - startedAt);
}
