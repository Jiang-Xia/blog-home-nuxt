import { createSharedComposable } from '@vueuse/core';

/** 全站 RPG 钻石充值弹窗（钻石不足时由 handleRpgCurrencyError 唤起） */
export const useRpgRecharge = createSharedComposable(() => {
  const visible = ref(false);

  /** 打开充值弹窗；客户端播放轻点击音 */
  const openRechargeModal = () => {
    visible.value = true;
    if (import.meta.client) void useRpgAudio().playSfx('uiClick');
  };

  /** 关闭充值弹窗 */
  const closeRechargeModal = () => {
    visible.value = false;
  };

  return {
    visible,
    openRechargeModal,
    closeRechargeModal,
  };
});
