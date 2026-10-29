import { useState } from '#app';
import { getRpgTone, isDarkTheme } from '~/constants/theme-tone';
import {
  ensureExtraThemesCss,
  ensureThemeCssFor,
  isCriticalTheme,
} from '~/composables/use-extra-themes-css';
import { applyThemeToDocument } from '~/utils/theme-dom';

export { isDarkTheme, getRpgTone };

// useState 的第一参数为 key，第二参数为初始化的工厂函数(即默认值)
export const TECH_THEMES = ['cyber', 'cyber-light'] as const;
export type TechTheme = (typeof TECH_THEMES)[number];

/** md-editor-v3 仅支持 light / dark，跟随站点 DaisyUI 主题明暗 */
export function useMdEditorTheme() {
  const siteTheme = useTheme();
  return computed((): 'dark' | 'light' => {
    const name = siteTheme.value;
    if (import.meta.client) {
      const scheme = getComputedStyle(document.documentElement).colorScheme;
      if (scheme === 'dark') return 'dark';
      if (scheme === 'light') return 'light';
    }
    return isDarkTheme(name) ? 'dark' : 'light';
  });
}

export const useTheme = () => useState('theme', () => 'cyber');

/** 主题相关逻辑：首屏 cyber 两套内嵌，其余主题 CSS 延后加载 */
export function useThemeActions() {
  const theme = useTheme();
  let mediaMatch: MediaQueryList | null = null;

  /** 写入 DOM / localStorage；延后包主题须先 await ensureThemeCssFor */
  const applyThemeDom = (type: string) => {
    applyThemeToDocument(type);
  };

  /**
   * 设置当前主题；非 cyber 时先拉取 themes-extra.css，再改 data-theme（避免无样式空窗）。
   * 副作用：可能触发一次异步 CSS 请求。
   */
  const setTheme = async () => {
    const type = theme.value;
    await ensureThemeCssFor(type);
    // 等样式表生效一帧再写 DOM，减少「主题已切、变量未到」的闪一下
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    applyThemeDom(type);
  };

  /** 跟随系统：映射到内置 dark / light（延后包），先加载 CSS 再应用 */
  const followOs = () => {
    const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
    theme.value = prefersDark ? 'dark' : 'light';
    void setTheme();
  };

  /** 点击 icon：cyber 深色 ↔ cyber-light 浅色（均已在首屏 CSS） */
  const clickIcon = () => {
    if (theme.value === 'cyber') {
      theme.value = 'cyber-light';
    }
    else if (theme.value === 'cyber-light') {
      theme.value = 'cyber';
    }
    else {
      theme.value = 'cyber';
    }
    void setTheme();
  };

  /** 初始化本地主题；非 cyber 尽早拉 extra CSS，cyber 等主题面板再预取 */
  const initTheme = () => {
    if (!import.meta.client) return;

    mediaMatch = matchMedia('(prefers-color-scheme: dark)');
    mediaMatch.addEventListener('change', followOs);

    const localTheme = localStorage.getItem('theme');
    theme.value = localTheme || 'cyber';

    void (async () => {
      // 仅非 cyber 才拉 themes-extra；cyber 用户打开主题面板时再预取（见 theme/index.vue）
      if (!isCriticalTheme(theme.value)) {
        await ensureExtraThemesCss();
      }
      applyThemeDom(theme.value);
    })();
  };

  const disposeTheme = () => {
    if (mediaMatch) {
      mediaMatch.removeEventListener('change', followOs);
      mediaMatch = null;
    }
  };

  return {
    theme,
    setTheme,
    followOs,
    clickIcon,
    initTheme,
    disposeTheme,
  };
}

export default function () {
  return useState('home', () => 'home');
}
