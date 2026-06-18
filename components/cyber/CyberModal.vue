<script setup lang="ts">
/**
   * Cyber 风格通用弹框（配合 useCyberModal / useConfirmDialog 使用）
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
      return 'cyber-modal-btn--danger';
    case 'warning':
      return 'cyber-modal-btn--warning';
    case 'neutral':
      return 'cyber-modal-btn--secondary';
    default:
      return 'cyber-modal-btn--primary';
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
    <div v-if="open" class="modal modal-open cyber-modal">
      <div class="modal-box cyber-glass-card border border-tech max-w-md">
        <button
          type="button"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          aria-label="关闭"
          @click="onDismiss"
        >
          ✕
        </button>

        <h3 class="text-lg font-bold text-tech pr-8">
          {{ title }}
        </h3>
        <p v-if="description" class="py-4 text-sm leading-relaxed text-tech-muted">
          {{ description }}
        </p>
        <slot />

        <div class="cyber-modal-action">
          <button
            v-if="!isAlert"
            type="button"
            class="cyber-modal-btn cyber-modal-btn--secondary"
            @click="handleClose(false)"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="cyber-modal-btn"
            :class="confirmBtnClass"
            @click="handleClose(true)"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="onBackdropClick" />
    </div>
  </Teleport>
</template>

<style scoped>
  .cyber-modal {
    z-index: 9999;
  }

  .cyber-modal-action {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .cyber-modal-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 5.5rem;
    height: 2.75rem;
    padding: 0 1.5rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    transition: all 0.2s;
  }

  .cyber-modal-btn--secondary {
    border: 1px solid var(--tech-btn-secondary-border);
    background: transparent;
    color: var(--tech-fg);
  }

  .cyber-modal-btn--secondary:hover {
    border-color: var(--tech-section-label);
    background-color: var(--tech-btn-secondary-hover-bg);
  }

  .cyber-modal-btn--primary {
    border: 0;
    background: linear-gradient(to right, var(--tech-gradient-from), var(--tech-gradient-mid));
    color: var(--color-primary-content);
    box-shadow: 0 0 30px var(--tech-primary-glow);
  }

  .cyber-modal-btn--primary:hover {
    box-shadow: 0 0 40px var(--tech-primary-glow-hover);
    filter: brightness(1.08);
  }

  .cyber-modal-btn--danger {
    border: 0;
    background: linear-gradient(to right, #dc2626, #ef4444);
    color: #fff;
    box-shadow: 0 0 24px color-mix(in oklch, var(--color-error) 40%, transparent);
  }

  .cyber-modal-btn--danger:hover {
    box-shadow: 0 0 32px color-mix(in oklch, var(--color-error) 50%, transparent);
    filter: brightness(1.06);
  }

  .cyber-modal-btn--warning {
    border: 0;
    background: linear-gradient(to right, #d97706, #f59e0b);
    color: #fff;
    box-shadow: 0 0 24px color-mix(in oklch, var(--color-warning) 35%, transparent);
  }

  .cyber-modal-btn--warning:hover {
    box-shadow: 0 0 32px color-mix(in oklch, var(--color-warning) 45%, transparent);
    filter: brightness(1.06);
  }
</style>
