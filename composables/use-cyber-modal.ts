import CyberModal from '~/components/cyber/CyberModal.vue';

export interface CyberModalOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'error' | 'neutral' | 'warning';
  dismissible?: boolean;
  type?: 'confirm' | 'alert';
}

function openCyberModal(options: CyberModalOptions): Promise<boolean> {
  const overlay = useOverlay();
  const modal = overlay.create(CyberModal, {
    destroyOnClose: true,
    props: options,
  });
  return modal.open() as Promise<boolean>;
}

/** Cyber 风格通用弹框 */
export function useCyberModal() {
  const confirm = (options: Omit<CyberModalOptions, 'type'>): Promise<boolean> =>
    openCyberModal({ ...options, type: 'confirm' });

  const alert = (options: Omit<CyberModalOptions, 'type'>): Promise<boolean> =>
    openCyberModal({
      confirmLabel: '知道了',
      dismissible: true,
      ...options,
      type: 'alert',
    });

  return { confirm, alert, open: openCyberModal };
}

/** @deprecated 请优先使用 useCyberModal().confirm */
export function useConfirmDialog() {
  return useCyberModal().confirm;
}
