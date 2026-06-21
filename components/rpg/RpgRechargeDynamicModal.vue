<script setup lang="ts">
/**
   * 钻石不足时的动态充值弹窗
   * 创建充值意向单 → 展示支付宝拉起二维码 → WS rechargeComplete 关单
   */
import QRCode from 'qrcode';
import { createRpgRechargeOrder, type RpgRechargeCreateResult } from '~~/api/rpg-recharge';
import type { RpgRechargeCompletePayload } from '~~/composables/use-realtime-socket';
import {
  calcRechargeDiamonds,
  isSameRechargeYuan,
  parseRechargeYuanInput,
  isRechargeYuanInRange,
  RPG_RECHARGE_MAX_YUAN,
  RPG_RECHARGE_MIN_YUAN,
  RPG_RECHARGE_AMOUNT_OPTIONS,
  RPG_RECHARGE_DEFAULT_AMOUNT,
  RPG_RECHARGE_ALIPAY_HINT,
  RPG_RECHARGE_RATE_TEXT,
} from '~~/constants/rpg-economy';
import { messageError } from '~~/utils/toast';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { on, notifyDataRefresh } = useRealtimeSocket();

type AmountMode = 'preset' | 'custom';

const amountMode = ref<AmountMode>('preset');
const selectedPreset = ref<number>(RPG_RECHARGE_DEFAULT_AMOUNT);
const customAmountInput = ref('');
/** 点击「确定生成二维码」后锁定的金额；未确认前不建单 */
const confirmedAmount = ref<number | null>(null);
/** 金额确认后又被修改，需重新点确定 */
const needsReconfirm = ref(false);
const selectedAmount = ref<number>(RPG_RECHARGE_DEFAULT_AMOUNT);
const loading = ref(false);
const paid = ref(false);
const orderInfo = ref<RpgRechargeCreateResult | null>(null);
const qrContainerRef = ref<HTMLElement>();
const qrError = ref('');

const parseCustomYuan = parseRechargeYuanInput;

/** 当前生效的充值金额（元）：预设直接取值，自定义从输入解析并校验范围 */
const resolvedAmount = computed((): number | null => {
  if (amountMode.value === 'preset') {
    return selectedPreset.value;
  }
  const parsed = parseCustomYuan(customAmountInput.value);
  if (parsed === null || !isRechargeYuanInRange(parsed)) return null;
  return parsed;
});

const diamondsPreview = computed(() => {
  const amount = resolvedAmount.value;
  if (amount === null) return null;
  return calcRechargeDiamonds(amount);
});

const isAmountValid = computed(() => resolvedAmount.value !== null);

const customAmountHint = computed(
  () => `请输入 ${RPG_RECHARGE_MIN_YUAN}~${RPG_RECHARGE_MAX_YUAN} 元，最多两位小数`,
);

/** 当前选中金额已与确认金额一致（才展示/刷新二维码） */
const isAmountConfirmed = computed(() => {
  const amount = resolvedAmount.value;
  return (
    amount !== null
    && confirmedAmount.value !== null
    && isSameRechargeYuan(confirmedAmount.value, amount)
  );
});

/** 是否应展示支付二维码区域（含 loading / canvas） */
const shouldShowQr = computed(() => isAmountConfirmed.value);

const pendingQrHint = computed(() => {
  if (!isAmountValid.value) {
    return amountMode.value === 'custom' ? customAmountHint.value : '请选择充值金额';
  }
  if (!isAmountConfirmed.value) {
    if (needsReconfirm.value) {
      return '金额已变更，请重新点击确定';
    }
    return '确认金额后点击「确定生成二维码」';
  }
  return '';
});

const invalidateConfirmedOrder = () => {
  if (confirmedAmount.value === null) return;
  needsReconfirm.value = true;
  confirmedAmount.value = null;
  clearOrderDisplay();
};

const clearOrderDisplay = () => {
  orderInfo.value = null;
  qrError.value = '';
  if (qrContainerRef.value) qrContainerRef.value.innerHTML = '';
};

const selectPresetAmount = (amount: number) => {
  amountMode.value = 'preset';
  if (confirmedAmount.value !== null && !isSameRechargeYuan(confirmedAmount.value, amount)) {
    invalidateConfirmedOrder();
  }
  selectedPreset.value = amount;
  selectedAmount.value = amount;
};

const selectCustomAmountMode = () => {
  amountMode.value = 'custom';
  confirmedAmount.value = null;
  needsReconfirm.value = false;
  clearOrderDisplay();
  if (!String(customAmountInput.value ?? '').trim()) {
    customAmountInput.value = String(selectedPreset.value);
  }
  handleCustomAmountInput();
};

const confirmAmount = () => {
  const amount = resolvedAmount.value;
  if (amount === null) {
    messageError(amountMode.value === 'custom' ? customAmountHint.value : '请选择充值金额');
    return;
  }
  if (
    confirmedAmount.value !== null
    && isSameRechargeYuan(confirmedAmount.value, amount)
    && orderInfo.value?.outTradeNo
  ) {
    return;
  }
  confirmedAmount.value = amount;
  needsReconfirm.value = false;
  selectedAmount.value = amount;
  if (props.visible && !isIosDevice.value && !paid.value) {
    void prepareOrder();
  }
};

/** 输入过程中即时封顶；变更后需重新确定才建单 */
const handleCustomAmountInput = () => {
  if (amountMode.value !== 'custom') return;
  const parsed = parseCustomYuan(customAmountInput.value);
  if (parsed !== null && parsed > RPG_RECHARGE_MAX_YUAN) {
    customAmountInput.value = String(RPG_RECHARGE_MAX_YUAN);
  }
  if (
    confirmedAmount.value !== null
    && resolvedAmount.value !== null
    && !isSameRechargeYuan(resolvedAmount.value, confirmedAmount.value)
  ) {
    invalidateConfirmedOrder();
  }
};

const isIosDevice = computed(() => {
  if (!import.meta.client) return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
});

const renderQrCode = async (url: string) => {
  qrError.value = '';
  if (!qrContainerRef.value) {
    throw new Error('二维码容器未就绪');
  }
  qrContainerRef.value.innerHTML = '';
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, url, { width: 140, margin: 1 });
  qrContainerRef.value.appendChild(canvas);
};

const completeRecharge = () => {
  if (paid.value) return;
  paid.value = true;
  notifyDataRefresh('status');
  notifyDataRefresh('inventory');
  setTimeout(() => emit('close'), 1200);
};

const handleRechargeComplete = (payload: RpgRechargeCompletePayload) => {
  if (!orderInfo.value || paid.value) return;
  if (payload.outTradeNo !== orderInfo.value.outTradeNo) return;
  completeRecharge();
};

const resetState = () => {
  loading.value = false;
  paid.value = false;
  orderInfo.value = null;
  qrError.value = '';
  amountMode.value = 'preset';
  selectedPreset.value = RPG_RECHARGE_DEFAULT_AMOUNT;
  customAmountInput.value = '';
  confirmedAmount.value = null;
  needsReconfirm.value = false;
  selectedAmount.value = RPG_RECHARGE_DEFAULT_AMOUNT;
  if (qrContainerRef.value) qrContainerRef.value.innerHTML = '';
};

const prepareOrder = async () => {
  const amount = confirmedAmount.value;

  if (amount === null) {
    clearOrderDisplay();
    return;
  }

  selectedAmount.value = amount;
  loading.value = true;
  paid.value = false;
  orderInfo.value = null;
  qrError.value = '';
  if (qrContainerRef.value) qrContainerRef.value.innerHTML = '';

  try {
    const res = (await createRpgRechargeOrder(amount)) as any;
    const data = (res?.data ?? res) as RpgRechargeCreateResult;
    if (!data?.universalLink || !data?.outTradeNo) {
      throw new Error('创建充值订单失败');
    }
    orderInfo.value = data;
    loading.value = false;
    await nextTick();
    await renderQrCode(data.universalLink);
  }
  catch (err: any) {
    qrError.value = err?.message || '二维码生成失败';
    messageError(err?.message || '创建充值订单失败，请稍后重试');
  }
  finally {
    loading.value = false;
  }
};

const handleClose = () => {
  resetState();
  emit('close');
};

on('rechargeComplete', (data) => {
  handleRechargeComplete(data as RpgRechargeCompletePayload);
});

watch(
  () => props.visible,
  (open) => {
    if (!open) {
      resetState();
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="recharge">
      <div v-if="visible" class="recharge-overlay" @click="handleClose">
        <div class="recharge-modal rpg-theme" @click.stop>
          <button type="button" class="modal-close" aria-label="关闭" @click="handleClose">
            ×
          </button>

          <header class="modal-header">
            <div class="header-glow" aria-hidden="true" />
            <div class="header-main">
              <div class="header-icon">
                💎
              </div>
              <div class="header-text">
                <h3 class="header-title">
                  钻石不足
                </h3>
                <p class="header-sub">
                  余额不足请先充值 · {{ RPG_RECHARGE_RATE_TEXT }}
                </p>
              </div>
            </div>
          </header>

          <div v-if="isIosDevice" class="ios-panel">
            <p>iOS 设备暂不支持网页内拉起小程序支付。</p>
            <p class="ios-sub">
              请直接在支付宝打开个人小程序，进入收银页（all-pay）完成支付。
            </p>
            <button type="button" class="ghost-btn" @click="handleClose">
              我知道了
            </button>
          </div>

          <template v-else>
            <div class="modal-body">
              <div class="modal-main">
                <section class="panel amount-panel">
                  <div class="panel-head">
                    <span class="panel-title">充值金额</span>
                  </div>
                  <div class="amount-grid">
                    <button
                      v-for="amount in RPG_RECHARGE_AMOUNT_OPTIONS"
                      :key="amount"
                      type="button"
                      class="amount-chip"
                      :class="{ active: amountMode === 'preset' && selectedPreset === amount }"
                      :disabled="loading"
                      @click="selectPresetAmount(amount)"
                    >
                      <span class="chip-value">{{ amount }}</span>
                      <span class="chip-unit">元</span>
                    </button>
                    <button
                      type="button"
                      class="amount-chip amount-chip--custom"
                      :class="{ active: amountMode === 'custom' }"
                      :disabled="loading"
                      @click="selectCustomAmountMode"
                    >
                      自定义
                    </button>
                  </div>
                  <div v-if="amountMode === 'custom'" class="custom-amount-row">
                    <input
                      v-model="customAmountInput"
                      type="text"
                      class="custom-amount-input"
                      inputmode="decimal"
                      autocomplete="off"
                      :placeholder="customAmountHint"
                      :disabled="loading"
                      @input="handleCustomAmountInput"
                    >
                    <span class="custom-amount-unit">元</span>
                  </div>
                  <div class="preview-pill">
                    <span class="preview-label">预计到账</span>
                    <strong class="preview-value">{{ diamondsPreview ?? '--' }}</strong>
                    <span class="preview-suffix">钻石</span>
                  </div>
                  <button
                    type="button"
                    class="confirm-amount-btn confirm-amount-btn--block"
                    :disabled="!isAmountValid || loading"
                    @click="confirmAmount"
                  >
                    确定生成二维码
                  </button>
                </section>

                <section class="panel pay-panel">
                  <div class="panel-head">
                    <span class="panel-title">支付宝扫码</span>
                    <span
                      v-if="orderInfo && !paid && shouldShowQr && !qrError"
                      class="status-badge"
                    >
                      <span class="status-dot" />
                      等待支付
                    </span>
                    <span v-if="paid" class="status-badge status-badge--success">已到账</span>
                  </div>

                  <div class="qr-frame" :class="{ loading: loading && shouldShowQr }">
                    <div v-show="loading && shouldShowQr" class="qr-state">
                      <span class="qr-spinner" />
                      生成二维码…
                    </div>
                    <div
                      v-show="!loading && !shouldShowQr && pendingQrHint"
                      class="qr-state qr-state--muted"
                    >
                      {{ pendingQrHint }}
                    </div>
                    <div v-show="!loading && shouldShowQr" ref="qrContainerRef" class="qr-canvas" />
                    <p v-if="qrError && !loading" class="qr-error">
                      {{ qrError }}
                    </p>
                  </div>

                  <p class="pay-tip">
                    {{ RPG_RECHARGE_ALIPAY_HINT }}
                  </p>
                </section>
              </div>

              <footer class="modal-footer">
                <button type="button" class="primary-btn" @click="handleClose">
                  稍后再说
                </button>
              </footer>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .recharge-overlay {
    position: fixed;
    inset: 0;
    background: color-mix(in oklch, var(--color-base-content, #0f172a) 45%, transparent);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10080;
    padding: 16px;
  }

  .recharge-modal {
    position: relative;
    background: var(--rpg-modal-surface);
    border: 1px solid var(--rpg-border);
    border-radius: 20px;
    overflow: hidden;
    box-shadow:
      0 24px 64px color-mix(in oklch, var(--color-base-content) 32%, transparent),
      0 0 0 1px color-mix(in oklch, var(--color-base-content) 4%, transparent) inset;
    width: min(100%, 560px);
    max-height: min(92vh, 520px);
  }

  .modal-close {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 999px;
    background: color-mix(in oklch, var(--color-secondary-content) 16%, transparent);
    color: var(--color-secondary-content);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    transition: background 0.2s;
  }

  .modal-close:hover {
    background: color-mix(in oklch, var(--color-secondary-content) 26%, transparent);
  }

  .modal-header {
    position: relative;
    padding: 12px 44px 12px 14px;
    background: var(--rpg-violet-gradient);
    color: var(--color-secondary-content);
  }

  .header-main {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
  }

  .header-text {
    min-width: 0;
  }

  .header-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 20% 0%,
      color-mix(in oklch, var(--color-secondary-content) 22%, transparent),
      transparent 55%
    );
    pointer-events: none;
  }

  .header-icon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 11px;
    background: color-mix(in oklch, var(--color-secondary-content) 16%, transparent);
    font-size: 18px;
    box-shadow: 0 4px 12px color-mix(in oklch, var(--color-base-content) 12%, transparent);
  }

  .header-title {
    position: relative;
    margin: 0 0 2px;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .header-sub {
    position: relative;
    margin: 0;
    font-size: 11px;
    line-height: 1.35;
    color: color-mix(in oklch, var(--color-secondary-content) 82%, transparent);
  }

  .modal-body {
    padding: 12px 14px 14px;
  }

  .modal-main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
    gap: 10px;
    align-items: stretch;
  }

  .panel {
    padding: 10px;
    border-radius: 14px;
    background: var(--rpg-stat-hover);
    border: 1px solid var(--rpg-border-subtle);
  }

  .panel + .panel {
    margin-top: 0;
  }

  .amount-panel {
    display: flex;
    flex-direction: column;
  }

  .pay-panel {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }

  .panel-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--rpg-text-label);
  }

  .amount-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
    margin-bottom: 8px;
  }

  .amount-chip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-height: 36px;
    padding: 6px 4px;
    white-space: nowrap;
    border-radius: 12px;
    border: 1px solid var(--rpg-border-subtle);
    background: var(--rpg-surface);
    color: var(--rpg-text-secondary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition:
      border-color 0.2s,
      background 0.2s,
      color 0.2s,
      transform 0.15s;
  }

  .amount-chip:hover:not(:disabled) {
    border-color: color-mix(in oklch, var(--rpg-violet) 40%, transparent);
    color: var(--rpg-text-body);
  }

  .amount-chip.active {
    border-color: var(--rpg-violet);
    color: var(--rpg-violet);
    background: var(--rpg-violet-bg);
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--rpg-violet) 25%, transparent);
  }

  .amount-chip--custom {
    grid-column: 1 / -1;
    min-height: 34px;
    font-size: 12px;
  }

  .chip-value {
    font-size: 14px;
    font-weight: 800;
    line-height: 1;
  }

  .chip-unit {
    font-size: 11px;
    opacity: 0.85;
  }

  .amount-chip:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .custom-amount-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .custom-amount-input {
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid var(--rpg-border-subtle);
    background: var(--rpg-surface);
    color: var(--rpg-text-body);
    font-size: 15px;
    font-weight: 700;
  }

  .custom-amount-input:focus {
    outline: none;
    border-color: var(--rpg-violet);
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--rpg-violet) 22%, transparent);
  }

  .custom-amount-unit {
    font-size: 13px;
    color: var(--rpg-text-secondary);
    flex-shrink: 0;
  }

  .confirm-amount-btn {
    flex-shrink: 0;
    padding: 8px 14px;
    border: none;
    border-radius: 10px;
    background: var(--rpg-violet-gradient);
    color: var(--color-secondary-content);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .confirm-amount-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .confirm-amount-btn:not(:disabled):hover {
    opacity: 0.92;
  }

  .confirm-amount-btn--block {
    width: 100%;
    margin-top: 8px;
    padding: 9px 14px;
  }

  .preview-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: auto;
    padding: 6px 10px;
    border-radius: 999px;
    background: var(--rpg-amber-bg-faint);
    border: 1px solid var(--rpg-amber-border);
    color: var(--rpg-amber-text-soft);
    font-size: 12px;
  }

  .preview-value {
    font-size: 15px;
    font-weight: 800;
    color: var(--rpg-amber);
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border-radius: 999px;
    background: color-mix(in oklch, var(--rpg-primary) 14%, transparent);
    color: var(--rpg-primary);
    font-size: 11px;
    font-weight: 700;
  }

  .status-badge--success {
    background: color-mix(in oklch, var(--rpg-success) 14%, transparent);
    color: var(--rpg-success);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
    animation: pulse-dot 1.4s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }

    50% {
      opacity: 0.45;
      transform: scale(0.85);
    }
  }

  .qr-frame {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 152px;
    margin-bottom: 8px;
    padding: 8px;
    border-radius: 16px;
    background: #fff;
    box-shadow: inset 0 0 0 1px rgb(15 23 42 / 0.06);
  }

  .qr-frame.loading {
    background: color-mix(in oklch, var(--color-base-200) 70%, #fff);
  }

  .qr-canvas {
    display: flex;
    justify-content: center;
  }

  .qr-canvas :deep(canvas) {
    border-radius: 8px;
  }

  .qr-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--rpg-primary);
  }

  .qr-state--muted {
    color: var(--rpg-text-secondary);
    font-weight: 500;
    text-align: center;
    line-height: 1.5;
    padding: 0 8px;
  }

  .qr-spinner {
    width: 22px;
    height: 22px;
    border: 2px solid color-mix(in oklch, var(--rpg-primary) 20%, transparent);
    border-top-color: var(--rpg-primary);
    border-radius: 999px;
    animation: spin 0.75s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .qr-error {
    margin: 8px 0 0;
    font-size: 12px;
    color: var(--color-error);
    text-align: center;
  }

  .pay-tip {
    margin: 0 0 2px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.45;
    color: var(--rpg-text-body);
    text-align: center;
  }

  .pay-sub {
    margin: 0;
    font-size: 10px;
    line-height: 1.45;
    color: var(--rpg-text-secondary);
    text-align: center;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
    padding-top: 0;
  }

  .primary-btn {
    padding: 8px 18px;
    border: none;
    border-radius: 999px;
    background: var(--rpg-primary-gradient);
    color: var(--color-primary-content);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 14px color-mix(in oklch, var(--rpg-primary) 28%, transparent);
    transition:
      transform 0.15s,
      box-shadow 0.2s;
  }

  .primary-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px color-mix(in oklch, var(--rpg-primary) 34%, transparent);
  }

  .ios-panel {
    padding: 20px 16px 18px;
    text-align: center;
    font-size: 13px;
    line-height: 1.55;
    color: var(--rpg-text-body);
  }

  .ios-sub {
    margin-top: 8px;
    font-size: 12px;
    color: var(--rpg-text-secondary);
  }

  .ghost-btn {
    margin-top: 12px;
    padding: 8px 16px;
    border: 1px solid var(--rpg-border-subtle);
    border-radius: 999px;
    background: transparent;
    color: var(--rpg-text-body);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .recharge-enter-active,
  .recharge-leave-active {
    transition: opacity 0.25s ease;
  }

  .recharge-enter-active .recharge-modal,
  .recharge-leave-active .recharge-modal {
    transition:
      transform 0.28s cubic-bezier(0.34, 1.2, 0.64, 1),
      opacity 0.25s ease;
  }

  .recharge-enter-from,
  .recharge-leave-to {
    opacity: 0;
  }

  .recharge-enter-from .recharge-modal,
  .recharge-leave-to .recharge-modal {
    transform: scale(0.94) translateY(10px);
    opacity: 0;
  }

  @media (max-width: 520px) {
    .recharge-modal {
      width: min(100%, 368px);
      max-height: none;
    }

    .modal-main {
      grid-template-columns: 1fr;
    }

    .preview-pill {
      margin-top: 0;
    }
  }
</style>
