const DEFAULT_DURATION = 2500;
const MIN_GAP_MS = 800;
const MAX_QUEUE_SIZE = 10;

type ToastColor = 'error' | 'success' | 'warning' | 'info';

interface ToastItem {
  description: string;
  color: ToastColor;
  icon: string;
  duration: number;
}

const pending: ToastItem[] = [];
let draining = false;
let lastShownAt = 0;

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
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
    if (!item || !import.meta.client) {
      continue;
    }

    const toast = useToast();
    toast.add({
      title: '提示',
      description: item.description,
      color: item.color,
      icon: item.icon,
      duration: item.duration,
    });
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

function pushToast(options: {
  description: string;
  color: ToastColor;
  icon: string;
  duration?: number;
}) {
  enqueueToast({
    description: options.description,
    color: options.color,
    icon: options.icon,
    duration: options.duration ?? DEFAULT_DURATION,
  });
}

export const messageDanger = (msg: string, duration = DEFAULT_DURATION) => {
  pushToast({
    description: msg,
    color: 'error',
    icon: 'clarity:warning-standard-line',
    duration,
  });
};

export const messageSuccess = (msg = '', duration = DEFAULT_DURATION) => {
  pushToast({
    description: msg,
    color: 'success',
    icon: 'clarity:success-standard-line',
    duration,
  });
};

export const messageWarning = (msg = '', duration = DEFAULT_DURATION) => {
  pushToast({
    description: msg,
    color: 'warning',
    icon: 'clarity:warning-standard-line',
    duration,
  });
};

export const messageInfo = (msg = '', duration = DEFAULT_DURATION) => {
  pushToast({
    description: msg,
    color: 'info',
    icon: 'clarity:info-standard-line',
    duration,
  });
};

/** 错误提示（messageDanger 别名） */
export const messageError = messageDanger;
