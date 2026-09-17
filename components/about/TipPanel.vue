<script setup lang="ts">
/**
   * 关于页「请作者喝咖啡」：支付宝赞赏 + 公开流水
   * 数据来源：/site/tip/create|status|list（pay_order bizType=site_tip，不发钻）
   */
import QRCode from 'qrcode';
import {
  createSiteTipOrder,
  getSiteTipList,
  getSiteTipStatus,
  type SiteTipCreateResult,
  type SiteTipLedgerItem,
} from '~~/api/site-tip';
import {
  SITE_TIP_ALIPAY_HINT,
  SITE_TIP_AMOUNT_OPTIONS,
  SITE_TIP_ANONYMOUS_NAME,
  SITE_TIP_DEFAULT_AMOUNT,
  SITE_TIP_DEFAULT_MESSAGE,
  SITE_TIP_DISPLAY_NAME_MAX,
  SITE_TIP_MAX_YUAN,
  SITE_TIP_MESSAGE_MAX,
  SITE_TIP_MIN_YUAN,
  SITE_TIP_TITLE,
  isSameTipYuan,
  isTipYuanInRange,
  parseTipYuanInput,
} from '~~/constants/site-tip';
import { messageError, messageSuccess } from '~~/utils/toast';

const userInfo = useUserInfo();

type AmountMode = 'preset' | 'custom';

const amountMode = ref<AmountMode>('preset');
const selectedPreset = ref(SITE_TIP_DEFAULT_AMOUNT);
const customAmountInput = ref('');
const confirmedAmount = ref<number | null>(null);
const needsReconfirm = ref(false);
const displayName = ref(SITE_TIP_ANONYMOUS_NAME);
const tipMessage = ref(SITE_TIP_DEFAULT_MESSAGE);
const loading = ref(false);
const paid = ref(false);
const orderInfo = ref<SiteTipCreateResult | null>(null);
const qrContainerRef = ref<HTMLElement>();
const qrError = ref('');
const ledger = ref<SiteTipLedgerItem[]>([]);
const ledgerLoading = ref(false);
const ledgerPage = ref(1);
const ledgerTotal = ref(0);
const ledgerPageSize = 10;

let pollTimer: ReturnType<typeof setInterval> | null = null;

/** 登录预填昵称；未登录默认匿名（均可手动改） */
const syncDefaultDisplayName = () => {
  const nick = String(userInfo.value?.nickname || '').trim();
  if (nick) {
    displayName.value = nick.slice(0, SITE_TIP_DISPLAY_NAME_MAX);
  }
  else if (!displayName.value.trim()) {
    displayName.value = SITE_TIP_ANONYMOUS_NAME;
  }
};

/** 当前生效金额（元） */
const resolvedAmount = computed((): number | null => {
  if (amountMode.value === 'preset') return selectedPreset.value;
  const parsed = parseTipYuanInput(customAmountInput.value);
  if (parsed === null || !isTipYuanInRange(parsed)) return null;
  return parsed;
});

const isAmountValid = computed(() => resolvedAmount.value !== null);

const isAmountConfirmed = computed(() => {
  const amount = resolvedAmount.value;
  return (
    amount !== null
    && confirmedAmount.value !== null
    && isSameTipYuan(confirmedAmount.value, amount)
  );
});

const customAmountHint = computed(
  () => `请输入 ${SITE_TIP_MIN_YUAN}~${SITE_TIP_MAX_YUAN} 元，最多两位小数`,
);

const pendingQrHint = computed(() => {
  if (!isAmountValid.value) {
    return amountMode.value === 'custom' ? customAmountHint.value : '请选择赞赏金额';
  }
  if (!isAmountConfirmed.value) {
    return needsReconfirm.value
      ? '金额已变更，请重新点击确定'
      : '确认金额后点击「确定生成二维码」';
  }
  return '';
});

/** 清空二维码与订单展示 */
const clearOrderDisplay = () => {
  orderInfo.value = null;
  qrError.value = '';
  paid.value = false;
  stopPolling();
  if (qrContainerRef.value) qrContainerRef.value.innerHTML = '';
};

/** 金额变更后作废已确认订单 */
const invalidateConfirmedOrder = () => {
  if (confirmedAmount.value === null) return;
  needsReconfirm.value = true;
  confirmedAmount.value = null;
  clearOrderDisplay();
};

/** 选择预设金额 */
const selectPresetAmount = (amount: number) => {
  amountMode.value = 'preset';
  if (confirmedAmount.value !== null && !isSameTipYuan(confirmedAmount.value, amount)) {
    invalidateConfirmedOrder();
  }
  selectedPreset.value = amount;
};

/** 切换自定义金额 */
const selectCustomAmountMode = () => {
  amountMode.value = 'custom';
  confirmedAmount.value = null;
  needsReconfirm.value = false;
  clearOrderDisplay();
  if (!String(customAmountInput.value ?? '').trim()) {
    customAmountInput.value = String(selectedPreset.value);
  }
};

/** 自定义输入封顶并在变更后要求重确认 */
const handleCustomAmountInput = () => {
  if (amountMode.value !== 'custom') return;
  const parsed = parseTipYuanInput(customAmountInput.value);
  if (parsed !== null && parsed > SITE_TIP_MAX_YUAN) {
    customAmountInput.value = String(SITE_TIP_MAX_YUAN);
  }
  if (
    confirmedAmount.value !== null
    && resolvedAmount.value !== null
    && !isSameTipYuan(resolvedAmount.value, confirmedAmount.value)
  ) {
    invalidateConfirmedOrder();
  }
};

/** 渲染支付宝拉起链接为二维码 */
const renderQrCode = async (url: string) => {
  qrError.value = '';
  if (!qrContainerRef.value) throw new Error('二维码容器未就绪');
  qrContainerRef.value.innerHTML = '';
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, url, { width: 148, margin: 1 });
  qrContainerRef.value.appendChild(canvas);
};

/** 停止支付状态轮询 */
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
};

/** 轮询赞赏状态；成功后刷新流水 */
const startPolling = (outTradeNo: string) => {
  stopPolling();
  pollTimer = setInterval(async () => {
    try {
      const res = (await getSiteTipStatus(outTradeNo)) as any;
      const data = res?.data ?? res;
      if (data?.status === 'PAID') {
        paid.value = true;
        stopPolling();
        messageSuccess('感谢打赏！');
        await loadLedger(1);
      }
      else if (data?.status && data.status !== 'PENDING') {
        stopPolling();
      }
    }
    catch {
      // 轮询失败不打断扫码，下次再试
    }
  }, 2500);
};

/** 确认金额并创建意向单 */
const confirmAmount = async () => {
  const amount = resolvedAmount.value;
  if (amount === null) {
    messageError(amountMode.value === 'custom' ? customAmountHint.value : '请选择赞赏金额');
    return;
  }
  if (
    confirmedAmount.value !== null
    && isSameTipYuan(confirmedAmount.value, amount)
    && orderInfo.value?.outTradeNo
  ) {
    return;
  }
  confirmedAmount.value = amount;
  needsReconfirm.value = false;
  await prepareOrder();
};

/** 建单并展示二维码 */
const prepareOrder = async () => {
  const amount = confirmedAmount.value;
  if (amount === null) {
    clearOrderDisplay();
    return;
  }

  loading.value = true;
  paid.value = false;
  orderInfo.value = null;
  qrError.value = '';
  stopPolling();
  if (qrContainerRef.value) qrContainerRef.value.innerHTML = '';

  try {
    const name = String(displayName.value || '').trim() || SITE_TIP_ANONYMOUS_NAME;
    const message
      = String(tipMessage.value || '')
        .trim()
        .slice(0, SITE_TIP_MESSAGE_MAX) || SITE_TIP_DEFAULT_MESSAGE;
    const res = (await createSiteTipOrder({
      amountYuan: amount,
      displayName: name.slice(0, SITE_TIP_DISPLAY_NAME_MAX),
      message,
    })) as any;
    const data = (res?.data ?? res) as SiteTipCreateResult;
    if (!data?.universalLink || !data?.outTradeNo) {
      throw new Error('创建赞赏订单失败');
    }
    orderInfo.value = data;
    await nextTick();
    await renderQrCode(data.universalLink);
    startPolling(data.outTradeNo);
  }
  catch (err: any) {
    qrError.value = err?.message || '二维码生成失败';
    messageError(err?.message || '创建赞赏订单失败，请稍后重试');
  }
  finally {
    loading.value = false;
  }
};

/** 加载公开赞赏流水 */
const loadLedger = async (page = ledgerPage.value) => {
  ledgerLoading.value = true;
  try {
    const res = (await getSiteTipList({ page, pageSize: ledgerPageSize })) as any;
    const data = res?.data ?? res;
    ledger.value = Array.isArray(data?.list) ? data.list : [];
    ledgerPage.value = page;
    ledgerTotal.value = Number(data?.pagination?.total ?? ledger.value.length) || 0;
  }
  catch (err: any) {
    messageError(err?.message || '加载打赏流水失败');
  }
  finally {
    ledgerLoading.value = false;
  }
};

/** 格式化流水时间 */
const formatPaidAt = (raw: string) => {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

watch(
  () => userInfo.value?.nickname,
  () => syncDefaultDisplayName(),
  { immediate: true },
);

onMounted(() => {
  syncDefaultDisplayName();
  void loadLedger(1);
});

onBeforeUnmount(() => {
  stopPolling();
});
</script>

<template>
  <!-- class about-tip：关于页锚点高亮依赖此选择器 -->
  <CyberCard class="about-tip !p-0 overflow-hidden transition-shadow duration-300">
    <div class="relative overflow-hidden border-b border-tech px-4 pb-4 pt-[1.15rem] md:px-5">
      <div class="about-tip-banner-grid" aria-hidden="true" />
      <p class="cyber-section-label relative mb-1.5">
        TIP CHANNEL
      </p>
      <h2 class="relative m-0 text-xl font-bold tracking-wide md:text-[1.35rem]">
        <span class="cyber-gradient-text">{{ SITE_TIP_TITLE }}</span>
      </h2>
      <p class="relative mt-2 max-w-xl text-sm leading-relaxed text-tech-muted">
        若文章或站点对你有帮助，可通过支付宝请作者喝杯咖啡。打赏记录将公开展示。
      </p>
    </div>

    <div class="p-4 md:px-5 md:pb-5 md:pt-[1.15rem]">
      <div class="grid gap-4 md:grid-cols-2 md:items-stretch">
        <section class="rounded-2xl border border-tech bg-white/5 p-4">
          <header class="mb-3.5 flex items-baseline gap-2">
            <span class="cyber-section-label">PAY</span>
            <span class="text-sm font-semibold text-tech">发起赞赏</span>
          </header>

          <label class="mb-1.5 block text-xs tracking-wide text-tech-muted" for="about-tip-name">
            打赏人
          </label>
          <input
            id="about-tip-name"
            v-model="displayName"
            class="input input-bordered login-input w-full"
            type="text"
            :maxlength="SITE_TIP_DISPLAY_NAME_MAX"
            :placeholder="SITE_TIP_ANONYMOUS_NAME"
          >

          <label
            class="mb-1.5 mt-4 block text-xs tracking-wide text-tech-muted"
            for="about-tip-message"
          >
            留言
          </label>
          <input
            id="about-tip-message"
            v-model="tipMessage"
            class="input input-bordered login-input w-full"
            type="text"
            :maxlength="SITE_TIP_MESSAGE_MAX"
            :placeholder="SITE_TIP_DEFAULT_MESSAGE"
          >

          <div class="mb-1.5 mt-4 text-xs tracking-wide text-tech-muted">
            金额档位
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="amount in SITE_TIP_AMOUNT_OPTIONS"
              :key="amount"
              type="button"
              class="about-tip-chip"
              :class="{
                'is-active': amountMode === 'preset' && isSameTipYuan(selectedPreset, amount),
              }"
              @click="selectPresetAmount(amount)"
            >
              <span class="mr-0.5 opacity-70">¥</span>{{ amount }}
            </button>
            <button
              type="button"
              class="about-tip-chip"
              :class="{ 'is-active': amountMode === 'custom' }"
              @click="selectCustomAmountMode"
            >
              自定义
            </button>
          </div>
          <input
            v-if="amountMode === 'custom'"
            v-model="customAmountInput"
            class="input input-bordered login-input mt-2 w-full"
            type="text"
            inputmode="decimal"
            :placeholder="customAmountHint"
            @input="handleCustomAmountInput"
          >

          <CyberButton
            type="button"
            class="mt-4 w-full text-sm disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:brightness-100"
            :disabled="loading || !isAmountValid"
            @click="confirmAmount"
          >
            {{ loading ? '生成中…' : '确定生成二维码' }}
          </CyberButton>

          <div
            class="about-tip-qr-frame relative mt-4 flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-tech px-3 py-4"
          >
            <div class="about-tip-qr-corners" aria-hidden="true" />
            <p
              v-if="pendingQrHint"
              class="relative m-0 text-center text-sm leading-snug text-tech-muted"
            >
              {{ pendingQrHint }}
            </p>
            <p
              v-else-if="paid"
              class="relative m-0 text-center text-sm font-semibold leading-snug text-success"
            >
              支付成功，感谢支持！
            </p>
            <template v-else>
              <div
                ref="qrContainerRef"
                class="relative flex min-h-[148px] items-center justify-center rounded-lg bg-white p-1.5"
              />
              <p v-if="qrError" class="relative m-0 text-center text-sm leading-snug text-error">
                {{ qrError }}
              </p>
              <p
                v-else-if="orderInfo"
                class="relative m-0 text-center text-sm leading-snug text-tech-muted"
              >
                {{ SITE_TIP_ALIPAY_HINT }} · ¥{{ orderInfo.amountYuan.toFixed(2) }}
              </p>
            </template>
          </div>
        </section>

        <section class="rounded-2xl border border-tech bg-white/5 p-4">
          <header class="mb-3.5 flex items-center justify-between gap-3">
            <div class="flex items-baseline gap-2">
              <span class="cyber-section-label">LEDGER</span>
              <span class="text-sm font-semibold text-tech">公开流水</span>
            </div>
            <button
              type="button"
              class="btn btn-ghost btn-xs border border-tech text-tech-muted"
              :disabled="ledgerLoading"
              @click="loadLedger(ledgerPage)"
            >
              刷新
            </button>
          </header>

          <p
            v-if="ledgerLoading && !ledger.length"
            class="m-0 text-left text-sm leading-snug text-tech-muted"
          >
            同步中…
          </p>
          <p v-else-if="!ledger.length" class="m-0 text-left text-sm leading-snug text-tech-muted">
            还没有打赏记录，来做第一个吧
          </p>
          <ul v-else class="m-0 flex max-h-[22rem] list-none flex-col gap-2 overflow-auto p-0">
            <li
              v-for="(item, idx) in ledger"
              :key="`${item.paidAt}-${idx}`"
              class="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 rounded-xl border border-tech bg-white/5 px-3 py-2.5 text-sm"
            >
              <span class="truncate font-semibold text-tech">{{ item.displayName }}</span>
              <span class="font-bold tabular-nums text-[var(--tech-gradient-from)]">
                ¥{{ Number(item.amountYuan).toFixed(2) }}
              </span>
              <span class="col-span-full truncate text-xs leading-snug text-tech opacity-90">
                {{ item.message }}
              </span>
              <span class="col-span-full text-xs tracking-wide text-tech-muted">
                {{ formatPaidAt(item.paidAt) }}
              </span>
            </li>
          </ul>
          <div
            v-if="ledgerTotal > ledgerPageSize"
            class="mt-3.5 flex items-center justify-center gap-3"
          >
            <button
              type="button"
              class="btn btn-ghost btn-xs border border-tech text-tech-muted"
              :disabled="ledgerPage <= 1 || ledgerLoading"
              @click="loadLedger(ledgerPage - 1)"
            >
              上一页
            </button>
            <span class="text-sm text-tech-muted">
              {{ ledgerPage }} / {{ Math.ceil(ledgerTotal / ledgerPageSize) }}
            </span>
            <button
              type="button"
              class="btn btn-ghost btn-xs border border-tech text-tech-muted"
              :disabled="ledgerPage * ledgerPageSize >= ledgerTotal || ledgerLoading"
              @click="loadLedger(ledgerPage + 1)"
            >
              下一页
            </button>
          </div>
        </section>
      </div>
    </div>
  </CyberCard>
</template>

<style scoped lang="less">
  /* 仅保留 utility 难表达的装饰：网格渐隐、金额 chip、扫码框角标/光晕 */
  .about-tip-banner-grid {
    position: absolute;
    inset: 0;
    opacity: 0.35;
    pointer-events: none;
    background-image:
      linear-gradient(var(--tech-grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--tech-grid-line) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: linear-gradient(180deg, #000 30%, transparent 100%);
  }

  .about-tip-chip {
    border: 1px solid var(--tech-border);
    border-radius: 0.7rem;
    background: transparent;
    color: var(--tech-fg);
    padding: 0.4rem 0.7rem;
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition:
      border-color 0.2s,
      background-color 0.2s,
      color 0.2s,
      box-shadow 0.2s;

    &:hover {
      border-color: color-mix(in srgb, var(--tech-border) 50%, var(--tech-gradient-from) 50%);
    }

    &.is-active {
      border-color: color-mix(in srgb, var(--tech-gradient-from) 70%, var(--tech-border));
      background: color-mix(in srgb, var(--tech-glow-cyan) 55%, transparent);
      color: var(--tech-gradient-from);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tech-gradient-from) 25%, transparent);
    }
  }

  .about-tip-qr-frame {
    background: radial-gradient(
      circle at 50% 20%,
      color-mix(in srgb, var(--tech-glow-cyan) 70%, transparent),
      transparent 65%
    );
  }

  .about-tip-qr-corners {
    position: absolute;
    inset: 0.45rem;
    pointer-events: none;
    opacity: 0.75;
    background:
      linear-gradient(var(--tech-gradient-from), var(--tech-gradient-from)) left top / 12px 1.5px
        no-repeat,
      linear-gradient(var(--tech-gradient-from), var(--tech-gradient-from)) left top / 1.5px 12px
        no-repeat,
      linear-gradient(var(--tech-gradient-from), var(--tech-gradient-from)) right top / 12px 1.5px
        no-repeat,
      linear-gradient(var(--tech-gradient-from), var(--tech-gradient-from)) right top / 1.5px 12px
        no-repeat,
      linear-gradient(var(--tech-gradient-from), var(--tech-gradient-from)) left bottom / 12px 1.5px
        no-repeat,
      linear-gradient(var(--tech-gradient-from), var(--tech-gradient-from)) left bottom / 1.5px 12px
        no-repeat,
      linear-gradient(var(--tech-gradient-from), var(--tech-gradient-from)) right bottom / 12px
        1.5px no-repeat,
      linear-gradient(var(--tech-gradient-from), var(--tech-gradient-from)) right bottom / 1.5px
        12px no-repeat;
  }
</style>
