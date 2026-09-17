/**
 * 网关耗时日志：仅开发环境输出。
 */

/** 开发环境打印 `[gateway-crypto] label Xms` */
export function logTiming(label: string, ms: number): void {
  if (import.meta.dev) {
    console.log(`[gateway-crypto] ${label} ${ms}ms`);
  }
}

/** 以 startedAt 计算耗时并打印 */
export function logTimingSince(label: string, startedAt: number): void {
  logTiming(label, Date.now() - startedAt);
}
