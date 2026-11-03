/**
 * 体重记录状态：未登录仅 localStorage；登录后以 Nest `/health/weight/*` 为准，本机作缓存。
 * 副作用：读写 localStorage、可选调健康体重 API、首登可弹确认上传。
 */
import {
  clearWeightAll,
  deleteWeightEntry,
  getWeightBundle,
  putWeightEntry,
  putWeightProfile,
  syncWeightSnapshot,
  type HealthWeightEntryVo,
  type HealthWeightProfileVo,
} from '@/api/health';

export type WeightProfile = {
  heightCm: number;
  targetKg: number;
  sex: '' | 'male' | 'female' | 'other';
};

export type WeightEntry = {
  id: string;
  date: string;
  weightKg: number;
  note?: string;
  createdAt: string;
  updatedAt?: string;
};

export type WeightSyncStatus = 'local' | 'syncing' | 'synced' | 'error';

const STORAGE_PROFILE = 'blog-tool-weight-profile-v1';
const STORAGE_ENTRIES = 'blog-tool-weight-entries-v1';
const STORAGE_SEEDED = 'blog-tool-weight-seeded-v1';
const STORAGE_OWNER_UID = 'blog-tool-weight-owner-uid-v1';

export const DEFAULT_WEIGHT_PROFILE: WeightProfile = {
  heightCm: 175,
  targetKg: 70,
  sex: 'male',
};

/** 是否演示数据（禁止上传云端） */
export function isDemoWeightEntry(e: WeightEntry) {
  return e.id.startsWith('demo-');
}

/** 格式化为 YYYY-MM-DD（本地时区） */
export function toWeightDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 生成近约 90 天演示打卡（相对今天）。
 * 仅首次空库或用户点「重置演示」且未登录云端时使用。
 */
export function buildDemoWeightEntries(): WeightEntry[] {
  const weights = [
    78.6, 78.2, 77.9, 77.5, 77.1, 76.8, 76.4, 76.9, 76.2, 75.8, 75.5, 75.1, 74.8, 74.6, 74.2, 74.5,
    73.9, 73.6, 73.2, 73.0, 72.7, 72.4, 72.1, 72.3, 71.8, 71.5, 71.2, 71.0, 70.8, 70.6, 70.4, 70.7,
    70.3, 70.1, 69.9, 69.8, 69.6, 69.5, 69.3, 69.4, 69.1, 68.9, 68.8, 68.6, 68.5, 68.4, 68.2, 68.3,
    68.1, 67.9, 67.8, 67.7,
  ];
  const notes: Record<number, string> = {
    2: '周末聚餐',
    7: '出差',
    31: '节日',
  };
  const nowIso = new Date().toISOString();
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return weights.map((weightKg, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - Math.round((weights.length - 1 - i) * 1.7));
    return {
      id: `demo-${i}-${toWeightDateKey(d)}`,
      date: toWeightDateKey(d),
      weightKg,
      note: notes[i],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  });
}

/** 将后端档案映射为本地结构 */
function mapProfile(vo: HealthWeightProfileVo): WeightProfile {
  const sex = vo.sex;
  const normalized: WeightProfile['sex']
    = sex === 'male' || sex === 'female' || sex === 'other' || sex === '' ? sex : '';
  return {
    heightCm: Number(vo.heightCm) || DEFAULT_WEIGHT_PROFILE.heightCm,
    targetKg: Number(vo.targetKg) || DEFAULT_WEIGHT_PROFILE.targetKg,
    sex: normalized,
  };
}

/** 将后端打卡映射为本地结构 */
function mapEntry(vo: HealthWeightEntryVo): WeightEntry {
  return {
    id: vo.id,
    date: String(vo.date).slice(0, 10),
    weightKg: Number(vo.weightKg),
    note: vo.note || undefined,
    createdAt: vo.createTime,
    updatedAt: vo.updateTime,
  };
}

/**
 * 体重工具核心状态与持久化。
 * 页面只消费返回的 ref/方法；勿在页面再直接写 localStorage。
 */
export function useWeightTracker() {
  const { isLoggedIn, userInfo } = useAuthSession();

  const profile = ref<WeightProfile>({ ...DEFAULT_WEIGHT_PROFILE });
  const entries = ref<WeightEntry[]>([]);
  const hydrated = ref(false);
  const syncStatus = ref<WeightSyncStatus>('local');
  const syncError = ref('');
  /** 首登：云空 + 本机有真实数据时待用户确认 */
  const pendingUploadConfirm = ref(false);

  /** 写档案到 localStorage */
  function persistProfileLocal() {
    if (!import.meta.client) return;
    localStorage.setItem(STORAGE_PROFILE, JSON.stringify(profile.value));
  }

  /** 写打卡列表到 localStorage */
  function persistEntriesLocal() {
    if (!import.meta.client) return;
    localStorage.setItem(STORAGE_ENTRIES, JSON.stringify(entries.value));
  }

  /** 标记已 seeded，避免反复灌演示 */
  function markSeeded() {
    if (!import.meta.client) return;
    localStorage.setItem(STORAGE_SEEDED, '1');
  }

  /** 记录当前缓存归属 uid（换账号检测） */
  function persistOwnerUid(uid: number) {
    if (!import.meta.client) return;
    localStorage.setItem(STORAGE_OWNER_UID, String(uid));
  }

  /** 读取本机缓存归属 */
  function readOwnerUid(): number {
    if (!import.meta.client) return 0;
    return Number(localStorage.getItem(STORAGE_OWNER_UID) || 0) || 0;
  }

  /** 仅从 localStorage 恢复到内存（不含演示注入） */
  function loadFromLocalStorage() {
    if (!import.meta.client) return;
    try {
      const rawProfile = localStorage.getItem(STORAGE_PROFILE);
      if (rawProfile) {
        profile.value = { ...DEFAULT_WEIGHT_PROFILE, ...JSON.parse(rawProfile) };
      }
      const rawEntries = localStorage.getItem(STORAGE_ENTRIES);
      if (rawEntries) {
        const parsed = JSON.parse(rawEntries) as WeightEntry[];
        if (Array.isArray(parsed)) entries.value = parsed;
      }
    }
    catch {
      entries.value = [];
    }
  }

  /** 本机非演示真实记录 */
  function realLocalEntries() {
    return entries.value.filter(e => !isDemoWeightEntry(e));
  }

  /** 应用云端 bundle 到内存 + 本地缓存 */
  function applyBundle(bundle: { profile: HealthWeightProfileVo; entries: HealthWeightEntryVo[] }) {
    profile.value = mapProfile(bundle.profile);
    entries.value = bundle.entries.map(mapEntry);
    persistProfileLocal();
    persistEntriesLocal();
    markSeeded();
    const uid = userInfo.value?.uid || 0;
    if (uid) persistOwnerUid(uid);
    syncStatus.value = 'synced';
    syncError.value = '';
  }

  /**
   * 登录后拉云端；云空且本机有真实数据则挂起上传确认。
   * 副作用：可能改 syncStatus / pendingUploadConfirm。
   */
  async function pullFromCloud() {
    syncStatus.value = 'syncing';
    syncError.value = '';
    try {
      const bundle = await getWeightBundle();
      const cloudEmpty = !bundle.entries?.length;
      const localReal = realLocalEntries();
      const owner = readOwnerUid();
      const uid = userInfo.value?.uid || 0;
      // 换账号：直接以云端为准，不自动上传上一账号本机数据
      if (uid && owner && owner !== uid) {
        applyBundle(bundle);
        pendingUploadConfirm.value = false;
        return;
      }
      if (cloudEmpty && localReal.length) {
        pendingUploadConfirm.value = true;
        syncStatus.value = 'synced';
        return;
      }
      applyBundle(bundle);
      pendingUploadConfirm.value = false;
    }
    catch (e: any) {
      syncStatus.value = 'error';
      syncError.value = e?.message || '同步失败';
    }
  }

  /**
   * 用户确认：把本机真实数据 LWW 合并到云端。
   */
  async function confirmUploadLocal() {
    pendingUploadConfirm.value = false;
    syncStatus.value = 'syncing';
    try {
      const payload = {
        profile: {
          heightCm: profile.value.heightCm,
          targetKg: profile.value.targetKg,
          sex: profile.value.sex,
          updateTime: new Date().toISOString(),
        },
        entries: realLocalEntries().map(e => ({
          date: e.date,
          weightKg: e.weightKg,
          note: e.note,
          updateTime: e.updatedAt || e.createdAt,
        })),
      };
      const res = await syncWeightSnapshot(payload);
      applyBundle(res);
    }
    catch (e: any) {
      syncStatus.value = 'error';
      syncError.value = e?.message || '上传失败';
    }
  }

  /** 用户拒绝上传：仅用云端（空），保留本机缓存不覆盖 */
  function dismissUploadLocal() {
    pendingUploadConfirm.value = false;
    entries.value = [];
    persistEntriesLocal();
    markSeeded();
    syncStatus.value = 'synced';
  }

  /**
   * 首次 hydrate：先本地，再按登录态拉云。
   */
  async function hydrate() {
    if (!import.meta.client) return;
    loadFromLocalStorage();
    if (!isLoggedIn.value) {
      if (!entries.value.length && !localStorage.getItem(STORAGE_SEEDED)) {
        entries.value = buildDemoWeightEntries();
        markSeeded();
        persistEntriesLocal();
        persistProfileLocal();
      }
      syncStatus.value = 'local';
      hydrated.value = true;
      return;
    }
    // 已登录：勿灌演示
    if (!entries.value.length) markSeeded();
    hydrated.value = true;
    await pullFromCloud();
  }

  /** 保存档案：本地必写；登录则 PUT */
  async function saveProfileRemote() {
    persistProfileLocal();
    if (!isLoggedIn.value) {
      syncStatus.value = 'local';
      return;
    }
    syncStatus.value = 'syncing';
    try {
      const vo = await putWeightProfile({
        heightCm: profile.value.heightCm,
        targetKg: profile.value.targetKg,
        sex: profile.value.sex,
      });
      profile.value = mapProfile(vo);
      persistProfileLocal();
      syncStatus.value = 'synced';
      syncError.value = '';
    }
    catch (e: any) {
      syncStatus.value = 'error';
      syncError.value = e?.message || '档案同步失败';
    }
  }

  /**
   * 保存或覆盖同日记录。
   * @returns 是否校验通过并已写入内存
   */
  async function upsertEntryLocalThenRemote(input: {
    date: string;
    weightKg: number;
    note?: string;
  }): Promise<boolean> {
    const { date, weightKg, note } = input;
    if (!date || !Number.isFinite(weightKg) || weightKg < 20 || weightKg > 300) {
      return false;
    }
    const now = new Date().toISOString();
    const rounded = Math.round(weightKg * 10) / 10;
    const existing = entries.value.find(e => e.date === date);
    if (existing) {
      existing.weightKg = rounded;
      existing.note = note || undefined;
      existing.createdAt = now;
      existing.updatedAt = now;
    }
    else {
      entries.value.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date,
        weightKg: rounded,
        note: note || undefined,
        createdAt: now,
        updatedAt: now,
      });
    }
    persistEntriesLocal();
    markSeeded();

    if (!isLoggedIn.value) {
      syncStatus.value = 'local';
      return true;
    }
    syncStatus.value = 'syncing';
    try {
      const vo = await putWeightEntry({
        date,
        weightKg: rounded,
        note,
        clientUpdateTime: now,
      });
      if (!vo.skipped) {
        const idx = entries.value.findIndex(e => e.date === date);
        if (idx >= 0) entries.value[idx] = mapEntry(vo);
        persistEntriesLocal();
      }
      syncStatus.value = 'synced';
      syncError.value = '';
    }
    catch (e: any) {
      syncStatus.value = 'error';
      syncError.value = e?.message || '打卡同步失败';
    }
    return true;
  }

  /** 按 id 删除；登录时按 date 调 DELETE */
  async function removeEntryById(id: string) {
    const target = entries.value.find(e => e.id === id);
    if (!target) return;
    entries.value = entries.value.filter(e => e.id !== id);
    persistEntriesLocal();
    if (!isLoggedIn.value) {
      syncStatus.value = 'local';
      return;
    }
    syncStatus.value = 'syncing';
    try {
      await deleteWeightEntry(target.date);
      syncStatus.value = 'synced';
      syncError.value = '';
    }
    catch (e: any) {
      syncStatus.value = 'error';
      syncError.value = e?.message || '删除同步失败';
    }
  }

  /** 重置演示（仅建议未登录使用；登录时只改本地并标 error 提示需自行同步） */
  function resetDemoLocal() {
    profile.value = { ...DEFAULT_WEIGHT_PROFILE };
    entries.value = buildDemoWeightEntries();
    persistProfileLocal();
    persistEntriesLocal();
    markSeeded();
    syncStatus.value = isLoggedIn.value ? 'error' : 'local';
    if (isLoggedIn.value) {
      syncError.value = '演示数据仅存本机，不会自动上传；可清空后从云端拉取';
    }
  }

  /** 仅清空本机内存与 localStorage（不碰云端） */
  function wipeLocalState() {
    profile.value = { ...DEFAULT_WEIGHT_PROFILE };
    entries.value = [];
    persistProfileLocal();
    persistEntriesLocal();
    markSeeded();
  }

  /**
   * 清空全部：本机必清；已登录时同步 DELETE /health/weight/all。
   * @returns 是否成功（云端失败时本机已清，返回 false 并标 error）
   */
  async function clearAllData(): Promise<boolean> {
    wipeLocalState();
    if (!isLoggedIn.value) {
      syncStatus.value = 'local';
      syncError.value = '';
      return true;
    }
    syncStatus.value = 'syncing';
    try {
      await clearWeightAll();
      syncStatus.value = 'synced';
      syncError.value = '';
      return true;
    }
    catch (e: any) {
      syncStatus.value = 'error';
      syncError.value = e?.message || '云端清空失败，本机已清空';
      return false;
    }
  }

  /**
   * CSV/批量导入后合并进内存并尝试同步：登录时走 sync 接口一次。
   */
  async function mergeImportedEntries(imported: WeightEntry[]) {
    const map = new Map(entries.value.map(e => [e.date, e]));
    for (const row of imported) {
      const prev = map.get(row.date);
      if (prev) {
        prev.weightKg = row.weightKg;
        prev.note = row.note;
        prev.createdAt = row.createdAt;
        prev.updatedAt = row.updatedAt || row.createdAt;
      }
      else {
        map.set(row.date, row);
      }
    }
    entries.value = [...map.values()];
    persistEntriesLocal();
    markSeeded();

    if (!isLoggedIn.value) {
      syncStatus.value = 'local';
      return;
    }
    syncStatus.value = 'syncing';
    try {
      const res = await syncWeightSnapshot({
        profile: {
          heightCm: profile.value.heightCm,
          targetKg: profile.value.targetKg,
          sex: profile.value.sex,
          updateTime: new Date().toISOString(),
        },
        entries: realLocalEntries().map(e => ({
          date: e.date,
          weightKg: e.weightKg,
          note: e.note,
          updateTime: e.updatedAt || e.createdAt,
        })),
      });
      applyBundle(res);
    }
    catch (e: any) {
      syncStatus.value = 'error';
      syncError.value = e?.message || '导入同步失败';
    }
  }

  /** 重试：重新 pull；若仍有 pending 上传则保持 */
  async function retrySync() {
    if (!isLoggedIn.value) return;
    await pullFromCloud();
  }

  // 登录态变化：登入拉云；登出改 local
  watch(isLoggedIn, async (loggedIn, was) => {
    if (!hydrated.value) return;
    if (loggedIn && !was) {
      await pullFromCloud();
    }
    else if (!loggedIn && was) {
      syncStatus.value = 'local';
      pendingUploadConfirm.value = false;
    }
  });

  return {
    profile,
    entries,
    hydrated,
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
    persistProfileLocal,
  };
}
