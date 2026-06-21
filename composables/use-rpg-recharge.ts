import { createSharedComposable } from '@vueuse/core';

/** 全站 RPG 钻石充值弹窗（钻石不足时由 handleRpgCurrencyError 唤起） */
export const useRpgRecharge = createSharedComposable(() => {
  /** 动态小程序码充值弹窗（全站默认） */
  const visible = ref(false);
  /** 旧版静态二维码弹窗（已下线，仅 /tool/test 预览归档组件） */
  const legacyVisible = ref(false);

  const playOpenSfx = () => {
    if (import.meta.client) void useRpgAudio().playSfx('uiClick');
  };

  /** 打开充值弹窗（全站走动态小程序码建单） */
  const openRechargeModal = () => {
    visible.value = true;
    legacyVisible.value = false;
    playOpenSfx();
  };

  /** 与 openRechargeModal 相同，保留别名供测试页 / 挡板调用 */
  const openDynamicRechargeModal = () => {
    openRechargeModal();
  };

  /** 关闭新版动态充值弹窗 */
  const closeRechargeModal = () => {
    visible.value = false;
  };

  /** 预览归档的旧版静态二维码弹窗（仅开发测试页） */
  const openLegacyRechargeModal = () => {
    visible.value = false;
    legacyVisible.value = true;
    playOpenSfx();
  };

  /** 关闭归档静态弹窗 */
  const closeLegacyRechargeModal = () => {
    legacyVisible.value = false;
  };

  return {
    visible,
    legacyVisible,
    openRechargeModal,
    openDynamicRechargeModal,
    closeRechargeModal,
    openLegacyRechargeModal,
    closeLegacyRechargeModal,
  };
});
