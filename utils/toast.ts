let showMsgLoading = false;
export const messageDanger = (msg: string, duration = 1000) => {
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
export const messageSuccess = (msg = '', duration = 1000) => {
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
