import { messageError } from '@/utils/toast';
import { useRpgRecharge } from '~~/composables/use-rpg-recharge';

/** 判断 API 错误是否为钻石余额不足 */
export function isDiamondInsufficientError(message?: string | null): boolean {
  return !!message && message.includes('钻石不足');
}

/**
 * RPG 钻石相关 API 错误处理：余额不足时弹出充值框，否则 Toast 提示。
 * @returns 是否已按钻石不足处理（调用方无需再 messageError）
 */
export function handleRpgCurrencyError(error: unknown, fallbackMessage: string): boolean {
  const message = (error as { message?: string })?.message || fallbackMessage;
  if (isDiamondInsufficientError(message)) {
    const { openRechargeModal } = useRpgRecharge();
    openRechargeModal();
    return true;
  }
  messageError(message);
  return false;
}
