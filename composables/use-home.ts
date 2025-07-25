import { useState } from '#app';
// useState 的第一参数为 key，第二参数为初始化的工厂函数(即默认值)
export const useTheme = () => useState('theme', () => 'light');

// 主题相关逻辑提取
export function useThemeActions() {
  const theme = useTheme();

  // 设置主题
  const setTheme = () => {
    const type: string = theme.value;
    document.documentElement.className = type;
    document.documentElement.setAttribute('data-theme', type);
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

  // 点击icon切换主题
  const clickIcon = () => {
    if (theme.value === 'light') {
      theme.value = 'dark';
    }
    else {
      theme.value = 'light';
    }
    setTheme();
  };

  // 初始化和监听
  const initTheme = () => {
    if (import.meta.client) {
      // 监听系统主题变化
      const match = matchMedia('(prefers-color-scheme: dark)');
      match.addEventListener('change', followOs);
      // 初始化本地主题
      const localTheme = localStorage.getItem('theme');
      if (localTheme) {
        theme.value = localTheme;
      }
      setTheme();
    }
  };

  return {
    theme,
    setTheme,
    followOs,
    clickIcon,
    initTheme,
  };
}

export default function () {
  return useState('home', () => 'home');
}
