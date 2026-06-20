import type { RpgModalOptions } from './use-rpg-modal';
import { useRpgModal } from './use-rpg-modal';

export type CyberModalOptions = RpgModalOptions;

/** @deprecated 请使用 useRpgModal */
export function useCyberModal() {
  return useRpgModal();
}
