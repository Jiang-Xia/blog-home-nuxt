import RpgConfirmModal from '~/components/rpg/RpgConfirmModal.vue';

export interface RpgModalOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'error' | 'neutral' | 'warning';
  dismissible?: boolean;
  type?: 'confirm' | 'alert';
}

function openRpgModal(options: RpgModalOptions): Promise<boolean> {
  const overlay = useOverlay();
  const modal = overlay.create(RpgConfirmModal, {
    destroyOnClose: true,
    props: options,
  });
  return modal.open() as Promise<boolean>;
}

/** RPG 风通用弹框（确认 / 提示） */
export function useRpgModal() {
  const confirm = (options: Omit<RpgModalOptions, 'type'>): Promise<boolean> =>
    openRpgModal({ ...options, type: 'confirm' });

  const alert = (options: Omit<RpgModalOptions, 'type'>): Promise<boolean> =>
    openRpgModal({
      confirmLabel: '知道了',
      dismissible: true,
      ...options,
      type: 'alert',
    });

  return { confirm, alert, open: openRpgModal };
}
