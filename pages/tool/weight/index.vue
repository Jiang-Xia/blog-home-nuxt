<!--
  体重记录工具：未登录 localStorage；登录后同步 Nest /health/weight/*。
  趋势图按需 echarts；录入走弹框；历史表用 daisyUI table/badge；其余沿用本页视觉。
  状态与持久化见 useWeightTracker。
-->
<script setup lang="ts">
import WeightTrendChart from './components/WeightTrendChart.client.vue';
import {
  toWeightDateKey,
  useWeightTracker,
  type WeightEntry,
} from '@/composables/use-weight-tracker';

definePageMeta({
  layout: 'default',
});

useHead({
  title: '体重记录',
});

type RangeKey = '7' | '30' | '90' | 'all';

/** 国内常用 BMI 分档（展示文案，非医疗诊断）；tone 对齐 daisyUI badge-* */
function bmiBand(value: number): {
  label: string;
  tone: 'info' | 'success' | 'warning' | 'error';
} {
  if (value < 18.5) return { label: '偏瘦', tone: 'info' };
  if (value < 24) return { label: '正常', tone: 'success' };
  if (value < 28) return { label: '超重', tone: 'warning' };
  return { label: '肥胖', tone: 'error' };
}

/** BMI = kg / m² */
function calcBmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  if (m <= 0) return 0;
  return weightKg / (m * m);
}

function formatDelta(kg: number): string {
  const sign = kg > 0 ? '+' : '';
  return `${sign}${kg.toFixed(1)} kg`;
}

const {
  profile,
  entries,
  syncStatus,
  syncError,
  pendingUploadConfirm,
  isLoggedIn,
  hydrate,
  saveProfileRemote,
  upsertEntryLocalThenRemote,
  removeEntryById,
  resetDemoLocal,
  clearAllData,
  mergeImportedEntries,
  confirmUploadLocal,
  dismissUploadLocal,
  retrySync,
} = useWeightTracker();

const range = ref<RangeKey>('30');
const showEntryModal = ref(false);
const showProfileModal = ref(false);
const showClearModal = ref(false);
const clearing = ref(false);
const draftDate = ref('');
const draftWeight = ref('');
const draftNote = ref('');
/** 编辑中的原日期：保存时若改日则删旧日，避免留下重复 */
const editingOriginalDate = ref<string | null>(null);
const entryError = ref('');
const csvInputRef = ref<HTMLInputElement | null>(null);

/** 历史分页（客户端切片，控件用 daisyUI join / XiaPagination） */
const HISTORY_PAGE_SIZE = 10;
const historyPage = ref(1);

const sortedEntries = computed(() =>
  [...entries.value].sort((a, b) => a.date.localeCompare(b.date)),
);

const latest = computed(() => {
  const list = sortedEntries.value;
  return list.length ? list[list.length - 1] : null;
});

const prev = computed(() => {
  const list = sortedEntries.value;
  return list.length >= 2 ? list[list.length - 2] : null;
});

const currentBmi = computed(() => {
  if (!latest.value) return 0;
  return calcBmi(latest.value.weightKg, profile.value.heightCm);
});

const band = computed(() => bmiBand(currentBmi.value));

const vsTarget = computed(() => {
  if (!latest.value) return 0;
  return latest.value.weightKg - profile.value.targetKg;
});

const vsPrev = computed(() => {
  if (!latest.value || !prev.value) return null;
  return latest.value.weightKg - prev.value.weightKg;
});

/** 按区间过滤后的打卡点 */
const filtered = computed(() => {
  const list = sortedEntries.value;
  if (range.value === 'all') return list;
  const n = Number(range.value);
  const now = Date.now();
  return list.filter((e) => {
    const t = new Date(`${e.date}T00:00:00`).getTime();
    return (now - t) / (1000 * 60 * 60 * 24) <= n;
  });
});

const chartDates = computed(() => filtered.value.map(e => e.date));
const chartWeights = computed(() => filtered.value.map(e => e.weightKg));

/** 区间斜率 kg/周（首尾连线） */
const weeklySlope = computed(() => {
  const list = filtered.value;
  if (list.length < 2) return null;
  const first = list[0];
  const last = list[list.length - 1];
  const daySpan = Math.max(
    1,
    (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24),
  );
  return ((last.weightKg - first.weightKg) / daySpan) * 7;
});

const rangeDelta = computed(() => {
  const list = filtered.value;
  if (list.length < 2) return null;
  return list[list.length - 1].weightKg - list[0].weightKg;
});

const etaWeeks = computed(() => {
  const slope = weeklySlope.value;
  if (slope == null || slope >= -0.05 || vsTarget.value <= 0) return null;
  return Math.ceil(vsTarget.value / Math.abs(slope));
});

/** 历史全量（新→旧） */
const historyAll = computed(() => [...sortedEntries.value].reverse());

const historyTotal = computed(() => historyAll.value.length);

/** 当前页历史行（附带 BMI / 分档，供 daisyUI badge 展示） */
const historyPageRows = computed(() => {
  const start = (historyPage.value - 1) * HISTORY_PAGE_SIZE;
  return historyAll.value.slice(start, start + HISTORY_PAGE_SIZE).map((e) => {
    const bmi = calcBmi(e.weightKg, profile.value.heightCm);
    const band = bmiBand(bmi);
    return { entry: e, bmi, band };
  });
});

/** 总页数变化时把当前页钳制在合法范围 */
watch(historyTotal, (total) => {
  const maxPage = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE) || 1);
  if (historyPage.value > maxPage) historyPage.value = maxPage;
});

/** 同步状态展示文案 */
const syncHint = computed(() => {
  if (!isLoggedIn.value) {
    return '未登录：数据仅保存在本浏览器。登录后可多设备同步。';
  }
  if (syncStatus.value === 'syncing') return '正在与云端同步…';
  if (syncStatus.value === 'error') {
    return `同步异常：${syncError.value || '请重试'}（本机改动已保留）`;
  }
  if (syncStatus.value === 'synced') return '已登录：云端为权威数据，本机作缓存。';
  return '已登录，等待同步。';
});

/** 打开录入弹框（可选带入某日编辑；日期可手动改） */
function openEntryModal(entry?: WeightEntry) {
  entryError.value = '';
  if (entry) {
    editingOriginalDate.value = entry.date;
    draftDate.value = entry.date;
    draftWeight.value = String(entry.weightKg);
    draftNote.value = entry.note || '';
  }
  else {
    editingOriginalDate.value = null;
    draftDate.value = toWeightDateKey(new Date());
    draftWeight.value = latest.value ? String(latest.value.weightKg) : '';
    draftNote.value = '';
  }
  showEntryModal.value = true;
}

/** 关闭录入弹框 */
function closeEntryModal() {
  showEntryModal.value = false;
  entryError.value = '';
  editingOriginalDate.value = null;
}

/** 保存或覆盖；若编辑时改了日期，先写新日再删旧日 */
async function saveEntry() {
  const weightKg = Number(draftWeight.value);
  const note = draftNote.value.trim();
  const nextDate = draftDate.value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDate)) {
    entryError.value = '请选择或填写有效日期（YYYY-MM-DD）';
    return;
  }
  const ok = await upsertEntryLocalThenRemote({
    date: nextDate,
    weightKg,
    note: note || undefined,
  });
  if (!ok) {
    entryError.value = '请填写有效日期与体重（20–300 kg）';
    return;
  }
  const prevDate = editingOriginalDate.value;
  if (prevDate && prevDate !== nextDate) {
    const orphan = entries.value.find(e => e.date === prevDate);
    if (orphan) await removeEntryById(orphan.id);
  }
  closeEntryModal();
}

/** 历史分页切换 */
function onHistoryPageChange(page: number) {
  historyPage.value = page;
}

/** 删除单条 */
async function removeEntry(id: string) {
  await removeEntryById(id);
}

/** 重置为演示数据 */
function resetDemo() {
  resetDemoLocal();
}

/** 打开 daisyUI 清空确认框（与录入弹框同风格，非原生 confirm） */
function openClearModal() {
  showClearModal.value = true;
}

/** 关闭清空确认框 */
function closeClearModal() {
  if (clearing.value) return;
  showClearModal.value = false;
}

/** 确认清空：本机必清；登录时同步删云端 */
async function confirmClearAll() {
  if (clearing.value) return;
  clearing.value = true;
  try {
    await clearAllData();
    showClearModal.value = false;
  }
  finally {
    clearing.value = false;
  }
}

/** 清空确认文案 */
const clearModalDesc = computed(() =>
  isLoggedIn.value
    ? '将删除本机与云端的全部体重打卡和档案，此操作不可恢复。'
    : '将删除本机全部体重打卡和档案。',
);

/** 导出 CSV */
function exportCsv() {
  const lines = ['date,weightKg,bmi,note'];
  for (const e of sortedEntries.value) {
    const b = calcBmi(e.weightKg, profile.value.heightCm).toFixed(2);
    const note = (e.note || '').replace(/"/g, '""');
    lines.push(`${e.date},${e.weightKg},${b},"${note}"`);
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `weight-${toWeightDateKey(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** 触发隐藏 file input，导入本工具导出的 CSV */
function triggerImportCsv() {
  csvInputRef.value?.click();
}

/**
   * 解析 CSV 行（支持引号内逗号）；按 date 合并覆盖本地同日记录。
   * 兼容表头 date,weightKg[,bmi][,note]
   */
function parseWeightCsv(text: string): WeightEntry[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter(l => l.trim());
  if (!lines.length) return [];
  const split = (line: string) => {
    const cells: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        }
        else {
          inQ = !inQ;
        }
      }
      else if (ch === ',' && !inQ) {
        cells.push(cur);
        cur = '';
      }
      else {
        cur += ch;
      }
    }
    cells.push(cur);
    return cells;
  };
  let start = 0;
  const head = split(lines[0]).map(c => c.trim().toLowerCase());
  if (head[0] === 'date' || head.includes('weightkg') || head.includes('weight')) start = 1;
  const now = new Date().toISOString();
  const out: WeightEntry[] = [];
  for (let i = start; i < lines.length; i++) {
    const cols = split(lines[i]);
    const date = (cols[0] || '').trim();
    const weightKg = Number(cols[1]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 300) continue;
    let note = '';
    if (cols.length >= 4) note = (cols[3] || '').trim();
    else if (cols.length === 3 && !/^\d+(\.\d+)?$/.test((cols[2] || '').trim())) {
      note = (cols[2] || '').trim();
    }
    out.push({
      id: `import-${date}-${i}`,
      date,
      weightKg: Math.round(weightKg * 10) / 10,
      note: note || undefined,
      createdAt: now,
      updatedAt: now,
    });
  }
  return out;
}

/** 读取所选 CSV 并合并；登录时走 sync */
async function onCsvFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  try {
    const text = await file.text();
    const imported = parseWeightCsv(text);
    if (!imported.length) {
      alert('未解析到有效记录，请确认 CSV 含 date,weightKg 列');
      return;
    }
    await mergeImportedEntries(imported);
  }
  catch {
    alert('读取 CSV 失败');
  }
}

/** 弹框内体重 ±0.1 */
function nudgeWeight(delta: number) {
  const cur = Number(draftWeight.value);
  const base = Number.isFinite(cur) ? cur : (latest.value?.weightKg ?? 70);
  const next = Math.min(300, Math.max(20, Math.round((base + delta) * 10) / 10));
  draftWeight.value = String(next);
}

/** 保存档案并关弹框 */
async function saveProfile() {
  if (
    !Number.isFinite(profile.value.heightCm)
    || profile.value.heightCm < 100
    || profile.value.heightCm > 250
  ) {
    return;
  }
  await saveProfileRemote();
  showProfileModal.value = false;
}

/** Esc 关闭弹框 */
function onGlobalKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return;
  if (showEntryModal.value) closeEntryModal();
  if (showProfileModal.value) showProfileModal.value = false;
  if (showClearModal.value) closeClearModal();
}

onMounted(async () => {
  await hydrate();
  window.addEventListener('keydown', onGlobalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown);
  if (import.meta.client) document.documentElement.style.overflow = '';
});

/** 全屏弹层打开时锁住页面滚动 */
watch(
  [showEntryModal, showProfileModal, pendingUploadConfirm, showClearModal],
  ([entry, profileOpen, upload, clearOpen]) => {
    if (!import.meta.client) return;
    document.documentElement.style.overflow
      = entry || profileOpen || upload || clearOpen ? 'hidden' : '';
  },
);
</script>

<template>
  <div class="weight-page space-y-5 sm:space-y-6">
    <div class="weight-hero flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <CyberSectionHeader
        align="left"
        label="HEALTH"
        title="体重记录"
        subtitle="本地 / 登录云同步 · ECharts 趋势 · BMI 分析（非医疗建议）"
      />
      <div class="flex flex-wrap gap-2">
        <CyberButton
          v-if="isLoggedIn && syncStatus === 'error'"
          variant="secondary"
          class="!py-2 !text-sm"
          @click="retrySync"
        >
          重试同步
        </CyberButton>
        <CyberButton variant="secondary" class="!py-2 !text-sm" @click="showProfileModal = true">
          档案设置
        </CyberButton>
        <CyberButton variant="primary" class="!py-2 !text-sm" @click="openEntryModal()">
          记录体重
        </CyberButton>
      </div>
    </div>

    <div
      class="weight-hint"
      :class="{
        'weight-hint--ok': syncStatus === 'synced',
        'weight-hint--err': syncStatus === 'error',
      }"
    >
      {{ syncHint }}
    </div>

    <!-- 同一 4 列网格：分析摘要与「区间斜率」同宽对齐，趋势图占左三列 -->
    <div class="weight-board grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
      <div class="weight-stat weight-stat--accent">
        <p class="weight-stat__label">
          当前体重
        </p>
        <p class="weight-stat__value">
          {{ latest ? `${latest.weightKg.toFixed(1)}` : '—' }}
          <span v-if="latest" class="weight-stat__unit">kg</span>
        </p>
        <p class="weight-stat__meta">
          {{ vsPrev == null ? '暂无对比' : `较上次 ${formatDelta(vsPrev)}` }}
        </p>
      </div>
      <div class="weight-stat">
        <p class="weight-stat__label">
          BMI
        </p>
        <p
          class="weight-stat__value"
          :class="{
            'is-info': band.tone === 'info',
            'is-success': band.tone === 'success',
            'is-warning': band.tone === 'warning',
            'is-error': band.tone === 'error',
          }"
        >
          {{ latest ? currentBmi.toFixed(1) : '—' }}
        </p>
        <p class="weight-stat__meta">
          {{ latest ? band.label : '需先打卡' }}
          · 身高 {{ profile.heightCm }} cm
        </p>
      </div>
      <div class="weight-stat">
        <p class="weight-stat__label">
          距目标
        </p>
        <p class="weight-stat__value">
          {{ latest ? formatDelta(vsTarget) : '—' }}
        </p>
        <p class="weight-stat__meta">
          目标 {{ profile.targetKg }} kg
        </p>
      </div>
      <div class="weight-stat">
        <p class="weight-stat__label">
          区间斜率
        </p>
        <p class="weight-stat__value weight-stat__value--sm">
          {{ weeklySlope == null ? '—' : `${formatDelta(weeklySlope)}/周` }}
        </p>
        <p class="weight-stat__meta">
          {{ rangeDelta == null ? '样本不足' : `累计 ${formatDelta(rangeDelta)}` }}
        </p>
      </div>

      <div class="weight-panel weight-panel--chart min-w-0 sm:col-span-2 xl:col-span-3">
        <div class="weight-panel__head">
          <div>
            <p class="weight-panel__eyebrow">
              TREND
            </p>
            <h3 class="weight-panel__title">
              体重趋势
            </h3>
          </div>
          <div class="weight-range">
            <button
              v-for="opt in [
                { k: '7', t: '7 天' },
                { k: '30', t: '30 天' },
                { k: '90', t: '90 天' },
                { k: 'all', t: '全部' },
              ]"
              :key="opt.k"
              type="button"
              class="weight-range__btn"
              :class="{ 'is-active': range === opt.k }"
              @click="range = opt.k as RangeKey"
            >
              {{ opt.t }}
            </button>
          </div>
        </div>
        <ClientOnly>
          <WeightTrendChart
            :dates="chartDates"
            :weights="chartWeights"
            :target-kg="profile.targetKg"
            :height="320"
          />
          <template #fallback>
            <div class="weight-chart-fallback">
              图表加载中…
            </div>
          </template>
        </ClientOnly>
      </div>

      <aside class="weight-panel weight-panel--insight min-w-0 sm:col-span-2 xl:col-span-1">
        <p class="weight-panel__eyebrow">
          INSIGHT
        </p>
        <h3 class="weight-panel__title">
          分析摘要
        </h3>
        <div class="weight-insight space-y-3">
          <template v-if="latest">
            <p>
              当前 BMI <strong>{{ currentBmi.toFixed(1) }}</strong>，属于「{{ band.label }}」 （参考正常约 18.5–24）。
            </p>
            <p v-if="weeklySlope != null">
              所选区间约 <strong>{{ formatDelta(weeklySlope) }}/周</strong>
              <template v-if="weeklySlope < -0.1">
                ，下降较明显。
              </template>
              <template v-else-if="weeklySlope > 0.1">
                ，略有回升。
              </template>
              <template v-else>
                ，变化较平稳。
              </template>
            </p>
            <p v-if="etaWeeks != null">
              按近期斜率粗算，约 <strong>{{ etaWeeks }}</strong> 周可接近目标（仅估算）。
            </p>
            <p v-else-if="vsTarget <= 0">
              已达到或低于目标，可改为维持观察。
            </p>
          </template>
          <p v-else>
            打卡后将显示 BMI 与趋势结论。
          </p>
          <p class="weight-insight__disclaimer">
            仅供个人参考，不构成医疗建议。
          </p>
        </div>
        <CyberButton variant="primary" class="mt-5 w-full !py-2.5" @click="openEntryModal()">
          记录体重
        </CyberButton>
      </aside>
    </div>

    <div class="weight-panel">
      <div class="weight-panel__head">
        <div>
          <p class="weight-panel__eyebrow">
            HISTORY
          </p>
          <h3 class="weight-panel__title">
            历史记录
          </h3>
        </div>
        <div class="flex flex-wrap gap-2">
          <input
            ref="csvInputRef"
            type="file"
            accept=".csv,text/csv"
            class="hidden"
            @change="onCsvFileChange"
          >
          <CyberButton variant="secondary" class="!py-1.5 !text-sm" @click="exportCsv">
            导出 CSV
          </CyberButton>
          <CyberButton variant="secondary" class="!py-1.5 !text-sm" @click="triggerImportCsv">
            导入 CSV
          </CyberButton>
          <CyberButton variant="secondary" class="!py-1.5 !text-sm" @click="resetDemo">
            重置演示
          </CyberButton>
          <CyberButton variant="secondary" class="!py-1.5 !text-sm" @click="openClearModal">
            清空
          </CyberButton>
        </div>
      </div>
      <div class="overflow-x-auto rounded-box border border-base-300 bg-base-100">
        <table class="table table-zebra table-pin-rows table-sm">
          <thead>
            <tr class="bg-base-200 text-xs uppercase tracking-wide text-base-content/60">
              <th>日期</th>
              <th>体重</th>
              <th>BMI</th>
              <th>区间</th>
              <th>备注</th>
              <th class="w-28 text-right">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in historyPageRows" :key="row.entry.id" class="hover">
              <td class="font-mono text-sm whitespace-nowrap">
                {{ row.entry.date }}
              </td>
              <td class="font-semibold whitespace-nowrap">
                {{ row.entry.weightKg.toFixed(1) }}
                <span class="font-normal text-base-content/50">kg</span>
              </td>
              <td class="tabular-nums">
                {{ row.bmi.toFixed(1) }}
              </td>
              <td>
                <span
                  class="badge badge-sm"
                  :class="{
                    'badge-info': row.band.tone === 'info',
                    'badge-success': row.band.tone === 'success',
                    'badge-warning': row.band.tone === 'warning',
                    'badge-error': row.band.tone === 'error',
                  }"
                >
                  {{ row.band.label }}
                </span>
              </td>
              <td class="max-w-48 truncate text-base-content/70" :title="row.entry.note || ''">
                {{ row.entry.note || '—' }}
              </td>
              <td class="text-right">
                <div class="join">
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs join-item"
                    @click="openEntryModal(row.entry)"
                  >
                    改
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs join-item text-error"
                    @click="removeEntry(row.entry.id)"
                  >
                    删
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!historyPageRows.length">
              <td colspan="6" class="text-center text-base-content/40">
                暂无记录
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="historyTotal > HISTORY_PAGE_SIZE"
        class="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between"
      >
        <p class="text-xs text-tech-muted">
          共 {{ historyTotal }} 条 · 第 {{ historyPage }} /
          {{ Math.max(1, Math.ceil(historyTotal / HISTORY_PAGE_SIZE)) }} 页
        </p>
        <XiaPagination
          :key="`hp-${historyPage}-${historyTotal}`"
          :total="historyTotal"
          :page-size="HISTORY_PAGE_SIZE"
          :current-page="historyPage"
          :max="5"
          size="xs"
          prev
          next
          @change="onHistoryPageChange"
        />
      </div>
    </div>

    <!-- 挂到 body：相对视口居中的小弹框，避免页内滚动后看不到 -->
    <ClientOnly>
      <Teleport to="body">
        <dialog class="modal weight-tool-modal" :class="{ 'modal-open': showEntryModal }">
          <div class="modal-box weight-tool-modal__box max-w-md">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-bold text-tech">
                  记录体重
                </h3>
                <p class="mt-1 text-sm text-tech-muted">
                  日期可手动修改；同一天再次保存会覆盖该日记录。
                </p>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-circle btn-ghost"
                aria-label="关闭"
                @click="closeEntryModal"
              >
                ✕
              </button>
            </div>
            <div class="mt-4 space-y-3">
              <label class="form-control w-full">
                <span class="mb-1.5 text-xs text-tech-muted">日期（可改）</span>
                <div class="join w-full">
                  <input
                    v-model="draftDate"
                    type="date"
                    class="input input-bordered login-input join-item w-full min-w-0"
                  >
                  <button
                    type="button"
                    class="btn cyber-btn-secondary join-item shrink-0"
                    title="填入今天"
                    @click="draftDate = toWeightDateKey(new Date())"
                  >
                    今天
                  </button>
                </div>
              </label>
              <label class="form-control w-full">
                <span class="mb-1.5 text-xs text-tech-muted">体重 (kg)</span>
                <div class="weight-nudge">
                  <button type="button" class="weight-nudge__btn" @click="nudgeWeight(-0.1)">
                    −0.1
                  </button>
                  <input
                    v-model="draftWeight"
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    class="input input-bordered login-input w-full text-center text-lg font-semibold"
                    placeholder="例如 67.5"
                    @keyup.enter="saveEntry"
                  >
                  <button type="button" class="weight-nudge__btn" @click="nudgeWeight(0.1)">
                    +0.1
                  </button>
                </div>
              </label>
              <label class="form-control w-full">
                <span class="mb-1.5 text-xs text-tech-muted">备注（可选）</span>
                <input
                  v-model="draftNote"
                  type="text"
                  maxlength="40"
                  class="input input-bordered login-input w-full"
                  placeholder="聚餐 / 出差…"
                >
              </label>
              <p v-if="entryError" class="text-sm text-error">
                {{ entryError }}
              </p>
            </div>
            <div class="modal-action">
              <CyberButton variant="secondary" class="!py-2" @click="closeEntryModal">
                取消
              </CyberButton>
              <CyberButton variant="primary" class="!py-2" @click="saveEntry">
                保存
              </CyberButton>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop" @click="closeEntryModal">
            <button type="submit" class="hidden">
              close
            </button>
          </form>
        </dialog>

        <dialog class="modal weight-tool-modal" :class="{ 'modal-open': showProfileModal }">
          <div class="modal-box weight-tool-modal__box max-w-md">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-bold text-tech">
                  档案设置
                </h3>
                <p class="mt-1 text-sm text-tech-muted">
                  身高用于 BMI；目标体重会显示在趋势参考线上。
                </p>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-circle btn-ghost"
                aria-label="关闭"
                @click="showProfileModal = false"
              >
                ✕
              </button>
            </div>
            <div class="mt-4 space-y-3">
              <label class="form-control w-full">
                <span class="mb-1.5 text-xs text-tech-muted">身高 (cm)</span>
                <input
                  v-model.number="profile.heightCm"
                  type="number"
                  min="100"
                  max="250"
                  class="input input-bordered login-input w-full"
                >
              </label>
              <label class="form-control w-full">
                <span class="mb-1.5 text-xs text-tech-muted">目标体重 (kg)</span>
                <input
                  v-model.number="profile.targetKg"
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  class="input input-bordered login-input w-full"
                >
              </label>
            </div>
            <div class="modal-action">
              <CyberButton variant="secondary" class="!py-2" @click="showProfileModal = false">
                取消
              </CyberButton>
              <CyberButton variant="primary" class="!py-2" @click="saveProfile">
                保存
              </CyberButton>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop" @click="showProfileModal = false">
            <button type="submit" class="hidden">
              close
            </button>
          </form>
        </dialog>

        <dialog class="modal weight-tool-modal" :class="{ 'modal-open': pendingUploadConfirm }">
          <div class="modal-box weight-tool-modal__box max-w-md">
            <h3 class="text-lg font-bold text-tech">
              上传本机记录？
            </h3>
            <p class="mt-2 text-sm text-tech-muted">
              云端暂无打卡，本机有真实记录。上传后按日期合并（同日以较新为准）；演示数据不会上传。
            </p>
            <div class="modal-action">
              <CyberButton variant="secondary" class="!py-2" @click="dismissUploadLocal">
                仅用云端
              </CyberButton>
              <CyberButton variant="primary" class="!py-2" @click="confirmUploadLocal">
                上传本机
              </CyberButton>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop" @click="dismissUploadLocal">
            <button type="submit" class="hidden">
              close
            </button>
          </form>
        </dialog>

        <dialog class="modal weight-tool-modal" :class="{ 'modal-open': showClearModal }">
          <div class="modal-box weight-tool-modal__box max-w-md">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-bold text-tech">
                  清空体重数据
                </h3>
                <p class="mt-2 text-sm text-tech-muted">
                  {{ clearModalDesc }}
                </p>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-circle btn-ghost"
                aria-label="关闭"
                :disabled="clearing"
                @click="closeClearModal"
              >
                ✕
              </button>
            </div>
            <div class="modal-action">
              <CyberButton
                variant="secondary"
                class="!py-2"
                :disabled="clearing"
                @click="closeClearModal"
              >
                取消
              </CyberButton>
              <button
                type="button"
                class="btn btn-error !py-2"
                :class="{ 'btn-disabled': clearing }"
                :disabled="clearing"
                @click="confirmClearAll"
              >
                {{ clearing ? '清空中…' : '确认清空' }}
              </button>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop" @click="closeClearModal">
            <button type="submit" class="hidden">
              close
            </button>
          </form>
        </dialog>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<style scoped>
  .weight-hint {
    border-radius: 0.85rem;
    border: 1px solid color-mix(in oklch, var(--color-info) 35%, transparent);
    background: color-mix(in oklch, var(--color-info) 10%, transparent);
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: color-mix(in oklch, var(--color-base-content) 72%, transparent);
  }

  .weight-hint--ok {
    border-color: color-mix(in oklch, var(--color-success) 35%, transparent);
    background: color-mix(in oklch, var(--color-success) 10%, transparent);
  }

  .weight-hint--err {
    border-color: color-mix(in oklch, var(--color-error) 35%, transparent);
    background: color-mix(in oklch, var(--color-error) 10%, transparent);
  }

  .weight-stat {
    position: relative;
    overflow: hidden;
    border-radius: 1.25rem;
    border: 1px solid var(--tech-border);
    background: linear-gradient(
      145deg,
      color-mix(in oklch, var(--color-base-100) 78%, transparent),
      color-mix(in oklch, var(--color-base-200) 55%, transparent)
    );
    box-shadow:
      inset 0 1px 0 color-mix(in oklch, white 8%, transparent),
      0 10px 28px color-mix(in oklch, black 18%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    padding: 1.1rem 1.15rem 1.15rem;
  }

  .weight-stat--accent::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: color-mix(in oklch, var(--color-primary) 85%, white 10%);
  }

  .weight-stat__label {
    margin: 0;
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    color: color-mix(in oklch, var(--color-base-content) 55%, transparent);
  }

  .weight-stat__value {
    margin: 0.35rem 0 0;
    font-size: 1.85rem;
    font-weight: 750;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--tech-fg);
  }

  .weight-stat__value--sm {
    font-size: 1.35rem;
  }

  .weight-stat__unit {
    margin-left: 0.2rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: color-mix(in oklch, var(--color-base-content) 50%, transparent);
  }

  .weight-stat__value.is-info {
    color: var(--color-info);
  }

  .weight-stat__value.is-success {
    color: var(--color-success);
  }

  .weight-stat__value.is-warning {
    color: var(--color-warning);
  }

  .weight-stat__value.is-error {
    color: var(--color-error);
  }

  .weight-stat__meta {
    margin: 0.45rem 0 0;
    font-size: 0.75rem;
    color: color-mix(in oklch, var(--color-base-content) 55%, transparent);
  }

  .weight-panel {
    border-radius: 1.35rem;
    border: 1px solid var(--tech-border);
    background: linear-gradient(
      160deg,
      color-mix(in oklch, var(--color-base-100) 82%, transparent),
      color-mix(in oklch, var(--color-base-200) 48%, transparent)
    );
    box-shadow:
      inset 0 1px 0 color-mix(in oklch, white 7%, transparent),
      0 14px 36px color-mix(in oklch, black 16%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: 1.15rem 1.15rem 1.25rem;
  }

  .weight-panel--insight {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .weight-panel--insight .weight-insight {
    flex: 1;
  }

  .weight-panel__head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.85rem;
  }

  .weight-panel__eyebrow {
    margin: 0;
    font-size: 0.68rem;
    font-weight: 650;
    letter-spacing: 0.14em;
    color: color-mix(in oklch, var(--color-primary) 75%, var(--tech-fg));
  }

  .weight-panel__title {
    margin: 0.15rem 0 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--tech-fg);
  }

  .weight-range {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0.2rem;
    border-radius: 999px;
    border: 1px solid var(--tech-border);
    background: color-mix(in oklch, var(--color-base-300) 35%, transparent);
  }

  .weight-range__btn {
    border: 0;
    border-radius: 999px;
    padding: 0.3rem 0.7rem;
    font-size: 0.75rem;
    color: color-mix(in oklch, var(--color-base-content) 65%, transparent);
    background: transparent;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }

  .weight-range__btn.is-active {
    color: var(--tech-fg);
    background: color-mix(in oklch, var(--color-primary) 28%, var(--color-base-100));
  }

  .weight-chart-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 280px;
    font-size: 0.875rem;
    color: color-mix(in oklch, var(--color-base-content) 45%, transparent);
  }

  .weight-insight {
    flex: 1;
    font-size: 0.875rem;
    line-height: 1.65;
    color: color-mix(in oklch, var(--color-base-content) 72%, transparent);
  }

  .weight-insight strong {
    color: var(--tech-fg);
    font-weight: 650;
  }

  .weight-insight__disclaimer {
    margin-top: 0.5rem !important;
    font-size: 0.75rem;
    color: color-mix(in oklch, var(--color-base-content) 45%, transparent);
  }

  .weight-nudge {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.5rem;
    align-items: center;
  }

  .weight-nudge__btn {
    border-radius: 0.75rem;
    border: 1px solid var(--tech-border);
    background: color-mix(in oklch, var(--color-base-200) 55%, transparent);
    color: var(--tech-fg);
    padding: 0.55rem 0.7rem;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      border-color 0.15s,
      background 0.15s;
  }

  .weight-nudge__btn:hover {
    border-color: color-mix(in oklch, var(--color-primary) 45%, var(--tech-border));
    background: color-mix(in oklch, var(--color-primary) 18%, var(--color-base-100));
  }
</style>

<style>
  /* Teleport 到 body：相对视口居中；只提 z-index，尺寸走 daisyUI 小弹框 */
  .modal.weight-tool-modal {
    z-index: 10060;
  }

  .modal.weight-tool-modal .weight-nudge {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.5rem;
    align-items: center;
  }

  .modal.weight-tool-modal .weight-nudge__btn {
    border-radius: 0.75rem;
    border: 1px solid var(--tech-border);
    background: color-mix(in oklch, var(--color-base-200) 55%, transparent);
    color: var(--tech-fg);
    padding: 0.55rem 0.7rem;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
  }

  .modal.weight-tool-modal .weight-nudge__btn:hover {
    border-color: color-mix(in oklch, var(--color-primary) 45%, var(--tech-border));
    background: color-mix(in oklch, var(--color-primary) 18%, var(--color-base-100));
  }
</style>
