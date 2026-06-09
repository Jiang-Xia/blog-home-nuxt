import { ref, computed } from 'vue';
import {
  getRpgStatus,
  getRpgSignInfo,
  rpgSignIn,
  getRpgHitRecords,
  getRpgBanStatus,
  getRpgLeaderboard,
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
} from '~~/types/rpg';

/**
 * RPG 状态管理 composable
 * 管理用户RPG状态：等级、经验、生命值、签到、禁言等
 */
export function useRpg() {
  const rpgStatus = ref<RpgStatus | null>(null);
  const signInfo = ref<SignInfo | null>(null);
  const banStatus = ref<BanStatus | null>(null);
  const hitRecords = ref<SensitiveHitRecord[]>([]);
  const hitRecordsTotal = ref(0);
  const leaderboard = ref<LeaderboardEntry[]>([]);
  const achievements = ref<UserAchievementProgress[]>([]);
  const quests = ref<UserQuestProgress[]>([]);
  const buffs = ref<UserBuff[]>([]);
  const lotteryPool = ref<LotteryPoolItem[]>([]);
  const lotteryTickets = ref(0);
  const lotteryHistory = ref<LotteryRecord[]>([]);
  const drawing = ref(false);
  const loading = ref(false);
  const signingIn = ref(false);

  // 等级阈值公式: level * (level - 1) * 50
  const getLevelThreshold = (level: number): number => {
    if (level <= 1) return 0;
    return level * (level - 1) * 50;
  };

  // 经验进度
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

  // 生命值颜色（绿/黄/红）
  const lifeColor = computed(() => {
    if (!rpgStatus.value) return '#4ade80';
    const life = rpgStatus.value.lifeValue;
    if (life > 60) return '#4ade80';
    if (life > 30) return '#fbbf24';
    return '#ef4444';
  });

  // 生命值百分比
  const lifePercent = computed(() => {
    return rpgStatus.value?.lifeValue ?? 100;
  });

  // 是否被禁言
  const isBanned = computed(() => {
    return banStatus.value?.banned ?? false;
  });

  // 角色专属奖励（超级管理员/管理员才有）
  const roleReward = computed<RoleReward | null>(() => {
    return rpgStatus.value?.roleReward ?? null;
  });

  // 禁言剩余时间（格式化）
  const banRemainingText = computed(() => {
    if (!banStatus.value?.banned || !banStatus.value.remainingMs) return '';
    const ms = banStatus.value.remainingMs;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}小时${minutes}分钟`;
    return `${minutes}分钟`;
  });

  // 已完成成就数量
  const completedAchievementCount = computed(() => {
    return achievements.value.filter(a => a.completed).length;
  });

  // 最近完成的成就（最多3个）
  const recentAchievements = computed(() => {
    return achievements.value
      .filter(a => a.completed && a.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 3);
  });

  // 任务完成统计
  const questCompletionRate = computed(() => {
    if (quests.value.length === 0) return 0;
    const completed = quests.value.filter(q => q.completed).length;
    return Math.round((completed / quests.value.length) * 100);
  });

  // 可领取奖励的任务
  const claimableQuests = computed(() => {
    return quests.value.filter(q => q.completed && !q.claimed);
  });

  // 有效Buff数量
  const activeBuffCount = computed(() => buffs.value.length);

  /** 获取Buff列表 */
  const fetchBuffs = async () => {
    try {
      buffs.value = await getMyBuffs();
    }
    catch (e) {
      console.error('[useRpg] 获取Buff列表失败:', e);
    }
  };

  /** 获取抽奖奖池 */
  const fetchLotteryPool = async () => {
    try {
      lotteryPool.value = await getLotteryPool();
    }
    catch (e) {
      console.error('[useRpg] 获取抽奖奖池失败:', e);
    }
  };

  /** 获取抽奖券数量 */
  const fetchLotteryTickets = async () => {
    try {
      const res = await getLotteryTickets();
      lotteryTickets.value = res.tickets || 0;
    }
    catch (e) {
      console.error('[useRpg] 获取抽奖券失败:', e);
    }
  };

  /** 执行抽奖 */
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

  /** 获取抽奖记录 */
  const fetchLotteryHistory = async (page = 1) => {
    try {
      const res = await getLotteryHistory(page);
      lotteryHistory.value = res.list || [];
    }
    catch (e) {
      console.error('[useRpg] 获取抽奖记录失败:', e);
    }
  };

  /** 获取RPG完整状态 */
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

  /** 获取签到信息 */
  const fetchSignInfo = async () => {
    try {
      signInfo.value = await getRpgSignInfo();
    }
    catch (e) {
      console.error('[useRpg] 获取签到信息失败:', e);
    }
  };

  /** 获取禁言状态 */
  const fetchBanStatus = async () => {
    try {
      banStatus.value = await getRpgBanStatus();
    }
    catch (e) {
      console.error('[useRpg] 获取禁言状态失败:', e);
    }
  };

  /** 获取命中记录 */
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

  /** 获取排行榜 */
  const fetchLeaderboard = async (type: LeaderboardType = 'exp', limit = 10) => {
    try {
      leaderboard.value = await getRpgLeaderboard(type, limit);
    }
    catch (e) {
      console.error('[useRpg] 获取排行榜失败:', e);
    }
  };

  /** 签到 */
  const signIn = async (): Promise<SignInResult | null> => {
    signingIn.value = true;
    try {
      const result = await rpgSignIn();
      // 签到成功后刷新状态
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

  /** 获取成就进度 */
  const fetchAchievements = async () => {
    try {
      achievements.value = await getMyAchievements();
    }
    catch (e) {
      console.error('[useRpg] 获取成就进度失败:', e);
    }
  };

  /** 获取任务进度 */
  const fetchQuests = async () => {
    try {
      quests.value = await getMyQuests();
    }
    catch (e) {
      console.error('[useRpg] 获取任务进度失败:', e);
    }
  };

  /** 领取任务奖励 */
  const claimQuest = async (questCode: string): Promise<boolean> => {
    try {
      await claimQuestReward(questCode);
      await fetchQuests();
      await fetchStatus(); // 刷新经验值
      return true;
    }
    catch (e) {
      console.error('[useRpg] 领取任务奖励失败:', e);
      return false;
    }
  };

  /** 初始化：获取所有RPG状态 */
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
  };
}
