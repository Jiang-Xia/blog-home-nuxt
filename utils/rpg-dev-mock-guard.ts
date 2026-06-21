/**
 * RPG 本地挡板可用范围：
 * - 开发环境：任意页面
 * - 生产环境：仅 /tool/test（线上联调）
 */
export function canUseRpgDevMock(): boolean {
  if (!import.meta.client) return false;
  if (import.meta.dev) return true;
  const route = useRoute();
  return route.path.startsWith('/tool/test');
}
