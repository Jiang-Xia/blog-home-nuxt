import { ref } from 'vue';
import { useRpg } from '~~/composables/use-rpg';
import { useRpgLotterySession } from '~~/composables/use-rpg-lottery-session';
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
import { itemGrantedSfxKey } from '~~/constants/rpg-audio';
import type { RpgSocialFeedbackData } from '~~/types/rpg';
import { shouldShowItemRevealCelebration } from '~~/utils/rpg-rarity';
import { shouldShowCurrencyGainFx, formatRpgCurrencyReasonLabel } from '~~/utils/rpg-currency';
import { messageInfo, messageSuccess, messageWarning } from '@/utils/toast';

/** 前端 expGain 二次防抖窗口（与后端 8s 互补） */
const EXP_TOAST_DEBOUNCE_MS = 5000;

/** 短暂全屏脉冲特效类型（RpgScreenPulseFx） */
export type RpgScreenPulseKind
  = | 'lifeDeduct'
    | 'lifeRecover'
    | 'shield'
    | 'buffGrant'
    | 'buffExpire';

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
  const { deferCelebration } = useRpgLotterySession();

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

  const petHatchVisible = ref(false);
  const petHatchData = ref<RpgPetHatchedPayload | null>(null);

  const itemRevealVisible = ref(false);
  const itemRevealData = ref<RpgItemGrantedPayload | null>(null);

  const rankChangeVisible = ref(false);
  const rankChangeData = ref<RpgRankChangePayload | null>(null);

  const questRewardVisible = ref(false);
  const questRewardData = ref<RpgQuestRewardPayload | null>(null);

  const questCompleteVisible = ref(false);
  const questCompleteData = ref<RpgQuestCompletePayload | null>(null);

  const screenPulseTick = ref(0);
  const screenPulseKind = ref<RpgScreenPulseKind | null>(null);
  const screenPulseLabel = ref('');

  const currencyGainTick = ref(0);
  const currencyGainData = ref<RpgCurrencyChangePayload | null>(null);

  const activityBannerVisible = ref(false);
  const activityBannerData = ref<RpgActivityUpdatePayload | null>(null);

  const banPunishVisible = ref(false);
  const banPunishData = ref<RpgBanStatusPayload | null>(null);

  const articleLevelUpVisible = ref(false);
  const articleLevelUpData = ref<RpgArticleLevelUpPayload | null>(null);

  /** 触发短暂屏幕脉冲（可连续同类型） */
  const triggerScreenPulse = (kind: RpgScreenPulseKind, label?: string) => {
    screenPulseKind.value = kind;
    screenPulseLabel.value = label ?? '';
    screenPulseTick.value += 1;
  };

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

  /** 升级：动画与数据刷新分离；动画延后至抽奖揭晓结束 */
  on('levelUp', (data) => {
    const payload = data as LevelUpResult;
    if (rpgStatus.value) {
      rpgStatus.value.level = payload.newLevel;
    }
    void fetchStatus();
    notifyDataRefresh('status');
    deferCelebration(() => {
      levelUpData.value = payload;
      levelUpVisible.value = true;
    });
  });

  /** 生命值变化：脉冲特效 + Toast；同步 HP → fetchStatus → refresh status */
  on('lifeChange', (data) => {
    const payload = data as RpgLifeChangePayload;
    if (rpgStatus.value) {
      rpgStatus.value.lifeValue = payload.currentLife;
    }
    void fetchStatus();
    notifyDataRefresh('status');
    deferCelebration(() => {
      if (payload.lifeRecovered && payload.lifeRecovered > 0) {
        triggerScreenPulse('lifeRecover');
        messageInfo(`💚 生命值 +${payload.lifeRecovered}（当前 ${payload.currentLife}）`);
      }
      else if (payload.lifeDeducted > 0) {
        triggerScreenPulse('lifeDeduct');
        messageWarning(
          `⚠️ 命中敏感词，生命值 -${payload.lifeDeducted}（剩余 ${payload.currentLife}）`,
        );
      }
    });
  });

  /** 禁言处罚：全屏警示（仅 banned）+ Toast；同步 banStatus → refresh status */
  on('banStatus', (data) => {
    const payload = data as RpgBanStatusPayload;
    if (banStatus.value) {
      banStatus.value.banned = payload.banned;
      banStatus.value.banEndTime = payload.banEndTime;
    }
    else {
      void fetchBanStatus();
    }
    void fetchBanStatus();
    notifyDataRefresh('status');
    deferCelebration(() => {
      if (payload.banned) {
        const reason = payload.banReason ? `：${payload.banReason}` : '';
        messageWarning(`🔇 您已被禁言${reason}`);
        banPunishData.value = payload;
        banPunishVisible.value = true;
      }
    });
  });

  /** 成就达成：AchievementAnimation 弹窗 → refresh achievements / quests / status */
  on('achievementComplete', (data) => {
    const payload = data as RpgAchievementCompletePayload;
    void Promise.all([fetchAchievements(), fetchQuests(), fetchStatus()]);
    notifyDataRefresh('achievements');
    notifyDataRefresh('quests');
    notifyDataRefresh('status');
    deferCelebration(() => {
      achievementName.value = payload.name || payload.achievementName || '新成就';
      achievementExpReward.value = payload.expReward ?? 0;
      achievementVisible.value = true;
    });
  });

  /** 任务奖励已领：全屏庆祝 + Toast → refresh quests / status */
  on('questReward', (data) => {
    const payload = data as RpgQuestRewardPayload;
    void Promise.all([fetchQuests(), fetchStatus()]);
    notifyDataRefresh('quests');
    notifyDataRefresh('status');
    deferCelebration(() => {
      const label = payload.questName ? `「${payload.questName}」` : '任务';
      const exp = payload.expReward;
      messageInfo(`✨ ${label} 奖励已发放${exp ? ` +${exp} EXP` : ''}`);
      questRewardData.value = payload;
      questRewardVisible.value = true;
    });
  });

  /** 获得 Buff：紫色脉冲 + Toast → fetchBuffs → refresh buffs */
  on('buffGranted', (data) => {
    const payload = data as RpgBuffGrantedPayload;
    void fetchBuffs();
    notifyDataRefresh('buffs');
    deferCelebration(() => {
      messageInfo(`✨ 获得增益：${payload.name}`);
      triggerScreenPulse('buffGrant', payload.name);
    });
  });

  /** 任务完成待领：轻量徽章 + Toast → refresh quests */
  on('questComplete', (data) => {
    const payload = data as RpgQuestCompletePayload;
    void fetchQuests();
    notifyDataRefresh('quests');
    deferCelebration(() => {
      const label = payload.questName ? `「${payload.questName}」` : '任务';
      messageInfo(`🎯 ${label} 已完成，去领取奖励吧！`);
      questCompleteData.value = payload;
      questCompleteVisible.value = true;
    });
  });

  /** 经验获得（未升级）：5s 防抖合并 Toast → refresh status */
  on('expGain', (data) => {
    const payload = data as RpgExpGainPayload;
    void fetchStatus();
    notifyDataRefresh('status');
    if (payload.amount > 0) {
      deferCelebration(() => {
        scheduleExpToast(payload.amount, payload.reasonLabels || []);
      });
    }
  });

  /** 打开社交反馈全屏弹窗（收方由 WS 触发，非发送方页面操作） */
  const showSocialFeedback = (feedback: RpgSocialFeedbackData) => {
    socialFeedbackData.value = feedback;
    socialFeedbackVisible.value = true;
  };

  /** 收到社交互动：Toast + 全屏弹框；同步 HP → refresh status */
  on('socialReceived', (data) => {
    const payload = data as RpgSocialReceivedPayload;
    if (rpgStatus.value) {
      rpgStatus.value.lifeValue = payload.currentLife;
    }
    void fetchStatus();
    notifyDataRefresh('status');
    deferCelebration(() => {
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
    });
  });

  /** 收到打赏：Toast + 全屏弹框 → refresh status / inventory */
  on('tipReceived', (data) => {
    const payload = data as RpgTipReceivedPayload;
    void fetchStatus();
    notifyDataRefresh('status');
    notifyDataRefresh('inventory');
    deferCelebration(() => {
      const from = payload.fromNickname || '冒险者';
      messageSuccess(`💎 收到打赏 +${payload.amount} 钻石《${payload.articleTitle}》`);
      showSocialFeedback({
        kind: 'tip',
        fromNickname: from,
        amount: payload.amount,
        articleTitle: payload.articleTitle,
      });
    });
  });

  /** 文章升级：顶部徽章 + Toast */
  on('articleLevelUp', (data) => {
    const payload = data as RpgArticleLevelUpPayload;
    deferCelebration(() => {
      messageInfo(`📈 文章《${payload.articleTitle}》升级至 Lv${payload.newLevel}`);
      articleLevelUpData.value = payload;
      articleLevelUpVisible.value = true;
    });
  });

  /** 神作晋升：MasterpieceAnimation 弹窗 + Toast */
  on('masterpiece', (data) => {
    const payload = data as RpgMasterpiecePayload;
    deferCelebration(() => {
      masterpieceData.value = payload;
      masterpieceVisible.value = true;
      messageInfo(`🏆 文章《${payload.articleTitle}》晋升神作！`);
    });
  });

  /** 充值到账：刷新状态与背包（弹窗已关时仍更新余额） */
  on('rechargeComplete', () => {
    void fetchStatus();
    notifyDataRefresh('status');
    notifyDataRefresh('inventory');
  });

  /** 钻石变动：大额增加飞入特效 + Toast → refresh status / inventory */
  on('currencyChange', (data) => {
    const payload = data as RpgCurrencyChangePayload;
    void fetchStatus();
    notifyDataRefresh('status');
    notifyDataRefresh('inventory');
    deferCelebration(() => {
      const label = formatRpgCurrencyReasonLabel(payload.reason, payload.reasonLabel);
      if (payload.delta > 0) {
        messageInfo(`💎 +${payload.delta} 钻石（${label}），余额 ${payload.balance}`);
        if (shouldShowCurrencyGainFx(payload.delta)) {
          currencyGainData.value = payload;
          currencyGainTick.value += 1;
        }
      }
      else if (payload.delta < 0) {
        messageWarning(`💎 ${payload.delta} 钻石（${label}），余额 ${payload.balance}`);
      }
    });
  });

  /** 获得物品：史诗/传说非抽奖来源全屏揭晓；其余 Toast + 音效 → refresh inventory */
  on('itemGranted', (data) => {
    const payload = data as RpgItemGrantedPayload;
    notifyDataRefresh('inventory');
    deferCelebration(() => {
      const name = payload.config?.name || payload.itemCode;
      const rarity = payload.config?.rarityLabel ? ` [${payload.config.rarityLabel}]` : '';
      messageInfo(`🎁 获得 ${name}${rarity} x${payload.quantity}`);
      const showReveal
        = payload.source !== 'lottery'
          && shouldShowItemRevealCelebration(payload.config?.rarityLabel);
      if (showReveal) {
        itemRevealData.value = payload;
        itemRevealVisible.value = true;
      }
      // 抽奖流程已有揭晓音效；全屏揭晓由 RpgItemRevealAnimation 播音
      else if (payload.source !== 'lottery') {
        void useRpgAudio().playSfx(itemGrantedSfxKey(payload.config?.rarityLabel));
      }
    });
  });

  /** 抽奖券变动：Toast → refresh status */
  on('lotteryTicketChange', (data) => {
    const payload = data as RpgLotteryTicketChangePayload;
    void fetchStatus();
    notifyDataRefresh('status');
    deferCelebration(() => {
      const sign = payload.delta > 0 ? '+' : '';
      messageInfo(
        `🎫 抽奖券 ${sign}${payload.delta}（${payload.reasonLabel}），当前 ${payload.total} 张`,
      );
    });
  });

  /** 宠物孵化：全屏动画（音效在 RpgPetHatchAnimation）→ refresh pets */
  on('petHatched', (data) => {
    const payload = data as RpgPetHatchedPayload;
    notifyDataRefresh('pets');
    deferCelebration(() => {
      messageInfo(`🐾 孵化成功：${payload.name} [${payload.rarityLabel}]`);
      petHatchData.value = payload;
      petHatchVisible.value = true;
    });
  });

  /** 护盾抵消扣血：护盾脉冲 + Toast → fetchBuffs → refresh buffs */
  on('shieldUsed', (data) => {
    const payload = data as RpgShieldUsedPayload;
    void fetchBuffs();
    notifyDataRefresh('buffs');
    deferCelebration(() => {
      triggerScreenPulse('shield', payload.buffName || '护盾');
      messageInfo(`🛡️ ${payload.buffName || '护盾'}已抵消敏感词扣血`);
    });
  });

  /** 连接时天气加成：Toast 当日天气 → refresh status */
  on('weatherBuff', (data) => {
    const payload = data as RpgWeatherBuffPayload;
    notifyDataRefresh('status');
    deferCelebration(() => {
      messageInfo(`🌤️ 今日天气：${payload.label}`);
    });
  });

  /** 活动变更：开始类型顶部横幅 + Toast；其余仍 Toast → refresh status */
  on('activityUpdate', (data) => {
    const payload = data as RpgActivityUpdatePayload;
    notifyDataRefresh('status');
    deferCelebration(() => {
      if (payload.type === 'start') {
        const names = payload.activities.map(a => a.name).join('、');
        messageInfo(`🎉 活动开始：${names}`);
        if (payload.activities.length) {
          activityBannerData.value = payload;
          activityBannerVisible.value = true;
        }
      }
      else if (payload.type === 'end') {
        const names = payload.activities.map(a => a.name).join('、');
        messageInfo(`📅 活动结束：${names}`);
      }
      else if (payload.activities.length) {
        const names = payload.activities.map(a => a.name).join('、');
        messageInfo(`🎪 进行中活动：${names}`);
      }
    });
  });

  /** 排行榜 Top10 变动：全屏庆祝 + Toast → refresh leaderboard */
  on('rankChange', (data) => {
    const payload = data as RpgRankChangePayload;
    notifyDataRefresh('leaderboard');
    deferCelebration(() => {
      const periodLabel = LEADERBOARD_PERIOD_LABEL[payload.period] || payload.period;
      messageInfo(`🏅 ${periodLabel}第 ${payload.rank} 名！`);
      rankChangeData.value = payload;
      rankChangeVisible.value = true;
    });
  });

  /** 公会事件：Toast（成员加入/离开/创建）→ refresh guild */
  on('guildEvent', (data) => {
    const payload = data as RpgGuildEventPayload;
    notifyDataRefresh('guild');
    deferCelebration(() => {
      messageInfo(formatGuildEventMessage(payload.type, payload.nickname, payload.guildName));
    });
  });

  /** Buff 过期：灰色脉冲 + Warning Toast → fetchBuffs → refresh buffs */
  on('buffExpired', (data) => {
    const payload = data as RpgBuffExpiredPayload;
    void fetchBuffs();
    notifyDataRefresh('buffs');
    deferCelebration(() => {
      messageWarning(`⏰ 增益「${payload.name}」已过期`);
      triggerScreenPulse('buffExpire', payload.name);
    });
  });

  /** 关闭升级全屏弹窗并清空 payload */
  const closeLevelUp = () => {
    levelUpVisible.value = false;
    levelUpData.value = null;
  };

  /** 关闭成就全屏弹窗 */
  const closeAchievement = () => {
    achievementVisible.value = false;
    achievementName.value = '';
    achievementExpReward.value = 0;
  };

  /** 关闭神作全屏弹窗 */
  const closeMasterpiece = () => {
    masterpieceVisible.value = false;
    masterpieceData.value = null;
  };

  /** 关闭社交反馈全屏弹窗 */
  const closeSocialFeedback = () => {
    socialFeedbackVisible.value = false;
    socialFeedbackData.value = null;
  };

  /** 关闭宠物孵化全屏弹窗 */
  const closePetHatch = () => {
    petHatchVisible.value = false;
    petHatchData.value = null;
  };

  /** 关闭史诗/传说物品揭晓全屏弹窗 */
  const closeItemReveal = () => {
    itemRevealVisible.value = false;
    itemRevealData.value = null;
  };

  /** 关闭排行榜变动全屏弹窗 */
  const closeRankChange = () => {
    rankChangeVisible.value = false;
    rankChangeData.value = null;
  };

  /** 关闭任务领奖全屏弹窗 */
  const closeQuestReward = () => {
    questRewardVisible.value = false;
    questRewardData.value = null;
  };

  /** 关闭任务完成徽章 */
  const closeQuestComplete = () => {
    questCompleteVisible.value = false;
    questCompleteData.value = null;
  };

  /** 关闭活动开始横幅 */
  const closeActivityBanner = () => {
    activityBannerVisible.value = false;
    activityBannerData.value = null;
  };

  /** 关闭禁言处罚全屏警示 */
  const closeBanPunish = () => {
    banPunishVisible.value = false;
    banPunishData.value = null;
  };

  /** 关闭文章升级徽章 */
  const closeArticleLevelUp = () => {
    articleLevelUpVisible.value = false;
    articleLevelUpData.value = null;
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
    petHatchVisible,
    petHatchData,
    itemRevealVisible,
    itemRevealData,
    closePetHatch,
    closeItemReveal,
    rankChangeVisible,
    rankChangeData,
    closeRankChange,
    questRewardVisible,
    questRewardData,
    closeQuestReward,
    questCompleteVisible,
    questCompleteData,
    closeQuestComplete,
    screenPulseTick,
    screenPulseKind,
    screenPulseLabel,
    currencyGainTick,
    currencyGainData,
    activityBannerVisible,
    activityBannerData,
    closeActivityBanner,
    banPunishVisible,
    banPunishData,
    closeBanPunish,
    articleLevelUpVisible,
    articleLevelUpData,
    closeArticleLevelUp,
  };
}
