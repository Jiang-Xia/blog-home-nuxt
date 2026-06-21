/**
 * RPG WebSocket 本地测试挡板
 *
 * 可用范围（见 rpg-dev-mock-guard）：
 * - 开发环境：任意页面（含 /rpg 抽奖联动）
 * - 生产环境：仅 /tool/test
 */
import {
  useRealtimeSocket,
  type RealtimeSocketEvent,
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
  type SiteNotificationPayload,
} from '~~/composables/use-realtime-socket';
import type { LevelUpResult, RpgStatus } from '~~/types/rpg';
import { canUseRpgDevMock } from '~~/utils/rpg-dev-mock-guard';
import { messageInfo, messageWarning } from '@/utils/toast';

export const RPG_MOCK_LOTTERY_LEVEL_UP_KEY = 'rpg:mock-lottery-level-up';
/** localStorage：抽奖 API 完成后联动的挡板项 key（见 RPG_LOTTERY_DRAW_MOCK_OPTIONS） */
export const RPG_MOCK_LOTTERY_DRAW_KEY = 'rpg:mock-lottery-draw';

/** 抽奖动画期间可联动的全屏弹窗 / 特殊 UI（dev 测试层叠用） */
export interface RpgLotteryDrawMockOption {
  key: string;
  label: string;
  icon?: string;
  scenarioKey?: string;
  kind: 'off' | 'ws' | 'recharge';
}

export const RPG_LOTTERY_DRAW_MOCK_OPTIONS: RpgLotteryDrawMockOption[] = [
  { key: 'off', label: '关闭', kind: 'off' },
  { key: 'level-up', label: '升级', icon: '⬆️', scenarioKey: 'level-up', kind: 'ws' },
  { key: 'achievement', label: '成就达成', icon: '🏆', scenarioKey: 'achievement', kind: 'ws' },
  { key: 'masterpiece', label: '神作晋升', icon: '✨', scenarioKey: 'masterpiece', kind: 'ws' },
  { key: 'social-cheer', label: '收到加油', icon: '💪', scenarioKey: 'social-cheer', kind: 'ws' },
  { key: 'social-egg', label: '收到鸡蛋', icon: '🥚', scenarioKey: 'social-egg', kind: 'ws' },
  { key: 'social-flower', label: '收到鲜花', icon: '🌸', scenarioKey: 'social-flower', kind: 'ws' },
  { key: 'tip-received', label: '收到打赏', icon: '💎', scenarioKey: 'tip-received', kind: 'ws' },
  { key: 'recharge', label: '钻石充值', icon: '💳', kind: 'recharge' },
];

/** 与 server RealtimeWsEvents / use-realtime-socket ALL_EVENTS 对齐（共 23 项） */
export const RPG_ALL_WS_EVENTS: RealtimeSocketEvent[] = [
  'levelUp',
  'lifeChange',
  'banStatus',
  'achievementComplete',
  'questReward',
  'buffGranted',
  'questComplete',
  'expGain',
  'socialReceived',
  'tipReceived',
  'articleLevelUp',
  'masterpiece',
  'currencyChange',
  'rechargeComplete',
  'itemGranted',
  'lotteryTicketChange',
  'petHatched',
  'shieldUsed',
  'weatherBuff',
  'activityUpdate',
  'rankChange',
  'guildEvent',
  'buffExpired',
  'siteNotification',
];

/** 挡板构造 payload 时参考的冒险状态（等级、生命、钻石等） */
export interface RpgMockContext {
  status?: RpgStatus | null;
}

/** 测试面板单个按钮：事件类型 + 可选自定义 payload */
export interface RpgMockScenario {
  key: string;
  group: string;
  label: string;
  icon?: string;
  event: RealtimeSocketEvent;
  btnClass?: string;
  payload?: unknown | ((ctx: RpgMockContext) => unknown);
}

/** 挡板是否可用（dev 全站，生产仅 /tool/test） */
function isRpgDevMockEnabled(): boolean {
  return canUseRpgDevMock();
}

/** 注入本地 WS 事件（需 RpgGlobalInit 已挂载；/tool/test 会自动挂载） */
export function dispatchRpgMockEvent(
  event: RealtimeSocketEvent,
  payload?: unknown,
  ctx: RpgMockContext = {},
): boolean {
  if (!isRpgDevMockEnabled()) return false;

  const token = useToken();
  if (!token.value) {
    messageWarning('[WS挡板] 请先登录，否则 handlers 未初始化');
    return false;
  }

  const { dispatchLocalEvent } = useRealtimeSocket();
  dispatchLocalEvent(event, payload ?? buildDefaultRpgMockPayload(event, ctx));
  messageInfo(`[WS挡板] ${event}`);
  if (event === 'expGain') {
    messageInfo('[WS挡板] expGain 的 Toast 约 5s 后合并显示');
  }
  return true;
}

/** 运行预置场景 */
export function runRpgMockScenario(scenario: RpgMockScenario, ctx: RpgMockContext = {}): void {
  const payload = typeof scenario.payload === 'function' ? scenario.payload(ctx) : scenario.payload;
  dispatchRpgMockEvent(scenario.event, payload, ctx);
}

/** 根据当前等级构造升级数据 */
export function buildMockLevelUp(status: RpgStatus | null): LevelUpResult {
  const oldLevel = Math.max(1, status?.level ?? 4);
  const newLevel = oldLevel + 1;
  return {
    oldLevel,
    newLevel,
    unlockedRewards: [
      {
        level: newLevel,
        currencyReward: 50,
        currencyName: '钻石',
        avatarFrame: { code: 'frame_bronze', name: '中级头像框', rarity: 'rare' },
        title: { code: 'title_bronze', name: '青铜达人', rarity: 'rare' },
      },
    ],
  };
}

/** 各事件默认 mock payload */
export function buildDefaultRpgMockPayload(
  event: RealtimeSocketEvent,
  ctx: RpgMockContext,
): unknown {
  const life = ctx.status?.lifeValue ?? 80;
  const currency = ctx.status?.currency ?? 200;
  const tickets = ctx.status?.lotteryTickets ?? 3;

  const map: Record<RealtimeSocketEvent, unknown> = {
    levelUp: buildMockLevelUp(ctx.status ?? null),
    lifeChange: {
      lifeDeducted: 5,
      currentLife: Math.max(0, life - 5),
    } satisfies RpgLifeChangePayload,
    banStatus: {
      banned: true,
      banEndTime: new Date(Date.now() + 3600_000).toISOString(),
      banReason: '开发挡板：敏感词测试',
    } satisfies RpgBanStatusPayload,
    achievementComplete: {
      code: 'comment_master',
      name: '评论达人',
      expReward: 120,
    } satisfies RpgAchievementCompletePayload,
    questReward: {
      questCode: 'daily_sign',
      questName: '每日签到',
      expReward: 30,
    } satisfies RpgQuestRewardPayload,
    buffGranted: {
      code: 'exp_boost_small',
      name: '经验微增',
      description: '经验 +20%，1 小时',
      expireAt: new Date(Date.now() + 3600_000).toISOString(),
    } satisfies RpgBuffGrantedPayload,
    questComplete: {
      questCode: 'daily_comment',
      questName: '发表 1 条评论',
      expReward: 20,
      hpReward: 5,
    } satisfies RpgQuestCompletePayload,
    expGain: {
      amount: 15,
      reasons: ['lottery'],
      reasonLabels: ['抽奖'],
    } satisfies RpgExpGainPayload,
    socialReceived: {
      fromUid: 2,
      fromNickname: '测试冒险者',
      action: 'cheer',
      hpDelta: 10,
      currentLife: Math.min(100, life + 10),
      reputationDelta: 0,
    } satisfies RpgSocialReceivedPayload,
    tipReceived: {
      fromUid: 2,
      fromNickname: '测试读者',
      amount: 50,
      articleId: 42,
      articleTitle: '从零搭建全栈博客系统',
      balance: currency + 50,
    } satisfies RpgTipReceivedPayload,
    articleLevelUp: {
      articleId: 42,
      articleTitle: '测试文章',
      oldLevel: 2,
      newLevel: 3,
    } satisfies RpgArticleLevelUpPayload,
    masterpiece: {
      articleId: 42,
      articleTitle: '从零搭建全栈博客系统',
    } satisfies RpgMasterpiecePayload,
    currencyChange: {
      delta: 50,
      balance: currency + 50,
      reason: 'dev_mock',
      reasonLabel: '开发挡板',
    } satisfies RpgCurrencyChangePayload,
    itemGranted: {
      itemCode: 'lottery_title_writer',
      quantity: 1,
      source: 'lottery',
      sourceLabel: '抽奖',
      config: {
        name: '抽奖称号·作家',
        rarityLabel: '稀有',
        rarityColor: '#3b82f6',
        itemTypeLabel: '称号',
      },
    } satisfies RpgItemGrantedPayload,
    lotteryTicketChange: {
      delta: 1,
      total: tickets + 1,
      reason: 'lottery_reward',
      reasonLabel: '抽奖奖励',
    } satisfies RpgLotteryTicketChangePayload,
    petHatched: {
      petId: 1,
      petCode: 'pet_slime',
      name: '史莱姆',
      rarityLabel: '普通',
      rarityColor: '#94a3b8',
    } satisfies RpgPetHatchedPayload,
    shieldUsed: {
      buffName: '护盾卷轴',
    } satisfies RpgShieldUsedPayload,
    weatherBuff: {
      label: '晴朗',
      expBoost: 0.1,
      weather: 'sunny',
    } satisfies RpgWeatherBuffPayload,
    activityUpdate: {
      type: 'start',
      activities: [
        { code: 'weekend_exp', name: '周末经验加成', description: 'EXP +20%', expBuffRate: 0.2 },
      ],
    } satisfies RpgActivityUpdatePayload,
    rankChange: {
      type: 'exp',
      period: 'week',
      rank: 3,
      score: 1280,
    } satisfies RpgRankChangePayload,
    guildEvent: {
      type: 'memberJoined',
      guildId: 1,
      guildName: '测试公会',
      uid: 2,
      nickname: '新成员',
    } satisfies RpgGuildEventPayload,
    buffExpired: {
      code: 'exp_boost_small',
      name: '经验微增',
    } satisfies RpgBuffExpiredPayload,
    siteNotification: {
      notification: {
        id: Date.now(),
        type: 'comment',
        payload: { articleTitle: '测试文章', fromNickname: '读者甲' },
        read: false,
        createTime: new Date().toISOString(),
      },
      unreadCount: 1,
    } satisfies SiteNotificationPayload,
  };

  return map[event];
}

/** 预置场景（测试面板按钮） */
export const RPG_MOCK_SCENARIOS: RpgMockScenario[] = [
  {
    key: 'level-up',
    group: '成长反馈',
    label: '升级',
    icon: '⬆️',
    event: 'levelUp',
    btnClass: 'btn-warning',
  },
  {
    key: 'achievement',
    group: '成长反馈',
    label: '成就达成',
    icon: '🏆',
    event: 'achievementComplete',
    btnClass: 'btn-warning',
  },
  {
    key: 'masterpiece',
    group: '成长反馈',
    label: '神作晋升',
    icon: '✨',
    event: 'masterpiece',
    btnClass: 'btn-warning',
  },
  { key: 'exp-gain', group: '成长反馈', label: '经验获得', icon: '✨', event: 'expGain' },
  {
    key: 'article-level',
    group: '成长反馈',
    label: '文章升级',
    icon: '📈',
    event: 'articleLevelUp',
  },

  { key: 'quest-complete', group: '任务', label: '任务完成', icon: '🎯', event: 'questComplete' },
  { key: 'quest-reward', group: '任务', label: '任务领奖', icon: '🎁', event: 'questReward' },

  {
    key: 'currency-plus',
    group: '经济物品',
    label: '钻石 +50',
    icon: '💎',
    event: 'currencyChange',
    btnClass: 'btn-accent',
  },
  {
    key: 'currency-small',
    group: '经济物品',
    label: '钻石 +5',
    icon: '💎',
    event: 'currencyChange',
    payload: (ctx: RpgMockContext) =>
      ({
        delta: 5,
        balance: (ctx.status?.currency ?? 200) + 5,
        reason: 'dev_mock',
        reasonLabel: '开发挡板（小额）',
      }) satisfies RpgCurrencyChangePayload,
  },
  {
    key: 'currency-minus',
    group: '经济物品',
    label: '钻石 -10',
    icon: '💸',
    event: 'currencyChange',
    btnClass: 'btn-warning',
    payload: (ctx: RpgMockContext) =>
      ({
        delta: -10,
        balance: Math.max(0, (ctx.status?.currency ?? 200) - 10),
        reason: 'dev_mock',
        reasonLabel: '开发挡板',
      }) satisfies RpgCurrencyChangePayload,
  },
  {
    key: 'ticket-plus',
    group: '经济物品',
    label: '抽奖券 +1',
    icon: '🎫',
    event: 'lotteryTicketChange',
  },
  { key: 'item-granted', group: '经济物品', label: '获得物品', icon: '🎁', event: 'itemGranted' },
  {
    key: 'item-granted-epic',
    group: '经济物品',
    label: '史诗物品',
    icon: '💜',
    event: 'itemGranted',
    btnClass: 'btn-accent',
    payload: () =>
      ({
        itemCode: 'title_epic_writer',
        quantity: 1,
        source: 'quest',
        sourceLabel: '任务奖励',
        config: {
          name: '史诗称号·文豪',
          rarityLabel: '史诗',
          rarityColor: '#8b5cf6',
          itemTypeLabel: '称号',
        },
      }) satisfies RpgItemGrantedPayload,
  },
  {
    key: 'item-granted-legendary',
    group: '经济物品',
    label: '传说物品',
    icon: '🌟',
    event: 'itemGranted',
    btnClass: 'btn-warning',
    payload: () =>
      ({
        itemCode: 'frame_legendary_gold',
        quantity: 1,
        source: 'achievement',
        sourceLabel: '成就奖励',
        config: {
          name: '传说头像框·金辉',
          rarityLabel: '传说',
          rarityColor: '#f59e0b',
          itemTypeLabel: '头像框',
        },
      }) satisfies RpgItemGrantedPayload,
  },

  { key: 'buff-granted', group: 'Buff', label: '获得 Buff', icon: '✨', event: 'buffGranted' },
  {
    key: 'buff-expired',
    group: 'Buff',
    label: 'Buff 过期',
    icon: '⏰',
    event: 'buffExpired',
    btnClass: 'btn-warning',
  },
  { key: 'shield-used', group: 'Buff', label: '护盾抵消', icon: '🛡️', event: 'shieldUsed' },
  { key: 'weather', group: 'Buff', label: '今日天气', icon: '🌤️', event: 'weatherBuff' },

  {
    key: 'social-cheer',
    group: '社交互动',
    label: '收到加油',
    icon: '💪',
    event: 'socialReceived',
    payload: (ctx: RpgMockContext) =>
      ({
        fromUid: 2,
        fromNickname: '测试冒险者',
        action: 'cheer',
        hpDelta: 10,
        currentLife: Math.min(100, (ctx.status?.lifeValue ?? 80) + 10),
        reputationDelta: 0,
      }) satisfies RpgSocialReceivedPayload,
  },
  {
    key: 'social-egg',
    group: '社交互动',
    label: '收到鸡蛋',
    icon: '🥚',
    event: 'socialReceived',
    btnClass: 'btn-warning',
    payload: (ctx: RpgMockContext) =>
      ({
        fromUid: 2,
        fromNickname: '测试冒险者',
        action: 'egg',
        hpDelta: -5,
        currentLife: Math.max(0, (ctx.status?.lifeValue ?? 80) - 5),
        reputationDelta: 0,
      }) satisfies RpgSocialReceivedPayload,
  },
  {
    key: 'social-flower',
    group: '社交互动',
    label: '收到鲜花',
    icon: '🌸',
    event: 'socialReceived',
    btnClass: 'btn-secondary',
    payload: {
      fromUid: 2,
      fromNickname: '测试冒险者',
      action: 'flower',
      hpDelta: 0,
      currentLife: 80,
      reputationDelta: 3,
    } satisfies RpgSocialReceivedPayload,
  },
  {
    key: 'tip-received',
    group: '社交互动',
    label: '收到打赏',
    icon: '💎',
    event: 'tipReceived',
    btnClass: 'btn-accent',
  },

  {
    key: 'life-recover',
    group: '角色状态',
    label: '生命恢复',
    icon: '💚',
    event: 'lifeChange',
    payload: (ctx: RpgMockContext) =>
      ({
        lifeDeducted: 0,
        lifeRecovered: 10,
        currentLife: Math.min(100, (ctx.status?.lifeValue ?? 80) + 10),
      }) satisfies RpgLifeChangePayload,
  },
  {
    key: 'life-deduct',
    group: '角色状态',
    label: '敏感词扣血',
    icon: '⚠️',
    event: 'lifeChange',
    btnClass: 'btn-warning',
    payload: (ctx: RpgMockContext) =>
      ({
        lifeDeducted: 5,
        currentLife: Math.max(0, (ctx.status?.lifeValue ?? 80) - 5),
      }) satisfies RpgLifeChangePayload,
  },
  {
    key: 'ban',
    group: '角色状态',
    label: '禁言',
    icon: '🔇',
    event: 'banStatus',
    btnClass: 'btn-error',
  },

  { key: 'pet-hatch', group: '宠物公会排行', label: '宠物孵化', icon: '🐾', event: 'petHatched' },
  {
    key: 'guild-join',
    group: '宠物公会排行',
    label: '公会新成员',
    icon: '🏰',
    event: 'guildEvent',
  },
  {
    key: 'rank-change',
    group: '宠物公会排行',
    label: '排行榜变动',
    icon: '🏅',
    event: 'rankChange',
  },
  {
    key: 'rank-first',
    group: '宠物公会排行',
    label: '周榜第 1',
    icon: '🥇',
    event: 'rankChange',
    btnClass: 'btn-warning',
    payload: () =>
      ({
        type: 'exp',
        period: 'week',
        rank: 1,
        score: 12800,
      }) satisfies RpgRankChangePayload,
  },
  {
    key: 'activity-start',
    group: '宠物公会排行',
    label: '活动开始',
    icon: '🎪',
    event: 'activityUpdate',
  },

  { key: 'site-notify', group: '站内通知', label: '新通知', icon: '🔔', event: 'siteNotification' },
];

/** 挡板是否覆盖全部 WS 事件类型 */
export function getRpgMockEventCoverage(): {
  event: RealtimeSocketEvent;
  covered: boolean;
  scenarioCount: number;
}[] {
  const counts = new Map<RealtimeSocketEvent, number>();
  for (const s of RPG_MOCK_SCENARIOS) {
    counts.set(s.event, (counts.get(s.event) ?? 0) + 1);
  }
  return RPG_ALL_WS_EVENTS.map(event => ({
    event,
    covered: counts.has(event),
    scenarioCount: counts.get(event) ?? 0,
  }));
}

/** 按 group 分组，供面板渲染 */
export function groupRpgMockScenarios(
  scenarios: RpgMockScenario[] = RPG_MOCK_SCENARIOS,
): { title: string; items: RpgMockScenario[] }[] {
  const order: string[] = [];
  const map = new Map<string, RpgMockScenario[]>();
  for (const s of scenarios) {
    if (!map.has(s.group)) {
      map.set(s.group, []);
      order.push(s.group);
    }
    map.get(s.group)!.push(s);
  }
  return order.map(title => ({ title, items: map.get(title)! }));
}

/** 读取抽奖联动挡板（仅开发环境 /rpg 页使用） */
export function getLotteryDrawMockKey(): string {
  if (!import.meta.dev || !import.meta.client) return 'off';

  const route = useRoute();
  const queryMock = route.query.mockLotteryDraw;
  if (typeof queryMock === 'string' && queryMock) return queryMock;
  if (route.query.mockLevelUp === '1') return 'level-up';

  const stored = localStorage.getItem(RPG_MOCK_LOTTERY_DRAW_KEY);
  if (stored) return stored;
  if (localStorage.getItem(RPG_MOCK_LOTTERY_LEVEL_UP_KEY) === '1') return 'level-up';
  return 'off';
}

/** 持久化抽奖联动挡板选项到 localStorage */
export function setLotteryDrawMockKey(key: string): void {
  if (!import.meta.dev || !import.meta.client) return;
  localStorage.setItem(RPG_MOCK_LOTTERY_DRAW_KEY, key);
  if (key === 'level-up') {
    localStorage.setItem(RPG_MOCK_LOTTERY_LEVEL_UP_KEY, '1');
  }
  else {
    localStorage.removeItem(RPG_MOCK_LOTTERY_LEVEL_UP_KEY);
  }
}

/** 根据 key 查找联动选项配置，未知 key 回退 off */
export function getLotteryDrawMockOption(key = getLotteryDrawMockKey()): RpgLotteryDrawMockOption {
  return (
    RPG_LOTTERY_DRAW_MOCK_OPTIONS.find(o => o.key === key) ?? RPG_LOTTERY_DRAW_MOCK_OPTIONS[0]!
  );
}

/**
 * 抽奖 API 完成后延迟注入挡板（模拟 WS 推送时机，便于测与 DrawOverlay 层叠）
 * @param delayMs 默认 600ms，通常落在滚轮/揭晓阶段
 */
export function triggerMockAfterLotteryDraw(status: RpgStatus | null, delayMs = 600): void {
  if (!import.meta.dev || !import.meta.client) return;
  const option = getLotteryDrawMockOption();
  if (option.kind === 'off') return;

  window.setTimeout(() => {
    if (option.kind === 'recharge') {
      useRpgRecharge().openDynamicRechargeModal();
      messageInfo('[抽奖联动] 钻石充值弹窗');
      return;
    }
    const scenario = RPG_MOCK_SCENARIOS.find(s => s.key === option.scenarioKey);
    if (scenario) {
      runRpgMockScenario(scenario, { status });
    }
  }, delayMs);
}

/** @deprecated 使用 getLotteryDrawMockKey / setLotteryDrawMockKey */
export function isMockLotteryLevelUpEnabled(): boolean {
  return getLotteryDrawMockKey() === 'level-up';
}

/** @deprecated 使用 setLotteryDrawMockKey */
export function setMockLotteryLevelUpEnabled(enabled: boolean): void {
  setLotteryDrawMockKey(enabled ? 'level-up' : 'off');
}

/** @deprecated 使用 triggerMockAfterLotteryDraw */
export function triggerMockLevelUpAfterLottery(status: RpgStatus | null, delayMs = 600): void {
  triggerMockAfterLotteryDraw(status, delayMs);
}
