/**
 * 延后加载 DaisyUI 非 cyber 主题 CSS（幂等）。
 * 触发：非 cyber 本地主题、打开主题面板预取、切到延后包主题前。
 * 默认 cyber 不主动预取，避免首页多一次 CSS 请求。
 */

/** 首屏 main.css 已内嵌的主题，无需 extra */
export const CRITICAL_THEMES = ['cyber', 'cyber-light'] as const;

let extraThemesPromise: Promise<void> | null = null;
let extraThemesLoaded = false;

/** 是否属于首屏已带的主题 */
export function isCriticalTheme(themeName: string | null | undefined): boolean {
  return CRITICAL_THEMES.includes(themeName as (typeof CRITICAL_THEMES)[number]);
}

/**
 * 确保延后主题 CSS 已注入；可重复调用，只请求一次。
 * 副作用：动态 import themes-extra.css（带构建 hash，可缓存）。
 */
export function ensureExtraThemesCss(): Promise<void> {
  if (!import.meta.client) return Promise.resolve();
  if (extraThemesLoaded) return Promise.resolve();
  if (extraThemesPromise) return extraThemesPromise;

  extraThemesPromise = import('~/assets/css/themes-extra.css')
    .then(() => {
      extraThemesLoaded = true;
    })
    .catch((err) => {
      extraThemesPromise = null;
      console.error('[theme] 加载延后主题 CSS 失败:', err);
      throw err;
    });

  return extraThemesPromise;
}

/** 目标主题若在延后包中，先加载 CSS 再继续 */
export async function ensureThemeCssFor(themeName: string): Promise<void> {
  if (isCriticalTheme(themeName)) return;
  await ensureExtraThemesCss();
}
