/**
 * 健康模块 API（一期：体重日记）
 * 数据来源：blog-server `/health/weight/*`（需登录 JWT）
 */
import request from '~~/api/request';

/** 档案字段由后端组装，勿本地 dict 回显 */
export type HealthWeightProfileVo = {
  heightCm: number;
  targetKg: number;
  sex: string;
  updateTime: string | null;
};

/** 打卡字段由后端组装 */
export type HealthWeightEntryVo = {
  id: string;
  date: string;
  weightKg: number;
  note?: string;
  createTime: string;
  updateTime: string;
};

export type HealthWeightBundle = {
  profile: HealthWeightProfileVo;
  entries: HealthWeightEntryVo[];
};

export type HealthWeightSyncResult = HealthWeightBundle & {
  merged: {
    profileUpdated: boolean;
    entryInserted: number;
    entryUpdated: number;
    entrySkipped: number;
  };
};

/** 拉取本人档案 + 全部打卡 */
export const getWeightBundle = () =>
  request.get('/health/weight/bundle') as Promise<HealthWeightBundle>;

/** upsert 档案 */
export const putWeightProfile = (payload: { heightCm: number; targetKg: number; sex?: string }) =>
  request.put('/health/weight/profile', payload) as Promise<HealthWeightProfileVo>;

/** upsert 某日打卡 */
export const putWeightEntry = (payload: {
  date: string;
  weightKg: number;
  note?: string;
  clientUpdateTime?: string;
}) =>
  request.put('/health/weight/entries', payload) as Promise<
    HealthWeightEntryVo & { skipped: boolean }
  >;

/** 删除某日打卡 */
export const deleteWeightEntry = (date: string) =>
  request.del('/health/weight/entries', { date }) as Promise<{ ok: boolean }>;

/** 清空本人全部体重档案与打卡（云端） */
export const clearWeightAll = () =>
  request.del('/health/weight/all') as Promise<{
    ok: boolean;
    deletedEntries: number;
    deletedProfile: boolean;
  }>;

/** 本机快照 LWW 合并到云端 */
export const syncWeightSnapshot = (payload: {
  profile?: {
    heightCm: number;
    targetKg: number;
    sex?: string;
    updateTime?: string;
  };
  entries: Array<{
    date: string;
    weightKg: number;
    note?: string;
    updateTime?: string;
  }>;
}) => request.post('/health/weight/sync', payload) as Promise<HealthWeightSyncResult>;
