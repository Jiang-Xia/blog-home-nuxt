/**
 * 控制台彩蛋：打开 DevTools 打印品牌菜单，并挂载可交互命令。
 * 生产环境 esbuild 会 drop 直接的 console.*；此处经属性名拼接取 Console，避免被剔除。
 */
import { SiteTitle } from '~~/utils/constant';

type EggWindow = Window & {
  help?: () => void;
  about?: () => void;
  go?: (path?: string) => void;
};

/** 取浏览器 Console（绕过生产 drop:['console']） */
function eggConsole(): Console {
  return (globalThis as Record<string, Console>)[`con${'sole'}`];
}

/** 带 %c 样式的单行日志 */
function styleLog(text: string, css: string) {
  eggConsole().log(`%c${text}`, css);
}

/** 打印彩蛋菜单与用法说明 */
function printMenu() {
  const c = eggConsole();
  c.log(`%c${SiteTitle}`, 'font-size:22px;font-weight:700;color:#0ea5e9;padding:4px 0;');
  styleLog('你好呀，既然打开了控制台，那就多玩一会儿～', 'color:#64748b;font-size:12px;');
  c.log('');
  styleLog('可用命令（直接输入后回车）：', 'font-weight:600;color:#334155;');
  c.log(
    '%chelp()%c   再看一遍本菜单\n%cabout()%c  关于本站\n%cgo(path)%c 跳转页面，如 go(\'/rpg\')、go(\'/tool\')',
    'color:#0ea5e9;font-weight:700;',
    'color:#64748b;',
    'color:#0ea5e9;font-weight:700;',
    'color:#64748b;',
    'color:#0ea5e9;font-weight:700;',
    'color:#64748b;',
  );
  c.log('');
  styleLog('源码与合作 → https://jiang-xia.top/open-source', 'color:#94a3b8;font-size:11px;');
}

/** 注册 window 上的彩蛋命令（不可枚举，减少污染） */
function installCommands(win: EggWindow) {
  const def = (name: keyof EggWindow, fn: () => void) => {
    Object.defineProperty(win, name, {
      value: fn,
      writable: false,
      enumerable: false,
      configurable: true,
    });
  };

  def('help', () => {
    printMenu();
  });

  def('about', () => {
    styleLog(
      `${SiteTitle} · Nuxt3 个人博客 · 工具箱 / RPG / 开源三端`,
      'color:#0ea5e9;font-size:13px;font-weight:600;',
    );
    styleLog('站点：https://jiang-xia.top', 'color:#64748b;');
    styleLog('开源说明：https://jiang-xia.top/open-source', 'color:#64748b;');
  });

  Object.defineProperty(win, 'go', {
    value: (path = '/') => {
      const target = path.startsWith('/') ? path : `/${path}`;
      win.location.href = target;
    },
    writable: false,
    enumerable: false,
    configurable: true,
  });
}

export default defineNuxtPlugin(() => {
  if (import.meta.server) return;
  const win = window as EggWindow;
  installCommands(win);
  printMenu();
});
