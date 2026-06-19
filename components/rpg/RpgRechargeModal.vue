<script setup lang="ts">
/**
   * 钻石不足时的充值引导弹窗
   * 展示汇率说明、充值二维码与站长服务提示
   */
import {
  RPG_RECHARGE_ALIPAY_HINT,
  RPG_RECHARGE_HINT,
  RPG_RECHARGE_QR_URL,
  RPG_RECHARGE_RATE_TEXT,
} from '~~/constants/rpg-economy';

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="recharge">
      <div v-if="visible" class="recharge-overlay" @click="handleClose">
        <div class="recharge-modal rpg-theme" @click.stop>
          <div class="recharge-badge">
            💎 钻石不足
          </div>
          <p class="recharge-desc">
            余额不足请先充值 · {{ RPG_RECHARGE_RATE_TEXT }}
          </p>
          <p class="recharge-scan-tip">
            {{ RPG_RECHARGE_ALIPAY_HINT }}
          </p>
          <div class="recharge-qr-wrap">
            <img
              :src="RPG_RECHARGE_QR_URL"
              alt="支付宝小程序充值二维码"
              class="recharge-qr"
              loading="lazy"
            >
          </div>
          <p class="recharge-hint">
            {{ RPG_RECHARGE_HINT }}
          </p>
          <button class="close-btn" @click="handleClose">
            我知道了
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .recharge-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.52);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10080;
    padding: 16px;
  }

  .recharge-modal {
    background: var(--rpg-modal-surface, #1e293b);
    border: 1px solid var(--rpg-border, rgb(255 255 255 / 0.14));
    border-radius: 16px;
    padding: 18px 22px 16px;
    text-align: center;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
    width: min(100%, 320px);
  }

  .recharge-badge {
    font-size: 16px;
    font-weight: 800;
    color: oklch(var(--wa));
    margin-bottom: 6px;
  }

  .recharge-desc {
    font-size: 13px;
    color: var(--rpg-text-body, #e2e8f0);
    margin-bottom: 4px;
    line-height: 1.4;
  }

  .recharge-scan-tip {
    font-size: 12px;
    font-weight: 600;
    color: #1677ff;
    margin-bottom: 10px;
    line-height: 1.4;
  }

  .recharge-qr-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }

  .recharge-qr {
    width: 180px;
    height: 180px;
    object-fit: contain;
    border-radius: 10px;
    background: #000;
  }

  .recharge-hint {
    font-size: 11px;
    color: var(--rpg-text-secondary, #94a3b8);
    margin-bottom: 12px;
    line-height: 1.4;
  }

  .close-btn {
    padding: 6px 22px;
    border: 1px solid var(--rpg-border-subtle, rgb(255 255 255 / 0.16));
    border-radius: 999px;
    background: var(--rpg-stat-hover, rgb(255 255 255 / 0.08));
    color: var(--rpg-text-secondary, #94a3b8);
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition:
      background 0.2s,
      color 0.2s;
  }

  .close-btn:hover {
    background: var(--rpg-empty-bg, rgb(255 255 255 / 0.12));
    color: var(--rpg-text-label, #cbd5e1);
  }

  .recharge-enter-active,
  .recharge-leave-active {
    transition: opacity 0.25s ease;
  }

  .recharge-enter-from,
  .recharge-leave-to {
    opacity: 0;
  }
</style>
