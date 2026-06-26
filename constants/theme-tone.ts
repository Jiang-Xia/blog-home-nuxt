/** DaisyUI 暗色主题（与 isDarkTheme 一致；RPG 任务/成就卡片暗色令牌对齐 cyber） */
export const DAISY_DARK_THEMES = new Set([
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

/** RPG 卡片明暗：暗色 → cyber 令牌，亮色 → cyber-light 令牌 */
export function getRpgTone(themeName: string): 'dark' | 'light' {
  if (themeName === 'cyber-light') return 'light';
  if (DAISY_DARK_THEMES.has(themeName)) return 'dark';
  return 'light';
}

export function isDarkTheme(themeName: string): boolean {
  return getRpgTone(themeName) === 'dark';
}

/** 首屏防闪烁：写入 html 的 class / data-theme / data-rpg-tone */
export function buildThemeBootScript(): string {
  const darkList = JSON.stringify([...DAISY_DARK_THEMES]);
  return `(function(){var t=localStorage.getItem('theme')||'cyber';var dark=new Set(${darkList});var tone=t==='cyber-light'||!dark.has(t)?'light':'dark';var el=document.documentElement;el.className=t;el.setAttribute('data-theme',t);el.classList.add('tech-shell');el.setAttribute('data-rpg-tone',tone);})();`;
}
