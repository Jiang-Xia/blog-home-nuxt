/**
 * 主题 DOM 写入：html class / data-theme / data-rpg-tone / localStorage。
 * 延后包主题须先 await ensureThemeCssFor，再调用本函数。
 */
import { getRpgTone } from '~/constants/theme-tone';

/** 将主题应用到 documentElement，并清除 boot 阶段的 data-theme-intent */
export function applyThemeToDocument(type: string) {
  const el = document.documentElement;
  el.className = type;
  el.setAttribute('data-theme', type);
  el.classList.add('tech-shell');
  el.setAttribute('data-rpg-tone', getRpgTone(type));
  el.removeAttribute('data-theme-intent');
  localStorage.setItem('theme', type);
}
