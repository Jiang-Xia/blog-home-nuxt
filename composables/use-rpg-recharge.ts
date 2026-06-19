import { createSharedComposable } from '@vueuse/core';

/** 全站 RPG 钻石充值弹窗（钻石不足时由 handleRpgCurrencyError 唤起） */
export const useRpgRecharge = createSharedComposable(() => {
  const visible = ref(false);

  const openRechargeModal = () => {
    visible.value = true;
  };

  const closeRechargeModal = () => {
    visible.value = false;
  };

  return {
    visible,
    openRechargeModal,
    closeRechargeModal,
  };
});
