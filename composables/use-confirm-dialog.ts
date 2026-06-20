import { useRpgModal } from './use-rpg-modal';

/** 兼容旧调用，内部转 useRpgModal().confirm */
export function useConfirmDialog() {
  return useRpgModal().confirm;
}
