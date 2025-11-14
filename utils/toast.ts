let showMsgLoading = false;
const DEFAULT_DURATION = 1500;
export const messageDanger = (msg: string, duration = DEFAULT_DURATION) => {
  // console.log('危险提示!');
  if (showMsgLoading) {
    return;
  }
  if (import.meta.client) {
    const toast = useToast();
    toast.add({
      title: '提示',
      description: msg,
      color: 'error',
      icon: 'clarity:warning-standard-line',
      duration,
    });
    showMsgLoading = true;
    setTimeout(() => {
      showMsgLoading = false;
    }, 1000);
  }
};
export const messageSuccess = (msg = '', duration = DEFAULT_DURATION) => {
  if (showMsgLoading) {
    return;
  }
  if (import.meta.client) {
    const toast = useToast();
    toast.add({
      title: '提示',
      description: msg,
      color: 'success',
      icon: 'clarity:success-standard-line',
      duration,
    });
    showMsgLoading = true;
  }
  setTimeout(() => {
    showMsgLoading = false;
  }, 1000);
};
export const messageWarning = (msg = '', duration = DEFAULT_DURATION) => {
  if (showMsgLoading) {
    return;
  }
  if (import.meta.client) {
    const toast = useToast();
    toast.add({
      title: '提示',
      description: msg,
      color: 'warning',
      icon: 'clarity:warning-standard-line',
      duration,
    });
    showMsgLoading = true;
  }
  setTimeout(() => {
    showMsgLoading = false;
  }, 1000);
};
export const messageInfo = (msg = '', duration = DEFAULT_DURATION) => {
  if (showMsgLoading) {
    return;
  }
  if (import.meta.client) {
    const toast = useToast();
    toast.add({
      title: '提示',
      description: msg,
      color: 'info',
      icon: 'clarity:info-standard-line',
      duration,
    });
    showMsgLoading = true;
  }
  setTimeout(() => {
    showMsgLoading = false;
  }, 1000);
};
