import { computed } from 'vue';
import { useState } from '#app';
import {
  getRpgStatus,
  getRpgSignInfo,
  rpgSignIn,
  getRpgHitRecords,
  getRpgBanStatus,
  getRpgLeaderboard,
  getRpgLevelRewards,
  getMyAchievements,
  getMyQuests,
  claimQuestReward,
  getMyBuffs,
  getLotteryPool,
  lotteryDraw,
  getLotteryHistory,
  getLotteryTickets,
} from '~~/api/rpg';
import type {
  RpgStatus,
  SignInfo,
  SignInResult,
  BanStatus,
  SensitiveHitRecord,
  RoleReward,
  LeaderboardEntry,
  LeaderboardType,
  UserAchievementProgress,
  UserQuestProgress,
  UserBuff,
  LotteryPoolItem,
  DrawResult,
  LotteryRecord,
  LevelReward,
} from '~~/types/rpg';

/**
 * RPG 状态管理 composable（useState 共享，多组件可读写同一份数据）
 */
export function useRpg() {
  const rpgStatus = useState<RpgStatus | null>('rpg-status', () => null);
  const signInfo = useState<SignInfo | null>('rpg-sign-info', () => null);
  const banStatus = useState<BanStatus | null>('rpg-ban-status', () => null);
  const hitRecords = useState<SensitiveHitRecord[]>('rpg-hit-records', () => []);
  const hitRecordsTotal = useState('rpg-hit-records-total', () => 0);
  const leaderboard = useState<LeaderboardEntry[]>('rpg-leaderboard', () => []);
  const levelRewards = useState<LevelReward[]>('rpg-level-rewards', () => []);
  const achievements = useState<UserAchievementProgress[]>('rpg-achievements', () => []);
  const quests = useState<UserQuestProgress[]>('rpg-quests', () => []);
  const buffs = useState<UserBuff[]>('rpg-buffs', () => []);
  const lotteryPool = useState<LotteryPoolItem[]>('rpg-lottery-pool', () => []);
  const lotteryTickets = useState('rpg-lottery-tickets', () => 0);
  const lotteryHistory = useState<LotteryRecord[]>('rpg-lottery-history', () => []);
  const drawing = useState('rpg-drawing', () => false);
  const loading = useState('rpg-loading', () => false);
  const signingIn = useState('rpg-signing-in', () => false);

  const getLevelThreshold = (level: number): number => {
    if (level <= 1) return 0;
    return level * (level - 1) * 50;
  };

  const expProgress = computed(() => {
    if (!rpgStatus.value) return { current: 0, required: 100, percent: 0 };
    const { level, exp } = rpgStatus.value;
    const currentThreshold = getLevelThreshold(level);
    const nextThreshold = getLevelThreshold(level + 1);
    const current = exp - currentThreshold;
    const required = nextThreshold - currentThreshold;
    const percent = required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 100;
    return { current, required, percent };
  });

  const lifeColor = computed(() => {
    if (!rpgStatus.value) return '#4ade80';
    const life = rpgStatus.value.lifeValue;
    if (life > 60) return '#4ade80';
    if (life > 30) return '#fbbf24';
    return '#ef4444';
  });

  const lifePercent = computed(() => {
    return rpgStatus.value?.lifeValue ?? 100;
  });

  const isBanned = computed(() => {
    return banStatus.value?.banned ?? false;
  });

  const roleReward = computed<RoleReward | null>(() => {
    return rpgStatus.value?.roleReward ?? null;
  });

  const banRemainingText = computed(() => {
    if (!banStatus.value?.banned || !banStatus.value.remainingMs) return '';
    const ms = banStatus.value.remainingMs;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}小时${minutes}分钟`;
    return `${minutes}分钟`;
  });

  const completedAchievementCount = computed(() => {
    return achievements.value.filter(a => a.completed).length;
  });

  const recentAchievements = computed(() => {
    return achievements.value
      .filter(a => a.completed && a.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 3);
  });

  const questCompletionRate = computed(() => {
    if (quests.value.length === 0) return 0;
    const completed = quests.value.filter(q => q.completed).length;
    return Math.round((completed / quests.value.length) * 100);
  });

  const claimableQuests = computed(() => {
    return quests.value.filter(q => q.completed && !q.claimed);
  });

  const activeBuffCount = computed(() => buffs.value.length);

  const fetchBuffs = async () => {
    try {
      buffs.value = await getMyBuffs();
    }
    catch (e) {
      console.error('[useRpg] 获取Buff列表失败:', e);
    }
  };

  const fetchLotteryPool = async () => {
    try {
      lotteryPool.value = await getLotteryPool();
    }
    catch (e) {
      console.error('[useRpg] 获取抽奖奖池失败:', e);
    }
  };

  const fetchLotteryTickets = async () => {
    try {
      const res = await getLotteryTickets();
      lotteryTickets.value = res.tickets || 0;
    }
    catch (e) {
      console.error('[useRpg] 获取抽奖券失败:', e);
    }
  };

  const draw = async (count = 1): Promise<DrawResult[]> => {
    drawing.value = true;
    try {
      const results = await lotteryDraw(count);
      await fetchLotteryTickets();
      return results;
    }
    catch (e) {
      console.error('[useRpg] 抽奖失败:', e);
      return [];
    }
    finally {
      drawing.value = false;
    }
  };

  const fetchLotteryHistory = async (page = 1) => {
    try {
      const res = await getLotteryHistory(page);
      lotteryHistory.value = res.list || [];
    }
    catch (e) {
      console.error('[useRpg] 获取抽奖记录失败:', e);
    }
  };

  const fetchStatus = async () => {
    loading.value = true;
    try {
      rpgStatus.value = await getRpgStatus();
    }
    catch (e) {
      console.error('[useRpg] 获取RPG状态失败:', e);
    }
    finally {
      loading.value = false;
    }
  };

  const fetchSignInfo = async () => {
    try {
      signInfo.value = await getRpgSignInfo();
    }
    catch (e) {
      console.error('[useRpg] 获取签到信息失败:', e);
    }
  };

  const fetchBanStatus = async () => {
    try {
      banStatus.value = await getRpgBanStatus();
    }
    catch (e) {
      console.error('[useRpg] 获取禁言状态失败:', e);
    }
  };

  const fetchHitRecords = async (page = 1, pageSize = 10) => {
    try {
      const res = await getRpgHitRecords(page, pageSize);
      hitRecords.value = res.list || [];
      hitRecordsTotal.value = res.pagination?.total ?? 0;
    }
    catch (e) {
      console.error('[useRpg] 获取命中记录失败:', e);
    }
  };

  const fetchLeaderboard = async (type: LeaderboardType = 'exp', limit = 20) => {
    try {
      leaderboard.value = await getRpgLeaderboard(type, limit);
    }
    catch (e) {
      console.error('[useRpg] 获取排行榜失败:', e);
    }
  };

  const fetchLevelRewards = async () => {
    try {
      levelRewards.value = await getRpgLevelRewards();
    }
    catch (e) {
      console.error('[useRpg] 获取等级奖励失败:', e);
    }
  };

  const signIn = async (): Promise<SignInResult | null> => {
    signingIn.value = true;
    try {
      const result = await rpgSignIn();
      await Promise.all([fetchStatus(), fetchSignInfo(), fetchBanStatus()]);
      return result;
    }
    catch (e) {
      console.error('[useRpg] 签到失败:', e);
      return null;
    }
    finally {
      signingIn.value = false;
    }
  };

  const fetchAchievements = async () => {
    try {
      achievements.value = await getMyAchievements();
    }
    catch (e) {
      console.error('[useRpg] 获取成就进度失败:', e);
    }
  };

  const fetchQuests = async () => {
    try {
      quests.value = await getMyQuests();
    }
    catch (e) {
      console.error('[useRpg] 获取任务进度失败:', e);
    }
  };

  const claimQuest = async (questCode: string): Promise<boolean> => {
    try {
      await claimQuestReward(questCode);
      await fetchQuests();
      await fetchStatus();
      return true;
    }
    catch (e) {
      console.error('[useRpg] 领取任务奖励失败:', e);
      return false;
    }
  };

  /** 轻量初始化：互动场景（评论/留言）仅需生命与禁言状态 */
  const initRpgInteract = async () => {
    await Promise.all([fetchStatus(), fetchBanStatus()]);
  };

  const initRpg = async () => {
    await Promise.all([
      fetchStatus(),
      fetchSignInfo(),
      fetchBanStatus(),
      fetchAchievements(),
      fetchQuests(),
      fetchBuffs(),
      fetchLotteryTickets(),
      fetchHitRecords(),
    ]);
  };

  return {
    rpgStatus,
    signInfo,
    banStatus,
    hitRecords,
    hitRecordsTotal,
    leaderboard,
    levelRewards,
    achievements,
    quests,
    buffs,
    lotteryPool,
    lotteryTickets,
    lotteryHistory,
    drawing,
    loading,
    signingIn,
    expProgress,
    lifeColor,
    lifePercent,
    isBanned,
    roleReward,
    banRemainingText,
    completedAchievementCount,
    recentAchievements,
    questCompletionRate,
    claimableQuests,
    activeBuffCount,
    getLevelThreshold,
    fetchStatus,
    fetchSignInfo,
    fetchBanStatus,
    fetchHitRecords,
    fetchLeaderboard,
    fetchLevelRewards,
    fetchAchievements,
    fetchQuests,
    fetchBuffs,
    fetchLotteryPool,
    fetchLotteryTickets,
    draw,
    fetchLotteryHistory,
    claimQuest,
    signIn,
    initRpg,
    initRpgInteract,
  };
}
