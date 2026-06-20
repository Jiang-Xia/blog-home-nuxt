/**
 * 全站 Toast 统一封装（Nuxt UI useToast + cyber / RPG HUD 主题）
 *
 * - `message*`：带队列、去重、间隔，适合接口反馈与 RPG 事件
 * - `showToast`：立即展示，适合带操作按钮的交互提示
 * @see app.config.ts `ui.toast`、assets/css/rpg-theme.css `.rpg-toast*`（与活动横幅同系面板）
 */
const DEFAULT_DURATION = 2500;
const MIN_GAP_MS = 800;
const MAX_QUEUE_SIZE = 10;

export type ToastColor = 'error' | 'success' | 'warning' | 'info';

export interface ToastAction {
  label?: string;
  icon?: string;
  color?: ToastColor | 'primary' | 'neutral';
  variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
  onClick?: () => void | Promise<void>;
}

export interface ToastOptions {
  description: string;
  color?: ToastColor;
  title?: string;
  icon?: string;
  duration?: number;
  actions?: ToastAction[];
  close?: boolean;
}

interface ToastItem extends Required<Pick<ToastOptions, 'description' | 'color'>> {
  title: string;
  icon: string;
  duration: number;
  actions?: ToastAction[];
  close: boolean;
}

/** RPG HUD 语义标题 */
const TOAST_TITLES: Record<ToastColor, string> = {
  success: '任务完成',
  error: '系统警告',
  warning: '注意',
  info: '冒险日志',
};

/** cyber / RPG 面板一致的 Iconify 图标 */
const TOAST_ICONS: Record<ToastColor, string> = {
  success: 'i-lucide-circle-check',
  error: 'i-lucide-shield-alert',
  warning: 'i-lucide-triangle-alert',
  info: 'i-lucide-scroll-text',
};

const pending: ToastItem[] = [];
let draining = false;
let lastShownAt = 0;

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/** 唯一调用 useToast 的入口，样式由 app.config + rpg-theme.css 全局接管 */
function emitToast(item: ToastItem) {
  if (!import.meta.client) {
    return;
  }

  const toast = useToast();
  toast.add({
    title: item.title,
    description: item.description,
    color: item.color,
    icon: item.icon,
    duration: item.duration,
    orientation: 'horizontal',
    actions: item.actions,
    close: item.close,
  });
}

function normalizeToastItem(options: ToastOptions): ToastItem {
  const color = options.color ?? 'info';
  return {
    description: options.description,
    color,
    title: options.title ?? TOAST_TITLES[color],
    icon: options.icon ?? TOAST_ICONS[color],
    duration: options.duration ?? DEFAULT_DURATION,
    actions: options.actions,
    close: options.close ?? true,
  };
}

async function drainToastQueue() {
  if (draining) {
    return;
  }
  draining = true;

  while (pending.length > 0) {
    const gap = Math.max(0, MIN_GAP_MS - (Date.now() - lastShownAt));
    if (gap > 0) {
      await sleep(gap);
    }

    const item = pending.shift();
    if (!item) {
      continue;
    }

    emitToast(item);
    lastShownAt = Date.now();
  }

  draining = false;
}

function enqueueToast(item: ToastItem) {
  if (!import.meta.client) {
    return;
  }

  const duplicated = pending.some(
    queued => queued.description === item.description && queued.color === item.color,
  );
  if (duplicated) {
    return;
  }

  if (pending.length >= MAX_QUEUE_SIZE) {
    pending.shift();
  }

  pending.push(item);
  void drainToastQueue();
}

function pushToast(options: ToastOptions) {
  enqueueToast(normalizeToastItem(options));
}

/** 立即展示（跳过队列），适合带 actions 的交互提示 */
export function showToast(options: ToastOptions) {
  emitToast(normalizeToastItem(options));
}

export const messageDanger = (msg: string, duration = DEFAULT_DURATION) => {
  pushToast({
    description: msg,
    color: 'error',
    duration,
  });
};

export const messageSuccess = (msg = '', duration = DEFAULT_DURATION) => {
  pushToast({
    description: msg,
    color: 'success',
    duration,
  });
};

export const messageWarning = (msg = '', duration = DEFAULT_DURATION) => {
  pushToast({
    description: msg,
    color: 'warning',
    duration,
  });
};

export const messageInfo = (msg = '', duration = DEFAULT_DURATION) => {
  pushToast({
    description: msg,
    color: 'info',
    duration,
  });
};

/** 错误提示（messageDanger 别名） */
export const messageError = messageDanger;
