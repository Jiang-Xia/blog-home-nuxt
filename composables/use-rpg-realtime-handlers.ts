import { ref } from 'vue';
import { useRpg } from '~~/composables/use-rpg';
import {
  useRealtimeSocket,
  type LevelUpResult,
  type RpgAchievementCompletePayload,
  type RpgActivityUpdatePayload,
  type RpgArticleLevelUpPayload,
  type RpgBanStatusPayload,
  type RpgBuffExpiredPayload,
  type RpgBuffGrantedPayload,
  type RpgCurrencyChangePayload,
  type RpgExpGainPayload,
  type RpgGuildEventPayload,
  type RpgItemGrantedPayload,
  type RpgLifeChangePayload,
  type RpgLotteryTicketChangePayload,
  type RpgMasterpiecePayload,
  type RpgPetHatchedPayload,
  type RpgQuestCompletePayload,
  type RpgQuestRewardPayload,
  type RpgRankChangePayload,
  type RpgShieldUsedPayload,
  type RpgSocialReceivedPayload,
  type RpgTipReceivedPayload,
  type RpgWeatherBuffPayload,
} from '~~/composables/use-realtime-socket';
import {
  formatGuildEventMessage,
  LEADERBOARD_PERIOD_LABEL,
  SOCIAL_ACTION_LABEL,
} from '~~/constants/rpg-ws-display';
import type { RpgSocialFeedbackData } from '~~/types/rpg';
import { messageInfo, messageSuccess, messageWarning } from '@/utils/toast';

/** 前端 expGain 二次防抖窗口（与后端 8s 互补） */
const EXP_TOAST_DEBOUNCE_MS = 5000;

/**
 * 全站 RPG 实时事件处理（仅由 RpgGlobalInit 调用一次）
 * - 更新 useRpg 共享状态
 * - Toast / 弹窗反馈
 * - 通知冒险页 onDataRefresh 增量刷新
 */
export function useRpgRealtimeHandlers() {
  const {
    rpgStatus,
    banStatus,
    fetchStatus,
    fetchQuests,
    fetchBanStatus,
    fetchAchievements,
    fetchBuffs,
  } = useRpg();

  const { on, notifyDataRefresh } = useRealtimeSocket();

  /** 全屏弹窗状态（由 RpgGlobalInit 挂载对应 Animation 组件） */
  const levelUpVisible = ref(false);
  const levelUpData = ref<LevelUpResult | null>(null);

  const achievementVisible = ref(false);
  const achievementName = ref('');
  const achievementExpReward = ref(0);

  const masterpieceVisible = ref(false);
  const masterpieceData = ref<RpgMasterpiecePayload | null>(null);

  const socialFeedbackVisible = ref(false);
  const socialFeedbackData = ref<RpgSocialFeedbackData | null>(null);

  /** expGain 前端二次防抖：后端已 8s 合并，此处再 5s 合并 Toast，避免连续弹窗 */
  let expToastTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingExpAmount = 0;
  let pendingExpLabels: string[] = [];

  /** 防抖窗口到期：合并 pending 为一条 EXP Toast */
  const flushExpToast = () => {
    if (pendingExpAmount <= 0) return;
    const labels = [...new Set(pendingExpLabels)].join('、') || '活动';
    messageInfo(`✨ +${pendingExpAmount} EXP（${labels}）`);
    pendingExpAmount = 0;
    pendingExpLabels = [];
    expToastTimer = null;
  };

  /** 累加 EXP 并重置 5s 定时器 */
  const scheduleExpToast = (amount: number, reasonLabels: string[]) => {
    pendingExpAmount += amount;
    pendingExpLabels.push(...reasonLabels);
    if (expToastTimer) clearTimeout(expToastTimer);
    expToastTimer = setTimeout(flushExpToast, EXP_TOAST_DEBOUNCE_MS);
  };

  /** 升级：全屏 LevelUpAnimation；同步等级 → fetchStatus → refresh status */
  on('levelUp', (data) => {
    const payload = data as LevelUpResult;
    levelUpData.value = payload;
    levelUpVisible.value = true;
    if (rpgStatus.value) {
      rpgStatus.value.level = payload.newLevel;
    }
    void fetchStatus();
    notifyDataRefresh('status');
  });

  /** 生命值变化：Toast（恢复/敏感词扣血）；同步 HP → fetchStatus → refresh status */
  on('lifeChange', (data) => {
    const payload = data as RpgLifeChangePayload;
    if (rpgStatus.value) {
      rpgStatus.value.lifeValue = payload.currentLife;
    }
    if (payload.lifeRecovered && payload.lifeRecovered > 0) {
      messageInfo(`💚 生命值 +${payload.lifeRecovered}（当前 ${payload.currentLife}）`);
    }
    else if (payload.lifeDeducted > 0) {
      messageWarning(
        `⚠️ 命中敏感词，生命值 -${payload.lifeDeducted}（剩余 ${payload.currentLife}）`,
      );
    }
    void fetchStatus();
    notifyDataRefresh('status');
  });

  /** 禁言变更：Toast 警告；同步 banStatus → fetchBanStatus → refresh status */
  on('banStatus', (data) => {
    const payload = data as RpgBanStatusPayload;
    if (banStatus.value) {
      banStatus.value.banned = payload.banned;
      banStatus.value.banEndTime = payload.banEndTime;
    }
    else {
      void fetchBanStatus();
    }
    if (payload.banned) {
      const reason = payload.banReason ? `：${payload.banReason}` : '';
      messageWarning(`🔇 您已被禁言${reason}`);
    }
    void fetchBanStatus();
    notifyDataRefresh('status');
  });

  /** 成就达成：AchievementAnimation 弹窗 → refresh achievements / quests / status */
  on('achievementComplete', (data) => {
    const payload = data as RpgAchievementCompletePayload;
    achievementName.value = payload.name || payload.achievementName || '新成就';
    achievementExpReward.value = payload.expReward ?? 0;
    achievementVisible.value = true;
    void Promise.all([fetchAchievements(), fetchQuests(), fetchStatus()]);
    notifyDataRefresh('achievements');
    notifyDataRefresh('quests');
    notifyDataRefresh('status');
  });

  /** 任务奖励已领：Toast → refresh quests / status */
  on('questReward', (data) => {
    const payload = data as RpgQuestRewardPayload;
    const label = payload.questName ? `「${payload.questName}」` : '任务';
    const exp = payload.expReward;
    messageInfo(`✨ ${label} 奖励已发放${exp ? ` +${exp} EXP` : ''}`);
    void Promise.all([fetchQuests(), fetchStatus()]);
    notifyDataRefresh('quests');
    notifyDataRefresh('status');
  });

  /** 获得 Buff：Toast → fetchBuffs → refresh buffs */
  on('buffGranted', (data) => {
    const payload = data as RpgBuffGrantedPayload;
    messageInfo(`✨ 获得增益：${payload.name}`);
    void fetchBuffs();
    notifyDataRefresh('buffs');
  });

  /** 任务完成待领：Toast 提示去领取 → refresh quests */
  on('questComplete', (data) => {
    const payload = data as RpgQuestCompletePayload;
    const label = payload.questName ? `「${payload.questName}」` : '任务';
    messageInfo(`🎯 ${label} 已完成，去领取奖励吧！`);
    void fetchQuests();
    notifyDataRefresh('quests');
  });

  /** 经验获得（未升级）：5s 防抖合并 Toast → refresh status */
  on('expGain', (data) => {
    const payload = data as RpgExpGainPayload;
    if (payload.amount > 0) {
      scheduleExpToast(payload.amount, payload.reasonLabels || []);
    }
    void fetchStatus();
    notifyDataRefresh('status');
  });

  const showSocialFeedback = (feedback: RpgSocialFeedbackData) => {
    socialFeedbackData.value = feedback;
    socialFeedbackVisible.value = true;
  };

  /** 收到社交互动：Toast + 全屏弹框；同步 HP → refresh status */
  on('socialReceived', (data) => {
    const payload = data as RpgSocialReceivedPayload;
    const actionLabel = SOCIAL_ACTION_LABEL[payload.action] || payload.action;
    const from = payload.fromNickname || '冒险者';
    if (payload.action === 'cheer') {
      messageInfo(`💪 ${from} 给你加油了！HP +${payload.hpDelta}`);
      showSocialFeedback({
        kind: 'cheer',
        fromNickname: from,
        hpDelta: payload.hpDelta,
      });
    }
    else if (payload.action === 'egg') {
      messageWarning(`🥚 ${from} 向你扔了鸡蛋！HP ${payload.hpDelta}`);
      showSocialFeedback({
        kind: 'egg',
        fromNickname: from,
        hpDelta: payload.hpDelta,
      });
    }
    else if (payload.action === 'flower') {
      messageInfo(`🌸 ${from} 向你送了鲜花！声望 +${payload.reputationDelta}`);
      showSocialFeedback({
        kind: 'flower',
        fromNickname: from,
        reputationDelta: payload.reputationDelta,
      });
    }
    else {
      messageInfo(`${from} 对你进行了${actionLabel}`);
    }
    if (rpgStatus.value) {
      rpgStatus.value.lifeValue = payload.currentLife;
    }
    void fetchStatus();
    notifyDataRefresh('status');
  });

  /** 收到打赏：Toast + 全屏弹框 → refresh status / inventory */
  on('tipReceived', (data) => {
    const payload = data as RpgTipReceivedPayload;
    const from = payload.fromNickname || '冒险者';
    messageSuccess(`💎 收到打赏 +${payload.amount} 钻石《${payload.articleTitle}》`);
    showSocialFeedback({
      kind: 'tip',
      fromNickname: from,
      amount: payload.amount,
      articleTitle: payload.articleTitle,
    });
    void fetchStatus();
    notifyDataRefresh('status');
    notifyDataRefresh('inventory');
  });

  /** 文章升级：Toast 仅提示，无弹窗/刷新 */
  on('articleLevelUp', (data) => {
    const payload = data as RpgArticleLevelUpPayload;
    messageInfo(`📈 文章《${payload.articleTitle}》升级至 Lv${payload.newLevel}`);
  });

  /** 神作晋升：MasterpieceAnimation 弹窗 + Toast */
  on('masterpiece', (data) => {
    const payload = data as RpgMasterpiecePayload;
    masterpieceData.value = payload;
    masterpieceVisible.value = true;
    messageInfo(`🏆 文章《${payload.articleTitle}》晋升神作！`);
  });

  /** 钻石变动：Toast（增减分色）→ refresh status / inventory */
  on('currencyChange', (data) => {
    const payload = data as RpgCurrencyChangePayload;
    const label = payload.reasonLabel || payload.reason;
    if (payload.delta > 0) {
      messageInfo(`💎 +${payload.delta} 钻石（${label}），余额 ${payload.balance}`);
    }
    else if (payload.delta < 0) {
      messageWarning(`💎 ${payload.delta} 钻石（${label}），余额 ${payload.balance}`);
    }
    void fetchStatus();
    notifyDataRefresh('status');
    notifyDataRefresh('inventory');
  });

  /** 获得物品：Toast（含稀有度）→ refresh inventory */
  on('itemGranted', (data) => {
    const payload = data as RpgItemGrantedPayload;
    const name = payload.config?.name || payload.itemCode;
    const rarity = payload.config?.rarityLabel ? ` [${payload.config.rarityLabel}]` : '';
    messageInfo(`🎁 获得 ${name}${rarity} x${payload.quantity}`);
    notifyDataRefresh('inventory');
  });

  /** 抽奖券变动：Toast → refresh status */
  on('lotteryTicketChange', (data) => {
    const payload = data as RpgLotteryTicketChangePayload;
    const sign = payload.delta > 0 ? '+' : '';
    messageInfo(
      `🎫 抽奖券 ${sign}${payload.delta}（${payload.reasonLabel}），当前 ${payload.total} 张`,
    );
    void fetchStatus();
    notifyDataRefresh('status');
  });

  /** 宠物孵化：Toast → refresh pets */
  on('petHatched', (data) => {
    const payload = data as RpgPetHatchedPayload;
    messageInfo(`🐾 孵化成功：${payload.name} [${payload.rarityLabel}]`);
    notifyDataRefresh('pets');
  });

  /** 护盾抵消扣血：Toast → fetchBuffs → refresh buffs */
  on('shieldUsed', (data) => {
    const payload = data as RpgShieldUsedPayload;
    messageInfo(`🛡️ ${payload.buffName || '护盾'}已抵消敏感词扣血`);
    void fetchBuffs();
    notifyDataRefresh('buffs');
  });

  /** 连接时天气加成：Toast 当日天气 → refresh status */
  on('weatherBuff', (data) => {
    const payload = data as RpgWeatherBuffPayload;
    messageInfo(`🌤️ 今日天气：${payload.label}`);
    notifyDataRefresh('status');
  });

  /** 活动变更/连接快照：按 type Toast（开始/结束/进行中）→ refresh status */
  on('activityUpdate', (data) => {
    const payload = data as RpgActivityUpdatePayload;
    if (payload.type === 'start') {
      const names = payload.activities.map(a => a.name).join('、');
      messageInfo(`🎉 活动开始：${names}`);
    }
    else if (payload.type === 'end') {
      const names = payload.activities.map(a => a.name).join('、');
      messageInfo(`📅 活动结束：${names}`);
    }
    else if (payload.activities.length) {
      const names = payload.activities.map(a => a.name).join('、');
      messageInfo(`🎪 进行中活动：${names}`);
    }
    notifyDataRefresh('status');
  });

  /** 排行榜 Top10 变动：Toast → refresh leaderboard */
  on('rankChange', (data) => {
    const payload = data as RpgRankChangePayload;
    const periodLabel = LEADERBOARD_PERIOD_LABEL[payload.period] || payload.period;
    messageInfo(`🏅 ${periodLabel}第 ${payload.rank} 名！`);
    notifyDataRefresh('leaderboard');
  });

  /** 公会事件：Toast（成员加入/离开/创建）→ refresh guild */
  on('guildEvent', (data) => {
    const payload = data as RpgGuildEventPayload;
    messageInfo(formatGuildEventMessage(payload.type, payload.nickname, payload.guildName));
    notifyDataRefresh('guild');
  });

  /** Buff 过期：Warning Toast → fetchBuffs → refresh buffs */
  on('buffExpired', (data) => {
    const payload = data as RpgBuffExpiredPayload;
    messageWarning(`⏰ 增益「${payload.name}」已过期`);
    void fetchBuffs();
    notifyDataRefresh('buffs');
  });

  const closeLevelUp = () => {
    levelUpVisible.value = false;
    levelUpData.value = null;
  };

  const closeAchievement = () => {
    achievementVisible.value = false;
    achievementName.value = '';
    achievementExpReward.value = 0;
  };

  const closeMasterpiece = () => {
    masterpieceVisible.value = false;
    masterpieceData.value = null;
  };

  const closeSocialFeedback = () => {
    socialFeedbackVisible.value = false;
    socialFeedbackData.value = null;
  };

  return {
    levelUpVisible,
    levelUpData,
    achievementVisible,
    achievementName,
    achievementExpReward,
    masterpieceVisible,
    masterpieceData,
    socialFeedbackVisible,
    socialFeedbackData,
    closeLevelUp,
    closeAchievement,
    closeMasterpiece,
    closeSocialFeedback,
  };
}
