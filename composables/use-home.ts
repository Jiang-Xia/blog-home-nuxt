import { useState } from '#app';
// useState 的第一参数为 key，第二参数为初始化的工厂函数(即默认值)
export const TECH_THEMES = ['cyber', 'cyber-light'] as const;
export type TechTheme = (typeof TECH_THEMES)[number];

/** DaisyUI 中 color-scheme 为 dark 的主题（SSR 回退用） */
const DARK_THEMES = new Set([
  'dark',
  'synthwave',
  'halloween',
  'forest',
  'black',
  'luxury',
  'dracula',
  'business',
  'night',
  'coffee',
  'dim',
  'nord',
  'sunset',
  'abyss',
  'cyberpunk',
  'cyber',
]);

export function isDarkTheme(themeName: string): boolean {
  if (themeName === 'cyber-light') return false;
  if (DARK_THEMES.has(themeName)) return true;
  return false;
}

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

// 主题相关逻辑提取
export function useThemeActions() {
  const theme = useTheme();
  let mediaMatch: MediaQueryList | null = null;

  // 设置主题
  const setTheme = () => {
    const type: string = theme.value;
    document.documentElement.className = type;
    document.documentElement.setAttribute('data-theme', type);
    document.documentElement.classList.add('tech-shell');
    localStorage.setItem('theme', type);
  };

  // 跟随系统主题
  const followOs = () => {
    const bool = matchMedia('(prefers-color-scheme: dark)').matches;
    if (bool) {
      theme.value = 'dark';
    }
    else {
      theme.value = 'light';
    }
    setTheme();
  };

  // 点击 icon：cyber 深色 ↔ cyber-light 浅色
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
    setTheme();
  };

  // 初始化和监听
  const initTheme = () => {
    if (import.meta.client) {
      // 监听系统主题变化
      mediaMatch = matchMedia('(prefers-color-scheme: dark)');
      mediaMatch.addEventListener('change', followOs);
      // 初始化本地主题
      const localTheme = localStorage.getItem('theme');
      if (localTheme) {
        theme.value = localTheme;
      }
      else {
        theme.value = 'cyber';
      }
      setTheme();
    }
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
