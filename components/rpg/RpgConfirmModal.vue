<script setup lang="ts">
/**
   * RPG 风通用确认弹窗（配合 useRpgModal / useCyberModal 使用）
   * - confirm：确认 / 取消
   * - alert：仅提示，单按钮
   */
const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?: 'primary' | 'error' | 'neutral' | 'warning';
    dismissible?: boolean;
    type?: 'confirm' | 'alert';
  }>(),
  {
    description: '',
    confirmLabel: '确定',
    cancelLabel: '取消',
    confirmColor: 'primary',
    dismissible: false,
    type: 'confirm',
  },
);

const open = defineModel<boolean>('open', { default: true });

const emit = defineEmits<{
  'close': [value: boolean];
  'after:leave': [];
}>();

const isAlert = computed(() => props.type === 'alert');

const confirmBtnClass = computed(() => {
  switch (props.confirmColor) {
    case 'error':
      return 'rpg-modal-btn--danger';
    case 'warning':
      return 'rpg-modal-btn--warning';
    case 'neutral':
      return 'rpg-modal-btn--secondary';
    default:
      return 'rpg-modal-btn--primary';
  }
});

const handleClose = (value: boolean) => {
  emit('close', value);
  open.value = false;
  nextTick(() => emit('after:leave'));
};

const onDismiss = () => {
  handleClose(isAlert.value);
};

const onBackdropClick = () => {
  if (props.dismissible) {
    onDismiss();
  }
};
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="rpg-confirm-modal" role="presentation">
      <div class="rpg-confirm-modal__backdrop" @click="onBackdropClick" />
      <div
        class="rpg-confirm-modal__box rpg-modal-box"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="title ? 'rpg-confirm-title' : undefined"
      >
        <button type="button" class="rpg-modal-close" aria-label="关闭" @click="onDismiss">
          ✕
        </button>

        <p class="rpg-confirm-modal__kicker">
          冒险协议
        </p>
        <h3 id="rpg-confirm-title" class="rpg-confirm-modal__title">
          {{ title }}
        </h3>
        <p v-if="description" class="rpg-confirm-modal__desc">
          {{ description }}
        </p>
        <slot />

        <div class="rpg-modal-actions">
          <button
            v-if="!isAlert"
            type="button"
            class="rpg-modal-btn rpg-modal-btn--secondary"
            @click="handleClose(false)"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="rpg-modal-btn"
            :class="confirmBtnClass"
            @click="handleClose(true)"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
  .rpg-confirm-modal {
    position: fixed;
    inset: 0;
    z-index: 10090;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .rpg-confirm-modal__backdrop {
    position: absolute;
    inset: 0;
    background: var(--rpg-overlay);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .rpg-confirm-modal__box {
    position: relative;
    z-index: 1;
    width: min(100%, 24rem);
    animation: rpg-confirm-enter 280ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .rpg-confirm-modal__kicker {
    margin: 0 0 0.35rem;
    padding-right: 2rem;
    font-size: 0.6875rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--rpg-amber-text-soft);
  }

  .rpg-confirm-modal__title {
    margin: 0 0 0.5rem;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.35;
    color: var(--rpg-text-heading);
  }

  .rpg-confirm-modal__desc {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--rpg-text-body);
  }

  @keyframes rpg-confirm-enter {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.97);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
